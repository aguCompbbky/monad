import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ListingMeta = {
  title: string;
  features: string;
  createdAt: number;
};

type MarketplaceState = {
  listingMetaById: Record<number, ListingMeta>;
  revision: number;
  setListingMeta: (listingId: number, meta: ListingMeta) => void;
  bumpRevision: () => void;
};

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    set => ({
      listingMetaById: {},
      revision: 0,
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
    }),
    {
      // MVP: MonadDB yerine local persisted state (tarayici depolama) kullanilir.
      // Sadece eklenen urun metadata kayitlari tutulur.
      name: "monaddb-products",
      partialize: state => ({ listingMetaById: state.listingMetaById }),
      onRehydrateStorage: () => state => {
        if (!state) return;
        if (Object.keys(state.listingMetaById).length > 0) {
          state.bumpRevision();
        }
      },
    },
  ),
);
