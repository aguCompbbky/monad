"use client";

import { useMemo, useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount, usePublicClient, useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { CreateListingModal } from "~~/components/marketplace/CreateListingModal";
import { ListingCard } from "~~/components/marketplace/ListingCard";
import { MarketplaceTabs } from "~~/components/marketplace/MarketplaceTabs";
import { PendingDeliveryCard } from "~~/components/marketplace/PendingDeliveryCard";
import { SectionHeader } from "~~/components/marketplace/SectionHeader";
import { ESCROW_ABI, ESCROW_ADDRESS } from "~~/constants";
import { Listing } from "~~/types/marketplace";
import { notification } from "~~/utils/scaffold-eth";

const MVP_SELLER_ADDRESS = "0xd7a9251D72A390246818cC991E3d811BD090c522".toLowerCase();

const Home: NextPage = () => {
  const { address: connectedAddress, chain } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [activeTab, setActiveTab] = useState<"myDeals" | "marketplace">("marketplace");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priceMon, setPriceMon] = useState("");
  const [pin, setPin] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [listingTitles, setListingTitles] = useState<Record<number, string>>({});

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
    query: {
      enabled: listingIds.length > 0,
    },
  });

  const listings = useMemo<Listing[]>(() => {
    if (!listingsRaw?.length) return [];
    return listingsRaw
      .map((entry, index) => {
        if (entry.status !== "success" || !entry.result) return null;
        const listingId = index + 1;
        const listingData = entry.result as readonly [
          `0x${string}`,
          `0x${string}`,
          bigint,
          bigint,
          `0x${string}`,
          number,
        ];
        return {
          id: listingId,
          title: listingTitles[listingId] || `Urun #${listingId}`,
          seller: listingData[0],
          buyer: listingData[1],
          priceWei: listingData[2],
          status: Number(listingData[5]),
        } satisfies Listing;
      })
      .filter((listing): listing is Listing => Boolean(listing));
  }, [listingTitles, listingsRaw]);

  const myDeals = useMemo(() => {
    if (!connectedAddress) return [];
    return listings.filter(
      listing =>
        listing.seller.toLowerCase() === connectedAddress.toLowerCase() ||
        listing.buyer.toLowerCase() === connectedAddress.toLowerCase(),
    );
  }, [connectedAddress, listings]);

  const marketListings = useMemo(
    () => listings.filter(listing => listing.status === 0 && listing.seller.toLowerCase() === MVP_SELLER_ADDRESS),
    [listings],
  );

  const visibleListings = activeTab === "myDeals" ? myDeals : marketListings;
  const pendingForBuyer = useMemo(() => {
    if (!connectedAddress) return [];
    return myDeals.filter(
      listing => listing.status === 1 && listing.buyer.toLowerCase() === connectedAddress.toLowerCase(),
    );
  }, [connectedAddress, myDeals]);

  const refreshListings = async () => {
    await Promise.all([refetchListingCount(), refetchListings()]);
  };

  const handleCreateListing = async () => {
    if (!title.trim()) {
      notification.error("Urun adi gerekli.");
      return;
    }
    if (!priceMon) {
      notification.error("Fiyat gerekli.");
      return;
    }
    if (pin.length !== 6) {
      notification.error("PIN 6 haneli olmali.");
      return;
    }

    try {
      const priceWei = parseEther(priceMon);
      const depositWei = priceWei / 10n;
      setIsCreating(true);
      const loadingToastId = notification.loading("Ilan olusturma icin cuzdan onayi bekleniyor...");

      const hash = await writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "createListing",
        args: [priceWei, BigInt(pin)],
        value: depositWei,
      });

      await publicClient?.waitForTransactionReceipt({ hash });
      notification.remove(loadingToastId);
      notification.success("Ilan basariyla olusturuldu.");

      await refreshListings();
      const newCount = Number((await refetchListingCount()).data ?? 0n);
      if (newCount > 0) {
        setListingTitles(prev => ({ ...prev, [newCount]: title.trim() }));
      }

      setIsCreateModalOpen(false);
      setTitle("");
      setPriceMon("");
      setPin("");
    } catch {
      notification.error("Ilan olusturma basarisiz oldu.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleBuy = async (listing: Listing) => {
    try {
      setIsBuying(true);
      const loadingToastId = notification.loading("Satin alma icin cuzdan onayi bekleniyor...");
      const hash = await writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "buyItem",
        args: [BigInt(listing.id)],
        value: listing.priceWei,
      });

      await publicClient?.waitForTransactionReceipt({ hash });
      notification.remove(loadingToastId);
      notification.success("Satin alma basarili.");
      await refreshListings();
    } catch {
      notification.error("Satin alma islemi basarisiz.");
    } finally {
      setIsBuying(false);
    }
  };

  const handleConfirmDelivery = async (listingId: number, enteredPin: string) => {
    try {
      setIsConfirming(true);
      const loadingToastId = notification.loading("Teslimat onayi icin cuzdan onayi bekleniyor...");
      const hash = await writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "confirmDelivery",
        args: [BigInt(listingId), BigInt(enteredPin)],
      });

      await publicClient?.waitForTransactionReceipt({ hash });
      notification.remove(loadingToastId);
      notification.success("Teslimat onaylandi.");
      await refreshListings();
    } catch {
      notification.error("Teslimat onayi basarisiz.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader onCreateListing={() => setIsCreateModalOpen(true)} />
        <p className="text-xs text-base-content/60 mt-2">Bagli ag: {chain?.name || "Bagli degil"}</p>

        <div className="mt-6">
          <MarketplaceTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} onBuy={handleBuy} isBuying={isBuying} />
          ))}
          {visibleListings.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-fuchsia-900/40 bg-black/40 p-8 text-center text-base-content/70">
              Bagli cuzdaninla eslesen aktif islem bulunamadi.
            </div>
          )}
        </div>

        {activeTab === "myDeals" && pendingForBuyer.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-3">PIN Gir ve Onayla</h3>
            <div className="grid gap-4 sm:grid-cols-2">
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
        priceMon={priceMon}
        pin={pin}
        isCreating={isCreating}
        onTitleChange={setTitle}
        onPriceChange={setPriceMon}
        onPinChange={setPin}
        onSubmit={handleCreateListing}
      />
    </>
  );
};

export default Home;
