import { create } from "zustand";

export type ListingMeta = {
  title: string;
  features: string;
  createdAt: number;
  pin?: string;
};

type MarketplaceState = {
  listingMetaById: Record<number, ListingMeta>;
  revision: number;
  setProducts: (products: Record<number, ListingMeta>) => void;
  setListingMeta: (listingId: number, meta: ListingMeta) => void;
  bumpRevision: () => void;
};

export const useMarketplaceStore = create<MarketplaceState>(set => ({
  listingMetaById: {},
  revision: 0,
  setProducts: products =>
    set(state => ({
      listingMetaById: products,
      revision: state.revision + 1,
    })),
  setListingMeta: (listingId, meta) =>
    set(state => ({
      listingMetaById: {
        ...state.listingMetaById,
        [listingId]: meta,
      },
      revision: state.revision + 1,
    })),
  bumpRevision: () =>
    set(state => ({
      revision: state.revision + 1,
    })),
}));
