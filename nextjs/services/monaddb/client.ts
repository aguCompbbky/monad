import { ListingMeta } from "~~/services/store/marketplaceStore";

type MonadDbProductPayload = {
  listingId: number;
  title: string;
  features: string;
};

export const fetchMonadDbProducts = async (): Promise<Record<number, ListingMeta>> => {
  const response = await fetch("/api/monaddb/products", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("MonadDB urunleri alinamadi.");
  }
  const data = (await response.json()) as { products: Record<number, ListingMeta> };
  return data.products || {};
};

export const saveMonadDbProduct = async (payload: MonadDbProductPayload): Promise<Record<number, ListingMeta>> => {
  const response = await fetch("/api/monaddb/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("MonadDB urun kaydi basarisiz.");
  }
  const data = (await response.json()) as { products: Record<number, ListingMeta> };
  return data.products || {};
};
