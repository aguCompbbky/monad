"use client";

import { useState } from "react";
import { KeyRound, Package } from "lucide-react";
import { Listing } from "~~/types/marketplace";

type PendingDeliveryCardProps = {
  listing: Listing;
  isConfirming: boolean;
  onConfirm: (listingId: number, pin: string) => void;
};

export const PendingDeliveryCard = ({ listing, isConfirming, onConfirm }: PendingDeliveryCardProps) => {
  const [pin, setPin] = useState("");

  return (
    <div className="neon-card glass-card rounded-2xl p-5 border border-yellow-700/30 hover:border-yellow-500/50 transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-xl bg-yellow-950/50 border border-yellow-700/30">
          <Package className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white line-clamp-1">{listing.title}</h3>
          <p className="text-xs text-yellow-400/70 flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
            Kargo yolda — teslim alınca onayla
          </p>
        </div>
      </div>

      {/* PIN input area */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs text-purple-300/70 font-medium flex items-center gap-1 mb-1.5">
            <KeyRound className="w-3 h-3" />
            Teslimat PIN Kodu (6 hane)
          </span>
          <input
            className="input input-bordered w-full bg-black/40 border-purple-700/40 text-center text-xl font-mono tracking-[0.4em] placeholder:text-purple-700/40"
            placeholder="••••••"
            value={pin}
            maxLength={6}
            onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        </label>

        {/* PIN progress dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i < pin.length ? "bg-purple-400 shadow-[0_0_6px_2px_rgba(131,110,249,0.7)]" : "bg-purple-900/50"
              }`}
            />
          ))}
        </div>

        <button
          className="btn btn-primary w-full font-bold gap-2"
          disabled={isConfirming || pin.length !== 6}
          onClick={() => onConfirm(listing.id, pin)}
        >
          {isConfirming ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Onaylanıyor...
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              PIN Gir ve Onayla
            </>
          )}
        </button>
      </div>
    </div>
  );
};
