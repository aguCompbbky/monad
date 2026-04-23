"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import confetti from "canvas-confetti";
import { Package } from "lucide-react";
import { parseEther } from "viem";
import { useAccount, usePublicClient, useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { CreateListingModal } from "~~/components/marketplace/CreateListingModal";
import { ListingCard } from "~~/components/marketplace/ListingCard";
import { MarketplaceTabs } from "~~/components/marketplace/MarketplaceTabs";
import { PendingDeliveryCard } from "~~/components/marketplace/PendingDeliveryCard";
import { SectionHeader } from "~~/components/marketplace/SectionHeader";
import { ESCROW_ABI, ESCROW_ADDRESS } from "~~/constants";
import { fetchMonadDbProducts, saveMonadDbProduct } from "~~/services/monaddb/client";
import { useMarketplaceStore } from "~~/services/store/marketplaceStore";
import { Listing } from "~~/types/marketplace";
import { notification } from "~~/utils/scaffold-eth";

const MVP_SELLER_ADDRESS = "0xd7a9251D72A390246818cC991E3d811BD090c522".toLowerCase();

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
    confetti({
      particleCount: 60,
      spread: 120,
      origin: { x: 0.1, y: 0.55 },
      colors,
      angle: 60,
    });
  }, 200);
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 120,
      origin: { x: 0.9, y: 0.55 },
      colors,
      angle: 120,
    });
  }, 300);
};

