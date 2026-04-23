type MarketplaceTabsProps = {
  activeTab: "myDeals" | "marketplace";
  onChange: (tab: "myDeals" | "marketplace") => void;
};

export const MarketplaceTabs = ({ activeTab, onChange }: MarketplaceTabsProps) => {
  const tabs: { id: "myDeals" | "marketplace"; label: string; icon: string }[] = [
    { id: "marketplace", label: "Marketplace", icon: "🛒" },
    { id: "myDeals", label: "İşlemlerim", icon: "⚡" },
  ];

  return (
    <div className="flex gap-2 p-1 rounded-2xl bg-purple-950/40 border border-purple-800/30 w-fit">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
              ${
                isActive
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-900/50"
                  : "text-purple-400 hover:text-purple-200 hover:bg-purple-900/30"
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {isActive && (
              <span className="absolute inset-0 rounded-xl ring-1 ring-purple-400/40 animate-neon-pulse pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
};
