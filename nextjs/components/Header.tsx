"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { GariMascot } from "~~/components/marketplace/GariMascot";

export const Header = () => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-purple-900/30 bg-black/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
        {/* Logo + Mascot */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="shrink-0">
            <GariMascot size={36} className="!animate-float" />
          </div>
          <div className="flex flex-col leading-none min-w-0">
            <span className="text-lg sm:text-2xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 neon-text whitespace-nowrap">
              GARANTOR
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-purple-400/70 uppercase hidden sm:block">
              Monad Escrow Market
            </span>
          </div>
        </div>

        {/* Network badge - hidden on xs */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-950/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-purple-300/80 font-medium">Monad Testnet</span>
        </div>

        {/* Connect Button */}
        <div className="shrink-0">
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus={{ smallScreen: "avatar", largeScreen: "address" }}
          />
        </div>
      </div>
    </header>
  );
};
