import React from "react";
import Link from "next/link";
import { useFetchNativeCurrencyPrice } from "@scaffold-ui/hooks";
import { hardhat } from "viem/chains";
import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { price: nativeCurrencyPrice } = useFetchNativeCurrencyPrice();

  return (
    <div className="min-h-0 pb-6 pt-2 px-4">
      {/* Dev tools (fixed bottom-left) */}
      <div className="fixed flex gap-2 z-10 p-3 bottom-0 left-0 pointer-events-none">
        <div className="flex flex-col sm:flex-row gap-2 pointer-events-auto">
          {nativeCurrencyPrice > 0 && (
            <div className="btn btn-xs btn-ghost border border-purple-700/30 font-mono text-purple-300/70 gap-1 cursor-default">
              <CurrencyDollarIcon className="h-3 w-3" />
              {nativeCurrencyPrice.toFixed(2)}
            </div>
          )}
          {isLocalNetwork && (
            <>
              <Faucet />
              <Link href="/blockexplorer" passHref className="btn btn-xs btn-ghost border border-purple-700/30 text-purple-300/70 gap-1">
                <MagnifyingGlassIcon className="h-3 w-3" />
                Explorer
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Footer text */}
      <div className="flex justify-center items-center gap-2 text-xs text-purple-500/40 pt-4 pb-2">
        <span>Built with 💜 on Monad — Hackathon 2025</span>
      </div>
    </div>
  );
};
