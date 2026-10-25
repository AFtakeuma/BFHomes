import galleryData from "../data/gallery-projects.json";
import manifest from "../data/real-photos-manifest.json";

export type GalleryCategory =
  | "living"
  | "kitchen"
  | "bathroom"
  | "room"
  | "door"
  | "livingkitchen"
  | "unit"
  | "washroom"
  | "veranda"
  | "toilet"
  | "other";

export interface GalleryProject {
  id: number;
  slug: string;
  title: string;
  category: GalleryCategory;
  before: string;
  after: string;
  description: string;
  workItems: string[];
  date: string;
  featured: boolean;
}

export const GALLERY_CATEGORIES: {
  id: GalleryCategory | "all";
  name: string;
  icon: string;
}[] = [
  { id: "all", name: "すべて", icon: "ri-home-line" },
  { id: "living", name: "リビング", icon: "ri-sofa-line" },
  { id: "kitchen", name: "キッチン", icon: "ri-restaurant-line" },
  { id: "bathroom", name: "浴室", icon: "ri-drop-line" },
  { id: "room", name: "部屋", icon: "ri-door-line" },
  { id: "door", name: "扉", icon: "ri-door-lock-line" },
  { id: "livingkitchen", name: "リビングキッチン", icon: "ri-home-8-line" },
  { id: "unit", name: "ユニットバス", icon: "ri-bath-line" },
  { id: "washroom", name: "洗面所", icon: "ri-water-flash-line" },
  { id: "veranda", name: "ベランダ", icon: "ri-sun-line" },
  { id: "toilet", name: "トイレ", icon: "ri-home-gear-line" },
];

const projects = galleryData.projects as GalleryProject[];

const manifestProjects = manifest.projects as Record<
  string,
  { slug: string; before: string; after: string }
>;

/** Ensure manifest image paths match gallery entries (build-time sanity). */
for (const p of projects) {
  const m = manifestProjects[String(p.id)];
  if (m && (m.before !== p.before || m.after !== p.after)) {
    throw new Error(`Manifest mismatch for project ${p.id} (${p.slug})`);
  }
}

export function getGalleryProjects(): GalleryProject[] {
  return projects;
}

export function getGalleryProjectById(id: number): GalleryProject | undefined {
  return projects.find((p) => p.id === id);
}

export function getSimilarProjects(project: GalleryProject, limit = 3): GalleryProject[] {
  return projects.filter((p) => p.id !== project.id && p.category === project.category).slice(0, limit);
}

export function categoryLabel(category: GalleryCategory): string {
  return GALLERY_CATEGORIES.find((c) => c.id === category)?.name ?? category;
}
