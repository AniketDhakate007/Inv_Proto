import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle2, AlertCircle, RefreshCw, Save, ArrowRight } from 'lucide-react';
import { InventoryItem } from '../types/inventory.ts';
import { calculateAuditVariance } from '../utils/inventoryCalculations.ts';

interface StockAuditViewProps {
  items: InventoryItem[];
  onApplyAudit: (counts: Record<string, number>, auditorName: string, notes: string) => void;
}

export const StockAuditView: React.FC<StockAuditViewProps> = ({
  items,
  onApplyAudit,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [auditorName, setAuditorName] = useState<string>('Head Barista Maya');
  const [auditNotes, setAuditNotes] = useState<string>('Morning opening stock count verification');
  // Store physical counts: itemId -> count
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    items.forEach((item) => {
      initial[item.id] = item.currentStock;
    });
    return initial;
  });

  const locations = Array.from(new Set(items.map((i) => i.location))).sort();

  const auditItems = items.filter(
    (item) => selectedLocation === 'all' || item.location === selectedLocation
  );

  const varianceResult = calculateAuditVariance(auditItems, counts);

  const handleCountChange = (itemId: string, value: string) => {
    const num = parseFloat(value);
    setCounts((prev) => ({
      ...prev,
      [itemId]: isNaN(num) ? 0 : Math.max(0, num)
    }));
  };

  const handleResetToSystem = () => {
    const fresh: Record<string, number> = {};
    items.forEach((item) => {
      fresh[item.id] = item.currentStock;
    });
    setCounts(fresh);
  };

  const discrepanciesCount = varianceResult.discrepancies.filter((d) => d.difference !== 0).length;

  const handleReconcile = () => {
    onApplyAudit(counts, auditorName, auditNotes);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-stone-600 text-xs font-semibold uppercase tracking-wider">
              <ClipboardCheck className="w-4 h-4 text-amber-600" />
              <span>Physical Count &amp; Reconciliation Audit</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1 font-editorial">
              Weekly / Shift Physical Stock Take
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
              Conduct a floor walk-through of the espresso bar, walk-in cooler, and dry storage.
              Enter physical counts to identify variances, shrinkages, or unrecorded waste.
            </p>
          </div>

          {/* Location & Auditor inputs */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                Filter by Station
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-stone-800 font-medium focus:outline-none"
              >
                <option value="all">All Stations &amp; Storage</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                Audited By
              </label>
              <input
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-stone-800 font-medium focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Audit Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-stone-100">
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-[11px] text-stone-500">Items Being Counted</span>
            <div className="text-lg font-bold text-stone-900 mt-0.5">{auditItems.length} lines</div>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-[11px] text-stone-500">Discrepancies Found</span>
            <div
              className={`text-lg font-bold mt-0.5 ${
                discrepanciesCount > 0 ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {discrepanciesCount} items {discrepanciesCount === 0 ? '(Perfect match)' : ''}
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-[11px] text-stone-500">Net Valuation Variance</span>
            <div
              className={`text-lg font-bold mt-0.5 ${
                varianceResult.totalVarianceCost < 0
                  ? 'text-rose-700'
                  : varianceResult.totalVarianceCost > 0
                  ? 'text-sky-700'
                  : 'text-emerald-700'
              }`}
            >
              {varianceResult.totalVarianceCost < 0 ? '-' : varianceResult.totalVarianceCost > 0 ? '+' : ''}$
              {Math.abs(varianceResult.totalVarianceCost).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Counting Sheet Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="text-xs font-semibold text-stone-700">
            Count Sheet ({auditItems.length} items in view)
          </div>
          <button
            onClick={handleResetToSystem}
            className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 bg-white px-2.5 py-1 rounded-md border border-stone-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Counts to System Levels</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-100/60 text-stone-500 font-semibold border-b border-stone-200">
                <th className="py-3 px-4">Item &amp; Location</th>
                <th className="py-3 px-4 text-center">System Recorded</th>
                <th className="py-3 px-4 text-center">Physical Count</th>
                <th className="py-3 px-4 text-center">Variance (Delta)</th>
                <th className="py-3 px-4 text-right">Financial Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {auditItems.map((item) => {
                const currentCount = counts[item.id] !== undefined ? counts[item.id] : item.currentStock;
                const difference = Number((currentCount - item.currentStock).toFixed(3));
                const varianceCost = Number((difference * item.costPerUnit).toFixed(2));
                const hasVariance = difference !== 0;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-stone-50/70 transition-colors ${
                      hasVariance ? (difference < 0 ? 'bg-rose-50/30' : 'bg-sky-50/30') : ''
                    }`}
                  >
                    {/* Item & Location */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{item.name}</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        {item.location} · {item.sku}
                      </div>
                    </td>

                    {/* System Recorded */}
                    <td className="py-3 px-4 text-center font-medium text-stone-600">
                      {item.currentStock} {item.unit}
                    </td>

                    {/* Physical Count Input */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="number"
                          step={item.unit === 'kg' || item.unit === 'L' ? '0.1' : '1'}
                          min="0"
                          value={currentCount}
                          onChange={(e) => handleCountChange(item.id, e.target.value)}
                          className="w-20 text-center py-1 px-2 border rounded-md font-bold text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                        />
                        <span className="text-stone-400 text-[11px]">{item.unit}</span>
                      </div>
                    </td>

                    {/* Variance Delta */}
                    <td className="py-3 px-4 text-center">
                      {!hasVariance ? (
                        <span className="text-emerald-700 font-medium flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 0.00
                        </span>
                      ) : difference < 0 ? (
                        <span className="text-rose-700 font-bold">
                          {difference} {item.unit} (Shortage)
                        </span>
                      ) : (
                        <span className="text-sky-700 font-bold">
                          +{difference} {item.unit} (Surplus)
                        </span>
                      )}
                    </td>

                    {/* Financial Impact */}
                    <td className="py-3 px-4 text-right">
                      {!hasVariance ? (
                        <span className="text-stone-400">$0.00</span>
                      ) : varianceCost < 0 ? (
                        <span className="font-bold text-rose-700">-${Math.abs(varianceCost).toFixed(2)}</span>
                      ) : (
                        <span className="font-bold text-sky-700">+${varianceCost.toFixed(2)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-500">
            Note: Applying reconciliation will update active inventory levels and record an audit adjustment log entry.
          </div>

          <button
            onClick={handleReconcile}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg text-xs shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Apply Reconciled Counts to Inventory</span>
          </button>
        </div>
      </div>
    </div>
  );
};
