"use client";

import { Cog, Sparkles } from "lucide-react";
import { CatalogProduct } from "~~/constants/catalog";

type CatalogSeederBannerProps = {
  missing: CatalogProduct[];
  isSeeding: boolean;
  seedingSlug: string | null;
  onSeed: (product: CatalogProduct) => void;
  onSeedAll: () => void;
};

export const CatalogSeederBanner = ({
  missing,
  isSeeding,
  seedingSlug,
  onSeed,
  onSeedAll,
}: CatalogSeederBannerProps) => {
  if (missing.length === 0) return null;

  return (
    <div className="mt-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-purple-950/30 to-black/40 p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-900/40 border border-amber-500/30">
          <Cog className="w-5 h-5 text-amber-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-amber-200">Satıcı paneli — ilanları zincire yaz</h4>
          <p className="text-xs text-amber-300/70 mt-0.5">
            Aşağıdaki ürünler için %1 depozito ile tek seferlik ilan oluşturman gerekiyor. Alıcılar ancak ondan sonra
            satın alabilir.
          </p>
        </div>
        <button className="btn btn-warning btn-sm gap-1.5 font-bold" onClick={onSeedAll} disabled={isSeeding}>
          {isSeeding ? <span className="loading loading-spinner loading-xs" /> : <Sparkles className="w-3.5 h-3.5" />}
          Hepsini Yayınla
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {missing.map(product => {
          const isActive = seedingSlug === product.slug;
          return (
            <button
              key={product.slug}
              className="group flex items-center gap-3 rounded-xl border border-amber-500/20 bg-black/30 p-3 text-left transition hover:border-amber-400/50 hover:bg-black/50 disabled:opacity-60"
              onClick={() => onSeed(product)}
              disabled={isSeeding}
            >
              <span className="text-2xl">{product.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-100 truncate">{product.title}</p>
                <p className="text-[11px] text-amber-300/60">
                  {product.priceMon} MON · depozito {(Number(product.priceMon) / 100).toFixed(4)} MON
                </p>
              </div>
              {isActive ? (
                <span className="loading loading-spinner loading-xs text-amber-300" />
              ) : (
                <span className="text-[11px] font-semibold text-amber-300/70 group-hover:text-amber-200">
                  Yayınla →
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
