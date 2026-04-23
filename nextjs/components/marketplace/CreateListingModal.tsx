"use client";

import { useEffect } from "react";
import { KeyRound, Package, Tag, X } from "lucide-react";

type CreateListingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  features: string;
  priceMon: string;
  pin: string;
  isCreating: boolean;
  onTitleChange: (value: string) => void;
  onFeaturesChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onPinChange: (value: string) => void;
  onSubmit: () => void;
};

export const CreateListingModal = ({
  isOpen,
  onClose,
  title,
  features,
  priceMon,
  pin,
  isCreating,
  onTitleChange,
  onFeaturesChange,
  onPriceChange,
  onPinChange,
  onSubmit,
}: CreateListingModalProps) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isCreating) onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, isCreating, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !isCreating && onClose()}
      />

      {/* Modal panel */}
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950 via-[#0d052a] to-black shadow-2xl shadow-purple-900/40 animate-appear-up overflow-hidden">
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <div>
            <h3 className="text-xl font-black text-white">Yeni İlan Oluştur</h3>
            <p className="text-xs text-purple-400/60 mt-0.5">Ürününü zincire yaz, güvenli sat</p>
          </div>
          <button
            className="btn btn-ghost btn-sm btn-circle text-purple-400 hover:text-white"
            onClick={onClose}
            disabled={isCreating}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-300/80 mb-1.5">
              <Package className="w-3.5 h-3.5" /> Ürün Adı
            </span>
            <input
              className="input input-bordered w-full bg-black/40 border-purple-700/30 focus:border-purple-500/60"
              placeholder="örnek: iPhone 13 Pro"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-300/80 mb-1.5">
              <Tag className="w-3.5 h-3.5" /> Ürün Özellikleri
            </span>
            <textarea
              className="textarea textarea-bordered w-full bg-black/40 border-purple-700/30 focus:border-purple-500/60 min-h-20 resize-none"
              placeholder="128GB, kutulu, çiziksiz..."
              value={features}
              onChange={e => onFeaturesChange(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-300/80 mb-1.5">
              <span className="text-xs font-black text-fuchsia-400">MON</span> Fiyat
            </span>
            <div className="relative">
              <input
                className="input input-bordered w-full bg-black/40 border-purple-700/30 focus:border-purple-500/60 pr-14"
                placeholder="0.0"
                value={priceMon}
                onChange={e => onPriceChange(e.target.value)}
                type="number"
                min="0"
                step="any"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-400 pointer-events-none">
                MON
              </span>
            </div>
            {priceMon && (
              <p className="text-xs text-purple-400/50 mt-1">
                Depozito: {(parseFloat(priceMon) / 100).toFixed(4)} MON (%1)
              </p>
            )}
          </label>

          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-300/80 mb-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Teslimat PIN (6 hane)
            </span>
            <input
              className="input input-bordered w-full bg-black/40 border-purple-700/30 focus:border-purple-500/60 font-mono text-center tracking-[0.4em]"
              placeholder="••••••"
              value={pin}
              maxLength={6}
              onChange={e => onPinChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            {/* PIN dots */}
            <div className="flex justify-center gap-2 mt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i < pin.length ? "bg-purple-400 shadow-[0_0_4px_rgba(131,110,249,0.8)]" : "bg-purple-900/50"
                  }`}
                />
              ))}
            </div>
          </label>

          <p className="text-xs text-purple-300/40 text-center">
            Bu PIN&apos;i alıcıya kargo ile birlikte ilet. Teslimat onayında kullanılır.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button className="btn btn-ghost flex-1 text-purple-400" onClick={onClose} disabled={isCreating}>
            İptal
          </button>
          <button
            className="btn btn-primary flex-1 gap-2 font-bold"
            onClick={onSubmit}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                İmzalanıyor...
              </>
            ) : (
              "⛓️ Zincire Yaz"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
