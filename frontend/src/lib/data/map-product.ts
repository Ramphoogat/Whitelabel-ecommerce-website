import type { Product } from "./products";
import type { RawProduct, RawProductDetail } from "@/lib/api/catalog.api";

const FALLBACK_TONES = ["#d8c9b3", "#cbb99f", "#3a4a5c", "#a58f6f", "#c7b492", "#8f8574"];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1602302347331-d03360fc5f2b";

function toneFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return FALLBACK_TONES[hash % FALLBACK_TONES.length];
}

/** List view has no variants loaded — show a starting-from price, one placeholder colour/size. */
export function mapListProduct(raw: RawProduct): Product {
  return {
    slug: raw.slug,
    name: raw.title,
    category: (raw.attributes?.category as string) || raw.brand || "Shop",
    price: raw.fromPriceCents ?? 0,
    colors: [{ name: "Default", hex: toneFor(raw._id) }],
    sizes: ["One Size"],
    tone: toneFor(raw._id),
    image: raw.images[0] || FALLBACK_IMAGE,
  };
}

/** Detail view aggregates variant options into the colour/size pickers the PDP expects. */
export function mapDetailProduct(raw: RawProductDetail): Product {
  const activeVariants = raw.variants.filter((v) => v.isActive);
  const colorNames = Array.from(new Set(activeVariants.map((v) => v.options.color).filter(Boolean)));
  const sizeNames = Array.from(new Set(activeVariants.map((v) => v.options.size).filter(Boolean)));

  const cheapest = activeVariants.reduce<RawProductDetail["variants"][number] | null>(
    (min, v) => (!min || v.priceCents < min.priceCents ? v : min),
    null,
  );

  return {
    slug: raw.slug,
    name: raw.title,
    category: (raw.attributes?.category as string) || raw.brand || "Shop",
    price: cheapest?.priceCents ?? 0,
    compareAtPrice: cheapest?.compareAtPriceCents ?? undefined,
    colors: colorNames.length
      ? colorNames.map((name) => ({ name, hex: toneFor(name) }))
      : [{ name: "Default", hex: toneFor(raw._id) }],
    sizes: sizeNames.length ? sizeNames : ["One Size"],
    tone: toneFor(raw._id),
    image: raw.images[0] || cheapest?.imageUrl || FALLBACK_IMAGE,
  };
}