const Home: NextPage = () => {
  const { address: connectedAddress, chain } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [activeTab, setActiveTab] = useState<"myDeals" | "marketplace">("marketplace");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [features, setFeatures] = useState("");
  const [priceMon, setPriceMon] = useState("");
  const [pin, setPin] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const listingMetaById = useMarketplaceStore(state => state.listingMetaById);
  const setProducts = useMarketplaceStore(state => state.setProducts);
  const setListingMeta = useMarketplaceStore(state => state.setListingMeta);
  const bumpRevision = useMarketplaceStore(state => state.bumpRevision);

  const { data: listingCountData, refetch: refetchListingCount } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "listingCount",
  });

  const listingIds = useMemo(() => {
    const count = Number(listingCountData ?? 0n);
    return Array.from({ length: count }, (_, index) => BigInt(index + 1));
  }, [listingCountData]);

  const { data: listingsRaw, refetch: refetchListings } = useReadContracts({
    contracts: listingIds.map(id => ({
      address: ESCROW_ADDRESS,
      abi: ESCROW_ABI,
      functionName: "listings",
      args: [id],
    })),
    query: { enabled: listingIds.length > 0 },
  });

  const listings = useMemo<Listing[]>(() => {
    if (!listingsRaw?.length) return [];
    return listingsRaw
      .map((entry, index) => {
        if (entry.status !== "success" || !entry.result) return null;
        const listingId = index + 1;
        if (!listingMetaById[listingId]) return null;
        const listingData = entry.result as readonly [`0x${string}`, `0x${string}`, bigint, bigint, `0x${string}`, number];
        return {
          id: listingId,
          title: listingMetaById[listingId]?.title || `Ürün #${listingId}`,
          features: listingMetaById[listingId]?.features || "",
          seller: listingData[0],
          buyer: listingData[1],
          priceWei: listingData[2],
          status: Number(listingData[5]),
        } satisfies Listing;
      })
      .filter((l): l is Listing => Boolean(l));
  }, [listingMetaById, listingsRaw]);

  const myDeals = useMemo(() => {
    if (!connectedAddress) return [];
    return listings.filter(
      l =>
        l.seller.toLowerCase() === connectedAddress.toLowerCase() ||
        l.buyer.toLowerCase() === connectedAddress.toLowerCase(),
    );
  }, [connectedAddress, listings]);

  const marketListings = useMemo(
    () => listings.filter(l => l.status === 0 && l.seller.toLowerCase() === MVP_SELLER_ADDRESS),
    [listings],
  );

  const visibleListings = activeTab === "myDeals" ? myDeals : marketListings;

  const pendingForBuyer = useMemo(() => {
    if (!connectedAddress) return [];
    return myDeals.filter(
      l => l.status === 1 && l.buyer.toLowerCase() === connectedAddress.toLowerCase(),
    );
  }, [connectedAddress, myDeals]);

  const refreshListings = useCallback(async () => {
    await Promise.all([refetchListingCount(), refetchListings()]);
    bumpRevision();
  }, [refetchListingCount, refetchListings, bumpRevision]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const products = await fetchMonadDbProducts();
        if (!cancelled) setProducts(products);
      } catch {
        notification.warning("MonadDB ürün verisi alınamadı.");
      }
    };
    load();
    return () => { cancelled = true; };
  }, [setProducts]);

  const handleCreateListing = async () => {
    if (!title.trim()) { notification.error("Ürün adı gerekli."); return; }
    if (!priceMon) { notification.error("Fiyat gerekli."); return; }
    if (pin.length !== 6) { notification.error("PIN 6 haneli olmalı."); return; }

    setIsCreating(true);
    const toastId = notification.loading("Cüzdan onayı bekleniyor...");
    try {
      const priceWei = parseEther(priceMon);
      const depositWei = priceWei / 100n;

      const hash = await writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "createListing",
        args: [priceWei, BigInt(pin)],
        value: depositWei,
      });

      await publicClient?.waitForTransactionReceipt({ hash });
      notification.remove(toastId);
      notification.success("İlan başarıyla oluşturuldu! 🎉");

      await refreshListings();
      const newCount = Number((await refetchListingCount()).data ?? 0n);
      if (newCount > 0) {
        const meta = { title: title.trim(), features: features.trim(), createdAt: Date.now() };
        setListingMeta(newCount, meta);
        const products = await saveMonadDbProduct({ listingId: newCount, title: meta.title, features: meta.features });
        setProducts(products);
      }

      setIsCreateModalOpen(false);
      setTitle(""); setFeatures(""); setPriceMon(""); setPin("");
    } catch {
      notification.remove(toastId);
      notification.error("İlan oluşturma başarısız.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleBuy = async (listing: Listing) => {
    setIsBuying(true);
    const toastId = notification.loading("Satın alma için cüzdan onayı bekleniyor...");
    try {
      const hash = await writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "buyItem",
        args: [BigInt(listing.id)],
        value: listing.priceWei,
      });

      await publicClient?.waitForTransactionReceipt({ hash });
      notification.remove(toastId);
      notification.success("Satın alma başarılı! 🛒");
      fireConfetti();
      await refreshListings();
    } catch {
      notification.remove(toastId);
      notification.error("Satın alma işlemi başarısız.");
    } finally {
      setIsBuying(false);
    }
  };

  const handleConfirmDelivery = async (listingId: number, enteredPin: string) => {
    setIsConfirming(true);
    const toastId = notification.loading("Teslimat onayı için cüzdan bekleniyor...");
    try {
      const hash = await writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "confirmDelivery",
        args: [BigInt(listingId), BigInt(enteredPin)],
      });

      await publicClient?.waitForTransactionReceipt({ hash });
      notification.remove(toastId);
      notification.success("Teslimat onaylandı! Ödeme serbest. ✅");
      fireConfetti();
      await refreshListings();
    } catch {
      notification.remove(toastId);
      notification.error("Teslimat onayı başarısız.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <>
      {/* Background grid overlay */}
      <div className="fixed inset-0 neon-grid pointer-events-none opacity-60 z-0" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero section header */}
        <SectionHeader onCreateListing={() => setIsCreateModalOpen(true)} />

        {/* Network pill (mobile) */}
        <div className="flex items-center gap-2 mt-3 sm:hidden">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-purple-300/60">{chain?.name || "Bağlı değil"}</span>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <MarketplaceTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Listings grid */}
        <div className="mt-5 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {visibleListings.map((listing, i) => (
            <div key={listing.id} style={{ animationDelay: `${i * 60}ms` }}>
              <ListingCard listing={listing} onBuy={handleBuy} isBuying={isBuying} />
            </div>
          ))}

          {visibleListings.length === 0 && (
            <div className="col-span-full">
              <div className="neon-card glass-card rounded-2xl border border-purple-900/30 p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/30">
                    <Package className="w-10 h-10 text-purple-400/50" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-300/60 text-lg">
                      {activeTab === "marketplace" ? "Henüz ilan yok" : "Aktif işlem bulunamadı"}
                    </p>
                    <p className="text-sm text-purple-400/40 mt-1">
                      {activeTab === "marketplace"
                        ? "İlk ilanı sen oluştur!"
                        : "Cüzdanına bağlı aktif işlem yok."}
                    </p>
                  </div>
                  {activeTab === "marketplace" && (
                    <button
                      className="btn btn-primary btn-sm mt-2"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      İlan Oluştur
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pending deliveries */}
        {activeTab === "myDeals" && pendingForBuyer.length > 0 && (
          <div className="mt-8">
            <h3 className="flex items-center gap-2 text-lg font-bold text-yellow-300 mb-4">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse inline-block" />
              Teslimat Bekleyen Ürünler
            </h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {pendingForBuyer.map(listing => (
                <PendingDeliveryCard
                  key={listing.id}
                  listing={listing}
                  isConfirming={isConfirming}
                  onConfirm={handleConfirmDelivery}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={title}
        features={features}
        priceMon={priceMon}
        pin={pin}
        isCreating={isCreating}
        onTitleChange={setTitle}
        onFeaturesChange={setFeatures}
        onPriceChange={setPriceMon}
        onPinChange={setPin}
        onSubmit={handleCreateListing}
      />
    </>
  );
};

export default Home;
