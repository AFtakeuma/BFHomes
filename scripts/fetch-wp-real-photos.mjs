#!/usr/bin/env node
/**
 * Fetch before/after photos and gallery metadata from legacy WordPress (Sakura).
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

/** Display order matches legacy WP gallery (14 posts). */
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
  { id: 13, slug: "unit003" },
  { id: 14, slug: "unit004" },
];

function fullSizeUrl(url) {
  return url.replace(/-\d+x\d+(\.(jpe?g|png|webp|jfif))/i, "$1");
}

function curlGet(urlPath) {
  const url = urlPath.startsWith("http") ? urlPath : `${ORIGIN}${urlPath}`;
  return execFileSync(
    "curl",
    ["-sL", "-H", `Host: ${HOST}`, "-A", "BFHomes-migration/1.0", url],
    { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }
  );
}

function curlDownload(remotePath, localPath) {
  const url = remotePath.startsWith("http")
    ? remotePath
    : `${ORIGIN}${remotePath.startsWith("/") ? remotePath : `/${remotePath}`}`;
  execFileSync(
    "curl",
    ["-sL", "-H", `Host: ${HOST}`, "-A", "BFHomes-migration/1.0", "-o", localPath, url],
    { stdio: "pipe" }
  );
}

function normalizeWpPath(src) {
  let p = src;
  if (p.startsWith("https://before-after.homes")) {
    p = p.replace("https://before-after.homes", "");
  }
  return fullSizeUrl(p);
}

function parsePostPairs(html) {
  const pairs = [];
  const figures = html.match(/<figure class="wp-block-image[^"]*">[\s\S]*?<\/figure>/gi) || [];
  for (const fig of figures) {
    const capM = fig.match(/<figcaption[^>]*>([^<]+)<\/figcaption>/i);
    const srcM = fig.match(/src="([^"]+)"/);
    if (!srcM) continue;
    const cap = (capM?.[1] || "").trim();
    pairs.push({ cap, path: normalizeWpPath(srcM[1]) });
  }
  const before = pairs.find((p) => /^before$/i.test(p.cap));
  const after = pairs.find((p) => /^after$/i.test(p.cap));
  if (before && after) return { before: before.path, after: after.path };
  return null;
}

function parseWorkItems(html) {
  const listMatch = html.match(/<ul class="wp-block-list">([\s\S]*?)<\/ul>/i);
  if (!listMatch) return [];
  const items = [];
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = liRe.exec(listMatch[1]))) {
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    if (text) items.push(text);
  }
  return items;
}

function categoryFromSlug(slug) {
  if (slug.startsWith("livingkitchen")) return "livingkitchen";
  if (slug.startsWith("living")) return "living";
  if (slug.startsWith("kitchen")) return "kitchen";
  if (slug.startsWith("bathroom")) return "bathroom";
  if (slug.startsWith("washroom")) return "washroom";
  if (slug.startsWith("veranda")) return "veranda";
  if (slug.startsWith("toilet")) return "toilet";
  if (slug.startsWith("door")) return "door";
  if (slug.startsWith("room")) return "room";
  if (slug.startsWith("unit")) return "unit";
  return "other";
}

function formatDateJa(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const posts = JSON.parse(
    curlGet("/wp-json/wp/v2/posts?per_page=100&_fields=slug,title,content,date")
  );

  const bySlug = {};
  for (const post of posts) {
    const html = post.content?.rendered || "";
    const pair = parsePostPairs(html);
    if (!pair) continue;
    bySlug[post.slug] = {
      ...pair,
      title: post.title?.rendered || post.slug,
      date: post.date,
      workItems: parseWorkItems(html),
    };
  }

  const manifest = { projects: {}, extras: {} };
  const galleryProjects = [];
  let downloadCount = 0;

  for (const { id, slug } of PROJECT_MAP) {
    const meta = bySlug[slug];
    if (!meta) {
      console.warn(`Missing WP pair for ${slug}`);
      continue;
    }
    const beforeName = `project-${String(id).padStart(2, "0")}-before.jpg`;
    const afterName = `project-${String(id).padStart(2, "0")}-after.jpg`;
    curlDownload(meta.before, path.join(OUT_DIR, beforeName));
    curlDownload(meta.after, path.join(OUT_DIR, afterName));
    downloadCount += 2;

    const beforePath = `/images/real/${beforeName}`;
    const afterPath = `/images/real/${afterName}`;
    manifest.projects[id] = { slug, before: beforePath, after: afterPath };

    const workItems = meta.workItems;
    const description =
      workItems.length > 0
        ? `行った作業内容: ${workItems.join("、")}`
        : "旧サイト掲載の施工ビフォーアフター事例です。";

    galleryProjects.push({
      id,
      slug,
      title: meta.title,
      category: categoryFromSlug(slug),
      before: beforePath,
      after: afterPath,
      description,
      workItems,
      date: formatDateJa(meta.date),
      featured: id <= 3,
    });
  }

  const extraDownloads = [
    { key: "hero-living", wp: bySlug.living001?.after, file: "hero-living-after.jpg" },
    { key: "hero-kitchen", wp: bySlug.kitchen001?.after, file: "hero-kitchen-after.jpg" },
    { key: "hero-bathroom", wp: bySlug.bathroom001?.after, file: "hero-bathroom-after.jpg" },
    {
      key: "about-team",
      wp: "/wp-content/uploads/2022/02/20220227-A7306142_TP_V.jpg",
      file: "about-team.jpg",
    },
  ];

  for (const ex of extraDownloads) {
    if (!ex.wp) continue;
    curlDownload(ex.wp, path.join(OUT_DIR, ex.file));
    downloadCount += 1;
    manifest.extras[ex.key] = `/images/real/${ex.file}`;
  }

  manifest.extras.favicon = manifest.projects[1]?.after || "/images/real/hero-living-after.jpg";

  await writeFile(
    path.join(ROOT, "app", "data", "real-photos-manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n"
  );
  await writeFile(
    path.join(ROOT, "app", "data", "gallery-projects.json"),
    JSON.stringify({ projects: galleryProjects }, null, 2) + "\n"
  );

  console.log(
    JSON.stringify({
      downloadCount,
      projectCount: Object.keys(manifest.projects).length,
      galleryCount: galleryProjects.length,
    })
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
