import React from 'react';
import { Package, Coffee, ClipboardCheck, ShoppingCart, Trash2, Truck } from 'lucide-react';

export type TabKey = 'inventory' | 'recipes' | 'audit' | 'orders' | 'waste' | 'suppliers';

interface NavigationTabsProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  lowStockCount: number;
  openPOCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  lowStockCount,
  openPOCount,
}) => {
  const tabs: Array<{
    id: TabKey;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'inventory',
      label: 'Stock Inventory',
      icon: <Package className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined
    },
    {
      id: 'recipes',
      label: 'Recipe & POS Depletion',
      icon: <Coffee className="w-4 h-4" />
    },
    {
      id: 'audit',
      label: 'Physical Count Audit',
      icon: <ClipboardCheck className="w-4 h-4" />
    },
    {
      id: 'orders',
      label: 'Purchase Orders',
      icon: <ShoppingCart className="w-4 h-4" />,
      badge: openPOCount > 0 ? openPOCount : undefined
    },
    {
      id: 'waste',
      label: 'Waste & Spoilage',
      icon: <Trash2 className="w-4 h-4" />
    },
    {
      id: 'suppliers',
      label: 'Suppliers Directory',
      icon: <Truck className="w-4 h-4" />
    }
  ];

  return (
    <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 text-[10px] font-semibold rounded-md ${
                      isActive
                        ? 'bg-amber-400 text-stone-950'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
