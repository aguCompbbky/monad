import { formatEther } from "viem";
import { Listing } from "~~/types/marketplace";
import { formatAddress } from "~~/utils/formatAddress";

type ListingCardProps = {
  listing: Listing;
  onBuy: (listing: Listing) => void;
  isBuying: boolean;
};

export const ListingCard = ({ listing, onBuy, isBuying }: ListingCardProps) => {
  return (
    <div className="card bg-base-200/70 border border-fuchsia-900/30 shadow-xl">
      <div className="card-body">
        <h3 className="card-title text-lg">{listing.title}</h3>
        <p className="text-sm text-base-content/75">Satici: {formatAddress(listing.seller)}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-fuchsia-300">{formatEther(listing.priceWei)} MON</span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onBuy(listing)}
            disabled={isBuying || listing.status !== 0}
          >
            Satin Al
          </button>
        </div>
      </div>
    </div>
  );
};
