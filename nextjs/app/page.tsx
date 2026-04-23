"use client";

import { useCallback, useState } from "react";
import confetti from "canvas-confetti";
import type { NextPage } from "next";
import { decodeEventLog } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { CatalogCard, CatalogCardData } from "~~/components/marketplace/CatalogCard";
import { DeliveryContext, DeliveryPinModal } from "~~/components/marketplace/DeliveryPinModal";
import { SectionHeader } from "~~/components/marketplace/SectionHeader";
import { CATALOG, CatalogSlug, MVP_SELLER_ADDRESS } from "~~/constants/catalog";
import { GARI_ESCROW_ABI, GARI_ESCROW_ADDRESS } from "~~/constants/gariEscrow";
import { notification } from "~~/utils/scaffold-eth";

const REVEAL_DELAY_MS = 10_000;

const fireConfetti = () => {
  const colors = ["#836ef9", "#c026d3", "#a855f7", "#7c3aed", "#f0abfc", "#ffffff"];
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors,
    shapes: ["circle", "square"],
    scalar: 1.1,
  });
  setTimeout(() => {
    confetti({ particleCount: 60, spread: 120, origin: { x: 0.1, y: 0.55 }, colors, angle: 60 });
  }, 200);
  setTimeout(() => {
    confetti({ particleCount: 60, spread: 120, origin: { x: 0.9, y: 0.55 }, colors, angle: 120 });
  }, 300);
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const Home: NextPage = () => {
  const { address: connectedAddress, chain } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [buyingSlug, setBuyingSlug] = useState<CatalogSlug | null>(null);
  const [soldSlugs, setSoldSlugs] = useState<Set<string>>(() => new Set());
  const [pendingDelivery, setPendingDelivery] = useState<DeliveryContext | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const contractReady = GARI_ESCROW_ADDRESS !== ZERO_ADDRESS;

  const catalogCards: CatalogCardData[] = CATALOG.map(product => ({
    product,
    listingId: null,
    state: soldSlugs.has(product.slug) ? "sold" : pendingDelivery?.slug === product.slug ? "in-delivery" : "ready",
    seller: MVP_SELLER_ADDRESS,
  }));

  const handleBuy = useCallback(
    async (data: CatalogCardData) => {
      if (!connectedAddress) {
        notification.error("Önce cüzdanı bağla.");
        return;
      }
      if (!contractReady) {
        notification.error("Escrow kontratı Monad'a deploy edilmemiş. README'deki adımları izle.");
        return;
      }
      if (connectedAddress.toLowerCase() === MVP_SELLER_ADDRESS.toLowerCase()) {
        notification.error("Satıcı kendi ürününü satın alamaz.");
        return;
      }
      if (data.state !== "ready") {
        notification.info("Bu ürün zaten işlemde.");
        return;
      }
      if (pendingDelivery) {
        notification.info("Önce aktif kargoyu tamamla.");
        return;
      }

      setBuyingSlug(data.product.slug);
      const toastId = notification.loading(`${data.product.priceMon} MON escrow'a kilitleniyor…`);
      try {
        const hashRes = await fetch(`/api/cargo/pin-hash?slug=${encodeURIComponent(data.product.slug)}`, {
          cache: "no-store",
        });
        if (!hashRes.ok) throw new Error("pin-hash endpoint error");
        const { pinHash } = (await hashRes.json()) as { pinHash: `0x${string}` };
        if (!pinHash) throw new Error("pin-hash missing");

        const txHash = await writeContractAsync({
          abi: GARI_ESCROW_ABI,
          address: GARI_ESCROW_ADDRESS,
          functionName: "lock",
          args: [MVP_SELLER_ADDRESS, pinHash],
          value: data.product.priceWei,
        });

        if (!publicClient) throw new Error("public client missing");
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        let orderId: bigint | null = null;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: GARI_ESCROW_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "OrderLocked") {
              orderId = decoded.args.orderId;
              break;
            }
          } catch {
            // different event / different contract log — skip
          }
        }
        if (orderId === null) throw new Error("OrderLocked event bulunamadı");

        notification.remove(toastId);
        notification.success(`${data.product.priceMon} MON kilitlendi — kargo yola çıktı!`);

        setPendingDelivery({
          slug: data.product.slug,
          title: data.product.title,
          priceMon: data.product.priceMon,
          revealAt: Date.now() + REVEAL_DELAY_MS,
          orderId,
        });
      } catch (error) {
        notification.remove(toastId);
        const msg = error instanceof Error ? error.message : "";
        notification.error(`Satın alma başarısız: ${msg || "imzalama iptal edildi."}`);
      } finally {
        setBuyingSlug(null);
      }
    },
    [connectedAddress, contractReady, pendingDelivery, publicClient, writeContractAsync],
  );

  const handleConfirmDelivery = useCallback(
    async (slug: CatalogSlug, orderId: bigint, pinCode: string) => {
      if (!connectedAddress) {
        notification.error("Cüzdan bağlı değil.");
        return false;
      }
      if (!contractReady) {
        notification.error("Kontrat hazır değil.");
        return false;
      }

      setIsConfirming(true);
      const toastId = notification.loading("PIN doğrulanıyor, ödeme satıcıya bırakılıyor…");
      try {
        const txHash = await writeContractAsync({
          abi: GARI_ESCROW_ABI,
          address: GARI_ESCROW_ADDRESS,
          functionName: "release",
          args: [orderId, BigInt(pinCode)],
        });
        if (!publicClient) throw new Error("public client missing");
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        notification.remove(toastId);
        notification.success("Teslimat onaylandı — ödeme satıcıda. 🎉");
        fireConfetti();
        setSoldSlugs(prev => {
          const next = new Set(prev);
          next.add(slug);
          return next;
        });
        return true;
      } catch (error) {
        notification.remove(toastId);
        const msg = error instanceof Error ? error.message : "";
        notification.error(`Onaylama başarısız: ${msg || "tekrar dene."}`);
        return false;
      } finally {
        setIsConfirming(false);
      }
    },
    [connectedAddress, contractReady, publicClient, writeContractAsync],
  );

  const handleCloseModal = useCallback(() => {
    if (isConfirming) return;
    setPendingDelivery(null);
  }, [isConfirming]);

  return (
    <>
      <div className="fixed inset-0 neon-grid pointer-events-none opacity-60 z-0" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <SectionHeader />

        <div className="flex items-center gap-2 mt-3 sm:hidden">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-purple-300/60">{chain?.name || "Bağlı değil"}</span>
        </div>

        {!contractReady && (
          <div className="mt-4 rounded-xl border border-yellow-500/40 bg-yellow-950/30 p-4 text-sm text-yellow-200">
            ⚠️ Escrow kontratı henüz Monad testnet&apos;e deploy edilmedi.{" "}
            <code className="text-yellow-100">NEXT_PUBLIC_GARI_ESCROW_ADDRESS</code> değişkenini
            <code className="text-yellow-100"> packages/nextjs/.env.local</code> içine gir.
          </div>
        )}

        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {catalogCards.map((card, i) => (
            <div key={card.product.slug} style={{ animationDelay: `${i * 60}ms` }}>
              <CatalogCard
                data={card}
                isBuying={buyingSlug !== null || pendingDelivery !== null}
                buyingSlug={buyingSlug ?? pendingDelivery?.slug ?? null}
                onBuy={handleBuy}
              />
            </div>
          ))}
        </div>
      </div>

      <DeliveryPinModal
        context={pendingDelivery}
        isConfirming={isConfirming}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelivery}
      />
    </>
  );
};

export default Home;
