type MarketplaceTabsProps = {
  activeTab: "myDeals" | "marketplace";
  onChange: (tab: "myDeals" | "marketplace") => void;
};

export const MarketplaceTabs = ({ activeTab, onChange }: MarketplaceTabsProps) => {
  return (
    <div className="tabs tabs-boxed bg-base-300/70 inline-flex">
      <button
        className={`tab ${activeTab === "myDeals" ? "tab-active" : ""}`}
        onClick={() => onChange("myDeals")}
        type="button"
      >
        Aktif Islemlerim
      </button>
      <button
        className={`tab ${activeTab === "marketplace" ? "tab-active" : ""}`}
        onClick={() => onChange("marketplace")}
        type="button"
      >
        Marketplace
      </button>
    </div>
  );
};
