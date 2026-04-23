"use client";

import { Clock, ShieldCheck, ShoppingCart, User } from "lucide-react";
import { CatalogProduct } from "~~/constants/catalog";
import { formatAddress } from "~~/utils/formatAddress";

type CatalogCardState = "ready" | "unavailable" | "in-delivery" | "sold";

export type CatalogCardData = {
  product: CatalogProduct;
  listingId: number | null;
  state: CatalogCardState;
  seller: `0x${string}`;
};

type CatalogCardProps = {
  data: CatalogCardData;
  isBuying: boolean;
  buyingSlug: string | null;
  onBuy: (data: CatalogCardData) => void;
};

const stateConfig: Record<CatalogCardState, { label: string; className: string }> = {
  ready: { label: "Satışta", className: "text-green-400 border-green-500/30 bg-green-950/40" },
  "in-delivery": { label: "Kargoda", className: "text-yellow-400 border-yellow-500/30 bg-yellow-950/40" },
  sold: { label: "Tamamlandı", className: "text-purple-400 border-purple-500/30 bg-purple-950/40" },
  unavailable: { label: "Hazırlanıyor", className: "text-slate-300 border-slate-500/30 bg-slate-950/40" },
};

export const CatalogCard = ({ data, isBuying, buyingSlug, onBuy }: CatalogCardProps) => {
  const { product, state, seller, listingId } = data;
  const badge = stateConfig[state];
  const isCurrentlyBuying = isBuying && buyingSlug === product.slug;

  return (
    <div className="group neon-card glass-card relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4 animate-appear-up">
      <div
        className={`absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-60 bg-gradient-to-br ${product.accent} pointer-events-none`}
      />

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="text-4xl sm:text-5xl drop-shadow-[0_0_10px_rgba(131,110,249,0.5)]">{product.icon}</div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white leading-tight line-clamp-2 group-hover:text-purple-200 transition-colors">
              {product.title}
            </h3>
            <p className="text-[11px] uppercase tracking-widest text-purple-400/60 mt-0.5">{product.slug}</p>
          </div>
        </div>
        <span className={`status-badge shrink-0 border ${badge.className}`}>{badge.label}</span>
      </div>

      <p className="relative text-xs text-purple-300/70 leading-relaxed line-clamp-3">{product.features}</p>

      <div className="relative flex items-center gap-1.5 text-xs text-purple-400/70">
        <User className="w-3 h-3 shrink-0" />
        <span className="font-mono">{formatAddress(seller)}</span>
        <span className="ml-auto flex items-center gap-1 text-[11px] text-purple-400/60">
          <ShieldCheck className="w-3 h-3" /> Escrow
        </span>
      </div>

      <div className="relative border-t border-purple-800/30" />

      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-purple-400/60 mb-0.5">Fiyat</p>
          <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300 neon-text">
            {product.priceMon}
            <span className="text-sm font-bold text-purple-400 ml-1">MON</span>
          </p>
        </div>

        {state === "ready" && (
          <button
            className="btn btn-secondary btn-sm gap-1.5 font-bold"
            onClick={() => onBuy(data)}
            disabled={isBuying && !isCurrentlyBuying}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Satın Al
          </button>
        )}

        {state === "in-delivery" && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-yellow-300">
            <Clock className="w-3.5 h-3.5 animate-spin-slow" />
            Kargo yolda
          </span>
        )}

        {state === "sold" && <span className="text-xs font-semibold text-purple-300">✅ Tamamlandı</span>}

        {state === "unavailable" && <span className="text-xs italic text-slate-300/70">Hazırlanıyor…</span>}
      </div>

      {listingId !== null && (
        <div className="absolute top-3 right-3 text-[10px] font-mono text-purple-700/40 pointer-events-none">
          #{listingId}
        </div>
      )}
    </div>
  );
};
