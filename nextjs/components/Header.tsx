"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Site header
 */
export const Header = () => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md border-b border-fuchsia-900/30 bg-black/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-fuchsia-400 shadow-[0_0_20px_4px_rgba(217,70,239,0.8)]" />
          <h1 className="text-xl sm:text-2xl font-black tracking-[0.24em] text-fuchsia-300">GARANTOR</h1>
        </div>
        <div className="rounded-full border border-fuchsia-500/40 bg-black/40 px-2 py-1">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};
