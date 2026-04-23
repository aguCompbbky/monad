import { useState } from "react";
import { Listing } from "~~/types/marketplace";

type PendingDeliveryCardProps = {
  listing: Listing;
  isConfirming: boolean;
  onConfirm: (listingId: number, pin: string) => void;
};

export const PendingDeliveryCard = ({ listing, isConfirming, onConfirm }: PendingDeliveryCardProps) => {
  const [pin, setPin] = useState("");

  return (
    <div className="card bg-base-200/70 border border-fuchsia-900/30 shadow-xl">
      <div className="card-body">
        <h3 className="card-title text-lg">{listing.title}</h3>
        <p className="text-sm text-base-content/75">Durum: Kargoda/Beklemede</p>
        <label className="form-control">
          <span className="label-text">6 Haneli PIN</span>
          <input
            className="input input-bordered"
            placeholder="123456"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        </label>
        <button
          className="btn btn-primary mt-2"
          disabled={isConfirming || pin.length !== 6}
          onClick={() => onConfirm(listing.id, pin)}
        >
          {isConfirming ? "Onay bekleniyor..." : "PIN Gir ve Onayla"}
        </button>
      </div>
    </div>
  );
};
