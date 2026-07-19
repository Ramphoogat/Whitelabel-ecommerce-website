export interface CmsPage {
  title: string;
  slug: string;
  status: "published" | "draft";
  updated: string;
}

export const CMS_PAGES: CmsPage[] = [
  { title: "About Us", slug: "about", status: "published", updated: "2026-06-02" },
  { title: "Returns & Exchanges", slug: "returns", status: "published", updated: "2026-05-18" },
  { title: "Contact", slug: "contact", status: "published", updated: "2026-04-30" },
  { title: "Size Guide", slug: "size-guide", status: "draft", updated: "2026-07-10" },
];

export interface BlogPost {
  title: string;
  slug: string;
  status: "published" | "draft";
  date: string;
}

export const BLOG_POSTS: BlogPost[] = [
  { title: "How We Source Our Linen", slug: "sourcing-linen", status: "published", date: "2026-06-20" },
  { title: "Caring for Selvedge Denim", slug: "denim-care", status: "published", date: "2026-05-05" },
  { title: "The Autumn Collection, Behind the Scenes", slug: "autumn-bts", status: "draft", date: "2026-07-15" },
];
