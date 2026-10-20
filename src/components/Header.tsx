import React from 'react';
import { Coffee, AlertTriangle, Clock, DollarSign, Layers, Plus, Sparkles, RefreshCcw } from 'lucide-react';
import { calculateInventoryValuation } from '../utils/inventoryCalculations.ts';
import { InventoryItem } from '../types/inventory.ts';

interface HeaderProps {
  items: InventoryItem[];
  onOpenNewItem: () => void;
  onOpenDrinkSimulator: () => void;
  onOpenAudit: () => void;
  onApplyPreset: (preset: 'normal' | 'rush-alert' | 'reset') => void;
}

export const Header: React.FC<HeaderProps> = ({
  items,
  onOpenNewItem,
  onOpenDrinkSimulator,
  onOpenAudit,
  onApplyPreset,
}) => {
  const valuation = calculateInventoryValuation(items);

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-editorial">
                  Crema &amp; Co.
                </h1>
                <span className="text-xs text-amber-400 font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60">
                  Stock Operations
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
                Artisan Roasters &amp; Espresso Bar · Live Inventory Control
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenDrinkSimulator}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-200 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Drink Order</span>
            </button>

            <button
              onClick={onOpenAudit}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-200 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-stone-300" />
              <span>Physical Audit</span>
            </button>

            <button
              onClick={onOpenNewItem}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-stone-950" />
              <span>Add Stock Item</span>
            </button>

            {/* Demo Presets dropdown */}
            <div className="relative group">
              <button
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs text-stone-400 hover:text-stone-200 bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/80 rounded-lg transition-colors cursor-pointer"
                title="Switch demo scenarios"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Scenario</span>
              </button>
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-stone-900 border border-stone-700 rounded-lg shadow-xl py-1 hidden group-hover:block z-30">
                <button
                  onClick={() => onApplyPreset('normal')}
                  className="w-full text-left px-3 py-1.5 text-xs text-stone-300 hover:bg-stone-800 hover:text-amber-400 transition-colors"
                >
                  Standard Morning Setup
                </button>
                <button
                  onClick={() => onApplyPreset('rush-alert')}
                  className="w-full text-left px-3 py-1.5 text-xs text-stone-300 hover:bg-stone-800 hover:text-amber-400 transition-colors"
                >
                  Afternoon Rush (Low Stock)
                </button>
                <button
                  onClick={() => onApplyPreset('reset')}
                  className="w-full text-left px-3 py-1.5 text-xs text-stone-400 hover:bg-stone-800 hover:text-stone-200 border-t border-stone-800 transition-colors"
                >
                  Reset to Seed Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="p-3.5 sm:p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Total Inventory Value</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">
              ${valuation.totalStockCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              {valuation.totalItems} distinct cafe lines
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Healthy In-Stock</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
              {valuation.healthyCount}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Optimal par levels
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Low Stock Alerts</span>
              <AlertTriangle className={`w-4 h-4 ${valuation.lowStockCount > 0 ? 'text-amber-400' : 'text-stone-500'}`} />
            </div>
            <p className={`text-xl sm:text-2xl font-bold mt-1 ${valuation.lowStockCount > 0 ? 'text-amber-400' : 'text-stone-200'}`}>
              {valuation.lowStockCount}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              At or below reorder threshold
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Expiring / Perishables</span>
              <Clock className={`w-4 h-4 ${valuation.expiringSoonCount > 0 ? 'text-rose-400' : 'text-stone-500'}`} />
            </div>
            <p className={`text-xl sm:text-2xl font-bold mt-1 ${valuation.expiringSoonCount > 0 ? 'text-rose-400' : 'text-stone-200'}`}>
              {valuation.expiringSoonCount}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Dairy &amp; bakery expiring ≤ 72h
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
