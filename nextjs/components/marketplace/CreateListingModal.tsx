import { X } from "lucide-react";

type CreateListingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  priceMon: string;
  pin: string;
  isCreating: boolean;
  onTitleChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onPinChange: (value: string) => void;
  onSubmit: () => void;
};

export const CreateListingModal = ({
  isOpen,
  onClose,
  title,
  priceMon,
  pin,
  isCreating,
  onTitleChange,
  onPriceChange,
  onPinChange,
  onSubmit,
}: CreateListingModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-fuchsia-500/40 bg-gradient-to-br from-purple-950 to-fuchsia-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Yeni Ilan Olustur</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="form-control">
            <span className="label-text text-fuchsia-100">Urun Adi</span>
            <input
              className="input input-bordered bg-black/40"
              placeholder="ornek: iPhone 13"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="label-text text-fuchsia-100">Fiyat (MON)</span>
            <input
              className="input input-bordered bg-black/40"
              placeholder="12.5"
              value={priceMon}
              onChange={e => onPriceChange(e.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="label-text text-fuchsia-100">6 Haneli Teslimat PIN</span>
            <input
              className="input input-bordered bg-black/40"
              placeholder="123456"
              value={pin}
              onChange={e => onPinChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </label>
          <p className="text-xs text-fuchsia-100/70">
            Ilan verirken kontrata fiyatin %10&apos;u depozito olarak gonderilir.
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onClose}>
            Kapat
          </button>
          <button className="btn btn-primary" type="button" onClick={onSubmit} disabled={isCreating}>
            {isCreating ? "Bekleniyor..." : "Ilani Zincire Yaz"}
          </button>
        </div>
      </div>
    </div>
  );
};
