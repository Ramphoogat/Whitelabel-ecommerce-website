export interface Product {
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  colors: { name: string; hex: string }[];
  sizes: string[];
  tone: string; // fallback background shown while the image loads
  image: string; // Unsplash source, editorial-style
  new?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    slug: "field-overshirt",
    name: "Field Overshirt",
    category: "Outerwear",
    price: 4200,
    compareAtPrice: 5200,
    colors: [
      { name: "Clay", hex: "#bd5b39" },
      { name: "Bone", hex: "#e7dfd0" },
      { name: "Ink", hex: "#211d18" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    tone: "#d8c9b3",
    image: "https://images.unsplash.com/photo-1599715939861-36c598ae5568",
    new: true,
  },
  {
    slug: "washed-linen-shirt",
    name: "Washed Linen Shirt",
    category: "Shirts",
    price: 2800,
    colors: [
      { name: "Bone", hex: "#e7dfd0" },
      { name: "Moss", hex: "#5f6b4e" },
    ],
    sizes: ["S", "M", "L", "XL"],
    tone: "#cbb99f",
    image: "https://images.unsplash.com/photo-1617117475026-2eb3e68b63cf",
  },
  {
    slug: "selvedge-denim",
    name: "Selvedge Denim",
    category: "Denim",
    price: 5600,
    colors: [{ name: "Indigo", hex: "#33506b" }],
    sizes: ["28", "30", "32", "34", "36"],
    tone: "#3a4a5c",
    image: "https://images.unsplash.com/photo-1725387072845-7431bbc453bc",
    new: true,
  },
  {
    slug: "wool-crew",
    name: "Wool Crew Sweater",
    category: "Knitwear",
    price: 3900,
    colors: [
      { name: "Ink", hex: "#211d18" },
      { name: "Clay", hex: "#bd5b39" },
    ],
    sizes: ["XS", "S", "M", "L"],
    tone: "#a58f6f",
    image: "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f",
  },
  {
    slug: "canvas-tote",
    name: "Waxed Canvas Tote",
    category: "Accessories",
    price: 1800,
    colors: [{ name: "Bone", hex: "#e7dfd0" }],
    sizes: ["One Size"],
    tone: "#c7b492",
    image: "https://images.unsplash.com/photo-1574365569389-a10d488ca3fb",
  },
  {
    slug: "raw-hem-trouser",
    name: "Raw Hem Trouser",
    category: "Trousers",
    price: 3400,
    compareAtPrice: 4000,
    colors: [
      { name: "Ink", hex: "#211d18" },
      { name: "Moss", hex: "#5f6b4e" },
    ],
    sizes: ["28", "30", "32", "34"],
    tone: "#8f8574",
    image: "https://images.unsplash.com/photo-1622450180332-3da1126f10a4",
  },
];

/** Wide editorial shot for the homepage hero. */
export const HERO_IMAGE = "https://images.unsplash.com/photo-1602302347331-d03360fc5f2b";

export function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise);
}

/** Unsplash's dynamic resizing param API — one URL serves every size we need. */
export function unsplashUrl(base: string, width: number, quality = 75) {
  return `${base}?auto=format&fit=crop&w=${width}&q=${quality}`;
}
