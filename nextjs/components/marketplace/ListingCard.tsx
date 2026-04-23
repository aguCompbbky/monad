"use client";

import { ShoppingCart, User } from "lucide-react";
import { formatEther } from "viem";
import { SELLER_DISPLAY_NAMES } from "~~/constants";
import { Listing } from "~~/types/marketplace";
import { formatAddress } from "~~/utils/formatAddress";

type ListingCardProps = {
  listing: Listing;
  onBuy: (listing: Listing) => void;
  isBuying: boolean;
  isOwner?: boolean;
};

const statusConfig: Record<number, { label: string; color: string }> = {
  0: { label: "Satışta", color: "text-green-400 border-green-500/30 bg-green-950/40" },
  1: { label: "Kargoda", color: "text-yellow-400 border-yellow-500/30 bg-yellow-950/40" },
  2: { label: "Tamamlandı", color: "text-purple-400 border-purple-500/30 bg-purple-950/40" },
  3: { label: "İptal", color: "text-red-400 border-red-500/30 bg-red-950/40" },
};

export const ListingCard = ({ listing, onBuy, isBuying, isOwner = false }: ListingCardProps) => {
  const status = statusConfig[listing.status] ?? statusConfig[0];
  const priceEth = formatEther(listing.priceWei);

  return (
    <div
      className={`group neon-card glass-card rounded-2xl p-5 flex flex-col gap-3 animate-appear-up relative overflow-hidden ${
        isOwner ? "border-violet-500/40" : ""
      }`}
    >
      {/* Owner stripe */}
      {isOwner && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-transparent" />
      )}

      {/* Top row: title + badges */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-base sm:text-lg text-white leading-tight line-clamp-2 group-hover:text-purple-200 transition-colors">
          {listing.title}
        </h3>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {isOwner && (
            <span className="status-badge text-[10px] text-violet-300 border border-violet-500/40 bg-violet-950/60">
              ✦ Senin ilanın
            </span>
          )}
          <span className={`status-badge border ${status.color} animate-badge-bounce`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Features */}
      {listing.features && (
        <p className="text-xs text-purple-300/60 line-clamp-2 leading-relaxed">
          {listing.features}
        </p>
      )}

      {/* Seller */}
      <div className="flex items-center gap-1.5 text-xs text-purple-400/70">
        <User className="w-3 h-3 shrink-0" />
        <span className="font-mono">
          {isOwner
            ? "Sen"
            : SELLER_DISPLAY_NAMES[listing.seller.toLowerCase()] ?? formatAddress(listing.seller)}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-purple-800/30" />

      {/* Price + Buy */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-purple-400/60 mb-0.5">Fiyat</p>
          <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300 neon-text">
            {priceEth}
            <span className="text-sm font-bold text-purple-400 ml-1">MON</span>
          </p>
        </div>

        {isOwner ? (
          <span className="text-xs px-3 py-1.5 rounded-full bg-violet-900/30 border border-violet-700/30 text-violet-300 font-medium">
            İlan Aktif
          </span>
        ) : listing.status === 0 ? (
          <div className="buy-btn-wrapper">
            <button
              className="btn btn-secondary btn-sm gap-1.5 font-bold"
              onClick={() => onBuy(listing)}
              disabled={isBuying}
            >
              {isBuying ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" />
              )}
              {isBuying ? "Bekleniyor..." : "Satın Al"}
            </button>
          </div>
        ) : (
          <span className="text-xs text-purple-400/50 italic">İşlemde</span>
        )}
      </div>

      {/* Listing ID watermark */}
      <div className="absolute bottom-2 right-3 text-[10px] font-mono text-purple-700/30 pointer-events-none">
        #{listing.id}
      </div>
    </div>
  );
};
