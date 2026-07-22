export interface CmsPage {
  title: string;
  slug: string;
  status: "published" | "draft";
  updated: string;
  content?: string;
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
  author?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    title: "How We Source Our Linen",
    slug: "sourcing-linen",
    status: "published",
    date: "2026-06-20",
    author: "Aldergate Studio",
    excerpt: "Every metre of linen in our collection starts with a single question: who grew it? We trace our fabric back to the fields of Normandy and coastal Belgium, where linen has been grown the same way for three centuries.",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
    content: `We spend a lot of time thinking about where things come from.

For our linen, that means travelling to Normandy every spring to meet the farmers who grow the flax. Linen is one of the oldest textiles on earth — and one of the most demanding to produce well. The flax plant must be harvested at exactly the right moment, then retted (soaked) slowly in the fields for weeks to soften the fibres without weakening them.

The result is a fabric that gets better with every wash. Unlike synthetic blends or even some cotton weaves, properly sourced linen becomes softer and more characterful over time. The slight irregularities you notice in the weave — that's not a flaw. That's the plant.

We work with two mills in the region who have been producing for over a hundred years. Neither of them works with fast-fashion brands. They're selective, and so are we.

When you buy a linen piece from us, you're buying something that started in a field, not a factory.`,
  },
  {
    title: "Caring for Selvedge Denim",
    slug: "denim-care",
    status: "published",
    date: "2026-05-05",
    author: "Aldergate Studio",
    excerpt: "Selvedge denim is made to fade on your terms — but only if you treat it right. Here's exactly how we recommend breaking in and maintaining the denim we make.",
    coverImage: "https://images.unsplash.com/photo-1725387072845-7431bbc453bc",
    content: `The first rule of selvedge denim: don't wash it for at least six months.

That sounds extreme, but it's the key to getting a personalised fade. The indigo dye in raw denim sits on the surface of the fibre. Every time you wear the jeans, the dye rubs off at the points of contact — the seat, the thighs, behind the knees. Over months, this creates a fade pattern that's entirely yours. Wash them early, and you reset the process.

**Breaking in**

Wear them as much as possible in the first three months. Sit cross-legged on the floor. Cycle. Kneel in the garden. The more movement, the better the whiskers (the fan-shaped fades at the hips and knees).

**The first wash**

When you're ready to wash — turn them inside out, use cold water, and hand wash or use a delicates cycle with a small amount of non-detergent soap. Hang to dry in the shade. Never tumble dry.

**Going forward**

After the first wash, you can wash them every few months as needed. The fade will continue to develop for years. A good pair of selvedge jeans, properly cared for, can last a decade or more.

These are not throwaway trousers. Treat them accordingly.`,
  },
  {
    title: "The Autumn Collection, Behind the Scenes",
    slug: "autumn-bts",
    status: "draft",
    date: "2026-07-15",
    author: "Aldergate Studio",
    excerpt: "A look at how this season's collection came together — from the first sketch to the final fitting.",
    coverImage: "https://images.unsplash.com/photo-1602302347331-d03360fc5f2b",
    content: `This post is still being written. Check back soon.`,
  },
];
