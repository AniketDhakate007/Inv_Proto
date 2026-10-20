import React, { useState } from 'react';
import { Trash2, AlertCircle, Plus, DollarSign, Calendar, TrendingDown, User } from 'lucide-react';
import { StockMovementLog, InventoryItem } from '../types/inventory.ts';
import { calculateWasteMetrics } from '../utils/inventoryCalculations.ts';

interface WasteLogViewProps {
  logs: StockMovementLog[];
  items: InventoryItem[];
  onLogWaste: (
    itemId: string,
    quantity: number,
    type: 'spillage' | 'expired_waste',
    reason: string,
    performedBy: string
  ) => void;
}

export const WasteLogView: React.FC<WasteLogViewProps> = ({
  logs,
  items,
  onLogWaste,
}) => {
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [wasteQty, setWasteQty] = useState<number>(1);
  const [wasteType, setWasteType] = useState<'spillage' | 'expired_waste'>('expired_waste');
  const [wasteReason, setWasteReason] = useState<string>('Expired past safe shelf life date');
  const [staffName, setStaffName] = useState<string>('Shift Lead Sam');

  const wasteLogs = logs.filter(
    (l) => l.type === 'spillage' || l.type === 'expired_waste'
  );

  const metrics = calculateWasteMetrics(logs);
  const selectedItem = items.find((i) => i.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || wasteQty <= 0) return;

    onLogWaste(selectedItem.id, wasteQty, wasteType, wasteReason, staffName);
    setShowLogModal(false);
    setWasteQty(1);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-700 text-xs font-semibold uppercase tracking-wider">
            <Trash2 className="w-4 h-4" />
            <span>Spoilage, Spillage &amp; Waste Ledger</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 mt-1 font-editorial">
            Waste Reduction &amp; Expiry Loss Control
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Track unsold pastries, sour milk, machine calibration waste, and bar spills.
            Understand exact cost leakages to refine daily par levels and food ordering.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg text-xs shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Log Waste Incident</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Total Financial Loss</span>
            <DollarSign className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-1">
            ${metrics.totalCostLost.toFixed(2)}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Across {metrics.totalWasteIncidents} recorded incidents
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Highest Loss Line</span>
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-sm font-bold text-stone-900 mt-1 truncate">
            {metrics.breakdown[0]?.name || 'None recorded'}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {metrics.breakdown[0] ? `$${metrics.breakdown[0].cost.toFixed(2)} lost` : 'Clean shift'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Waste Prevention Health</span>
            <AlertCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-stone-900 mt-1">
            {metrics.totalCostLost < 30 ? 'High Efficiency (<$30)' : 'Attention Recommended'}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Targeting &lt; 2% of total cafe stock
          </p>
        </div>
      </div>

      {/* Incident Log Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-700">
          Recorded Spoilage Incidents ({wasteLogs.length})
        </div>

        {wasteLogs.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            No waste or spoilage incidents logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Item &amp; Quantity</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Logged By</th>
                  <th className="py-3 px-4 text-right">Cost Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {wasteLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/60">
                    <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {log.itemName}{' '}
                      <span className="text-stone-500 font-normal">
                        ({Math.abs(log.quantityDelta)} {log.unit})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          log.type === 'expired_waste'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {log.type === 'expired_waste' ? 'Expired' : 'Spillage'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 max-w-xs truncate">
                      {log.reason}
                    </td>
                    <td className="py-3 px-4 text-stone-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>{log.performedBy}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-700">
                      -${Math.abs(log.costImpact).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Waste Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-editorial">
                Log Waste or Spoilage Incident
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Will deduct selected quantity directly from current stock and log financial loss.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Select Item
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-800 font-medium"
              >
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.currentStock} {i.unit} in stock)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Quantity ({selectedItem?.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  max={selectedItem?.currentStock || 100}
                  value={wasteQty}
                  onChange={(e) => setWasteQty(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Incident Type
                </label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value as any)}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-800 font-medium"
                >
                  <option value="expired_waste">Expired / Stale</option>
                  <option value="spillage">Spillage / Dropped</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Reason / Details
              </label>
              <input
                type="text"
                value={wasteReason}
                onChange={(e) => setWasteReason(e.target.value)}
                placeholder="e.g. End of day unsold croissants or slipped cup"
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Barista / Staff Member
              </label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-800"
                required
              />
            </div>

            {selectedItem && (
              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs flex justify-between">
                <span className="text-stone-500">Estimated Cost Impact:</span>
                <span className="font-bold text-rose-700">
                  -${(wasteQty * selectedItem.costPerUnit).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-lg cursor-pointer"
              >
                Record Waste &amp; Deduct Stock
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
