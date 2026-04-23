import { parseEther } from "viem";

export const MVP_SELLER_ADDRESS = "0xd7a9251D72A390246818cC991E3d811BD090c522" as `0x${string}`;

export type CatalogSlug = "iphone-14" | "macbook-m2-pro" | "scooter";

export type CatalogProduct = {
  slug: CatalogSlug;
  title: string;
  features: string;
  icon: string;
  accent: string;
  priceMon: string;
  priceWei: bigint;
};

export const CATALOG: CatalogProduct[] = [
  {
    slug: "iphone-14",
    title: "iPhone 14",
    features: "128GB · Mavi · Kutulu · Faturalı · Çiziksiz",
    icon: "📱",
    accent: "from-sky-500/40 via-indigo-500/30 to-fuchsia-500/30",
    priceMon: "0.05",
    priceWei: parseEther("0.05"),
  },
  {
    slug: "macbook-m2-pro",
    title: "MacBook Pro M2",
    features: "14 inch · 16GB RAM · 512GB SSD · Space Gray · AppleCare+",
    icon: "💻",
    accent: "from-fuchsia-500/40 via-purple-500/30 to-violet-500/30",
    priceMon: "0.1",
    priceWei: parseEther("0.1"),
  },
  {
    slug: "scooter",
    title: "Xiaomi Mi Electric Scooter 3",
    features: "30km menzil · 25 km/s · Hafif kullanılmış · Şarj aleti dahil",
    icon: "🛴",
    accent: "from-emerald-500/40 via-teal-500/30 to-cyan-500/30",
    priceMon: "0.03",
    priceWei: parseEther("0.03"),
  },
];

export const findCatalogBySlug = (slug: CatalogSlug): CatalogProduct | undefined =>
  CATALOG.find(product => product.slug === slug);
