"use client";

import { useCallback, useState } from "react";
import confetti from "canvas-confetti";
import type { NextPage } from "next";
import { useAccount, usePublicClient, useSendTransaction } from "wagmi";
import { CatalogCard, CatalogCardData } from "~~/components/marketplace/CatalogCard";
import { DeliveryContext, DeliveryPinModal } from "~~/components/marketplace/DeliveryPinModal";
import { SectionHeader } from "~~/components/marketplace/SectionHeader";
import { CATALOG, CatalogSlug, MVP_SELLER_ADDRESS, findCatalogBySlug } from "~~/constants/catalog";
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

const Home: NextPage = () => {
  const { address: connectedAddress, chain } = useAccount();
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();

  const [soldSlugs, setSoldSlugs] = useState<Set<string>>(() => new Set());
  const [pendingDelivery, setPendingDelivery] = useState<DeliveryContext | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const catalogCards: CatalogCardData[] = CATALOG.map(product => ({
    product,
    listingId: null,
    state: soldSlugs.has(product.slug) ? "sold" : pendingDelivery?.slug === product.slug ? "in-delivery" : "ready",
    seller: MVP_SELLER_ADDRESS,
  }));

  const handleBuy = useCallback(
    (data: CatalogCardData) => {
      if (!connectedAddress) {
        notification.error("Önce cüzdanı bağla.");
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

      setPendingDelivery({
        slug: data.product.slug,
        title: data.product.title,
        priceMon: data.product.priceMon,
        revealAt: Date.now() + REVEAL_DELAY_MS,
      });
      notification.info(`${data.product.title} kargoya verildi — PIN 10 sn içinde ekrana düşecek.`);
    },
    [connectedAddress, pendingDelivery],
  );

  const handleConfirmDelivery = useCallback(
    async (slug: CatalogSlug) => {
      const product = findCatalogBySlug(slug);
      if (!product) return false;
      if (!connectedAddress) {
        notification.error("Cüzdan bağlı değil.");
        return false;
      }

      setIsConfirming(true);
      const toastId = notification.loading(`${product.priceMon} MON satıcıya gönderiliyor…`);
      try {
        const hash = await sendTransactionAsync({
          to: MVP_SELLER_ADDRESS,
          value: product.priceWei,
        });
        await publicClient?.waitForTransactionReceipt({ hash });
        notification.remove(toastId);
        notification.success(`Teslimat onaylandı — ${product.priceMon} MON satıcıda. 🎉`);
        fireConfetti();
        setSoldSlugs(prev => {
          const next = new Set(prev);
          next.add(slug);
          return next;
        });
        return true;
      } catch {
        notification.remove(toastId);
        notification.error("Ödeme imzalanamadı ya da reddedildi.");
        return false;
      } finally {
        setIsConfirming(false);
      }
    },
    [connectedAddress, publicClient, sendTransactionAsync],
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

        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {catalogCards.map((card, i) => (
            <div key={card.product.slug} style={{ animationDelay: `${i * 60}ms` }}>
              <CatalogCard
                data={card}
                isBuying={pendingDelivery !== null}
                buyingSlug={pendingDelivery?.slug ?? null}
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
