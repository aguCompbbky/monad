"use client";

import { ShieldCheck, Zap } from "lucide-react";
import { GariMascot } from "~~/components/marketplace/GariMascot";

export const SectionHeader = () => {
  return (
    <div className="relative rounded-2xl overflow-hidden neon-grid border border-purple-800/30 bg-gradient-to-br from-purple-950/60 to-black/60 px-5 py-6 sm:px-8 sm:py-8">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-10 -left-10 w-48 h-48 rounded-full bg-purple-700/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-fuchsia-700/15 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        {/* Left: text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="status-badge bg-purple-900/60 text-purple-300 border border-purple-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping inline-block" />
              Live on Monad
            </span>
            <span className="status-badge bg-fuchsia-900/50 text-fuchsia-300 border border-fuchsia-500/30">
              <ShieldCheck className="w-3 h-3" />
              Escrow
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-none mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-200 to-fuchsia-300 neon-text">
              İkinci El
            </span>
            <br />
            <span className="text-white">Güvenli Al&Sat</span>
          </h2>

          <p className="text-sm sm:text-base text-purple-300/70 max-w-md leading-relaxed">
            Satıcı kargoya verir, sen teslim alınca PIN gir — ödeme otomatik serbest kalır.
            <span className="text-purple-400 font-semibold"> Güven yok, kontrat var.</span>
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { icon: <Zap className="w-3 h-3" />, label: "Anında İşlem" },
              { icon: <ShieldCheck className="w-3 h-3" />, label: "%1 Depozito" },
              { icon: <span className="text-xs">🔐</span>, label: "PIN Teslimat" },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-purple-950/70 border border-purple-700/40 text-purple-300"
              >
                {icon}
                {label}
              </span>
            ))}
          </div>

          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/50 px-4 py-1.5 text-xs font-semibold text-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping inline-block" />3 kürate ürün · 10 sn
            kargo simülasyonu · PIN ile ödeme serbest
          </p>
        </div>

        {/* Right: Mascot */}
        <div className="flex justify-center sm:justify-end shrink-0">
          <div className="relative">
            {/* Glow ring behind mascot */}
            <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-purple-600/25 blur-2xl" />
            <GariMascot size={96} />
            {/* Speech bubble */}
            <div className="absolute -top-8 -left-16 sm:-left-20 bg-purple-950 border border-purple-500/40 rounded-xl px-3 py-1.5 text-xs font-bold text-purple-200 whitespace-nowrap shadow-lg">
              Güven bende! 💜
              <div className="absolute -bottom-2 right-6 w-3 h-3 bg-purple-950 border-r border-b border-purple-500/40 rotate-45" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
