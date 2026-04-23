import { Plus } from "lucide-react";

type SectionHeaderProps = {
  onCreateListing: () => void;
};

export const SectionHeader = ({ onCreateListing }: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">Monad Marketplace</h2>
        <p className="text-sm text-base-content/70">Escrow guvencesi ile ikinci el alisveris.</p>
      </div>
      <button className="btn btn-primary" onClick={onCreateListing}>
        <Plus className="h-4 w-4" />
        Ilan Olustur
      </button>
    </div>
  );
};
