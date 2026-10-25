#!/usr/bin/env node
/**
 * Fetch before/after photos from legacy WordPress (Sakura) into public/images/real/
 */
import { mkdir, writeFile } from "fs/promises";
import { execFileSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "images", "real");
const HOST = "before-after.homes";
const ORIGIN = "http://219.94.163.146";

const PROJECT_MAP = [
  { id: 1, slug: "living001" },
  { id: 2, slug: "kitchen001" },
  { id: 3, slug: "bathroom001" },
  { id: 4, slug: "room001" },
  { id: 5, slug: "door001" },
  { id: 6, slug: "livingkitchen001" },
  { id: 7, slug: "room002" },
  { id: 8, slug: "unit001" },
  { id: 9, slug: "washroom001" },
  { id: 10, slug: "veranda001" },
  { id: 11, slug: "unit002" },
  { id: 12, slug: "toilet001" },
];

function fullSizeUrl(url) {
  return url.replace(/-\d+x\d+(\.(jpe?g|png|webp|jfif))/i, "$1");
}

function curlGet(urlPath) {
  const url = urlPath.startsWith("http") ? urlPath : `${ORIGIN}${urlPath}`;
  const out = execFileSync(
    "curl",
    ["-sL", "-H", `Host: ${HOST}`, "-A", "BFHomes-migration/1.0", url],
    { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }
  );
  return out;
}

function curlDownload(remotePath, localPath) {
  const url = `${ORIGIN}${remotePath}`;
  execFileSync(
    "curl",
    ["-sL", "-H", `Host: ${HOST}`, "-A", "BFHomes-migration/1.0", "-o", localPath, url],
    { stdio: "pipe" }
  );
}

function parsePostPairs(html) {
  const pairs = [];
  const figures = html.match(/<figure class="wp-block-image[^"]*">[\s\S]*?<\/figure>/gi) || [];
  for (const fig of figures) {
    const capM = fig.match(/<figcaption[^>]*>([^<]+)<\/figcaption>/i);
    const srcM = fig.match(/src="([^"]+)"/);
    if (!srcM) continue;
    const cap = (capM?.[1] || "").trim();
    let src = srcM[1];
    if (src.includes("before-after.homes")) {
      src = src.replace("https://before-after.homes", "");
    }
    pairs.push({ cap, path: fullSizeUrl(src.replace("https://before-after.homes", "")) });
  }
  const before = pairs.find((p) => /^before$/i.test(p.cap));
  const after = pairs.find((p) => /^after$/i.test(p.cap));
  if (before && after) return { before: before.path, after: after.path };
  return null;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const posts = JSON.parse(
    curlGet("/wp-json/wp/v2/posts?per_page=100&_fields=slug,content")
  );

  const bySlug = {};
  for (const post of posts) {
    const html = post.content?.rendered || "";
    const pair = parsePostPairs(html);
    if (pair) bySlug[post.slug] = pair;
  }

  const manifest = { projects: {}, extras: {} };
  let downloadCount = 0;

  for (const { id, slug } of PROJECT_MAP) {
    const pair = bySlug[slug];
    if (!pair) {
      console.warn(`Missing WP pair for ${slug}`);
      continue;
    }
    const beforeName = `project-${String(id).padStart(2, "0")}-before.jpg`;
    const afterName = `project-${String(id).padStart(2, "0")}-after.jpg`;
    curlDownload(pair.before, path.join(OUT_DIR, beforeName));
    curlDownload(pair.after, path.join(OUT_DIR, afterName));
    downloadCount += 2;
    manifest.projects[id] = {
      slug,
      before: `/images/real/${beforeName}`,
      after: `/images/real/${afterName}`,
    };
  }

  const extraDownloads = [
    { key: "hero-living", wp: bySlug.living001?.after, file: "hero-living-after.jpg" },
    { key: "hero-kitchen", wp: bySlug.kitchen001?.after, file: "hero-kitchen-after.jpg" },
    { key: "hero-bathroom", wp: bySlug.bathroom001?.after, file: "hero-bathroom-after.jpg" },
    { key: "about-team", wp: "/wp-content/uploads/2022/02/20220227-A7306142_TP_V.jpg", file: "about-team.jpg" },
  ];

  for (const ex of extraDownloads) {
    if (!ex.wp) continue;
    const remote = ex.wp.startsWith("/") ? ex.wp : ex.wp;
    curlDownload(remote, path.join(OUT_DIR, ex.file));
    downloadCount += 1;
    manifest.extras[ex.key] = `/images/real/${ex.file}`;
  }

  // Favicon from a square crop source — use living after as brand mark fallback
  const faviconSrc = manifest.projects[1]?.after?.replace(/^\//, "") || "images/real/hero-living-after.jpg";
  manifest.extras.favicon = `/${faviconSrc}`;

  await writeFile(
    path.join(ROOT, "app", "data", "real-photos-manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log(JSON.stringify({ downloadCount, projectCount: Object.keys(manifest.projects).length }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
