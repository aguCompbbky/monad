"use client";

import { useEffect, useState } from "react";
import { Copy, Package, X } from "lucide-react";

type PinRevealModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pin: string;
  productTitle: string;
};

export const PinRevealModal = ({ isOpen, onClose, pin, productTitle }: PinRevealModalProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) setCopied(false);
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pin).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950 via-[#0d052a] to-black shadow-2xl shadow-purple-900/50 animate-appear-up overflow-hidden">
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />

        {/* Close */}
        <button
          className="absolute top-3 right-3 btn btn-ghost btn-xs btn-circle text-purple-400"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-green-950/50 border border-green-500/30 flex items-center justify-center">
                <Package className="w-8 h-8 text-green-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-[10px] font-black text-black">✓</span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-black text-white mb-1">Satın Alma Başarılı!</h3>
          <p className="text-xs text-purple-300/60 mb-5 leading-relaxed">
            <span className="font-semibold text-purple-200">{productTitle}</span> için ödemen escrow&apos;da kilitlendi.
            Kargocu seni aradığında bu kodu söyle.
          </p>

          {/* PIN display */}
          <div className="relative mb-4">
            <div className="rounded-xl border border-purple-500/30 bg-black/50 p-4">
              <p className="text-xs text-purple-400/60 mb-2 uppercase tracking-widest">Teslimat PIN Kodu</p>
              <div className="flex justify-center gap-2 mb-3">
                {pin.split("").map((digit, i) => (
                  <div
                    key={i}
                    className="w-9 h-11 rounded-lg bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-xl font-black text-fuchsia-300 neon-text"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {digit}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-purple-400/40">Bu kodu kimseyle paylaşma — sadece kargocuya söyle</p>
            </div>
          </div>

          <button
            className="btn btn-primary w-full gap-2 font-bold"
            onClick={handleCopy}
          >
            {copied ? (
              <>✓ Kopyalandı!</>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                PIN&apos;i Kopyala
              </>
            )}
          </button>

          <p className="text-[10px] text-purple-400/30 mt-3">
            Ürün &quot;Alımlarım&quot; sekmesinde görünecek. Teslimatta PIN&apos;i gir, para satıcıya geçsin.
          </p>
        </div>
      </div>
    </div>
  );
};
