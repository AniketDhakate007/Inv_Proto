import React, { useState } from 'react';
import { Plus, Minus, X, AlertCircle } from 'lucide-react';
import { InventoryItem, MovementType } from '../types/inventory.ts';

interface QuickAdjustModalProps {
  item: InventoryItem;
  defaultAction: 'add' | 'subtract';
  onClose: () => void;
  onConfirm: (
    itemId: string,
    delta: number,
    type: MovementType,
    reason: string,
    performedBy: string
  ) => void;
}

export const QuickAdjustModal: React.FC<QuickAdjustModalProps> = ({
  item,
  defaultAction,
  onClose,
  onConfirm,
}) => {
  const [action, setAction] = useState<'add' | 'subtract'>(defaultAction);
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>(
    defaultAction === 'add' ? 'Received stock shipment / delivery' : 'Bar prep / daily barista usage'
  );
  const [performedBy, setPerformedBy] = useState<string>('Barista Shift Lead');

  const newStock = action === 'add'
    ? Number((item.currentStock + quantity).toFixed(3))
    : Number(Math.max(0, item.currentStock - quantity).toFixed(3));

  const delta = action === 'add' ? quantity : -quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    let movementType: MovementType = 'manual_adjustment';
    if (action === 'add') {
      movementType = 'received';
    } else {
      if (reason.toLowerCase().includes('spill') || reason.toLowerCase().includes('drop')) {
        movementType = 'spillage';
      } else if (reason.toLowerCase().includes('expir') || reason.toLowerCase().includes('stale')) {
        movementType = 'expired_waste';
      } else {
        movementType = 'manual_adjustment';
      }
    }

    onConfirm(item.id, delta, movementType, reason, performedBy);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-stone-900 font-editorial">
              Adjust Stock Level
            </h3>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {item.name} ({item.sku})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Action Segmented Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setAction('add');
                setReason('Received stock shipment / delivery');
              }}
              className={`py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                action === 'add'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stock (+)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAction('subtract');
                setReason('Bar prep / daily barista usage');
              }}
              className={`py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                action === 'subtract'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Deduct Stock (-)</span>
            </button>
          </div>

          {/* Quantity Input & Current Stock Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Adjustment Amount ({item.unit})
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-bold bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
            </div>

            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs">
              <span className="text-stone-400">Projected Balance</span>
              <div className="text-base font-bold text-stone-900 mt-0.5">
                {newStock} {item.unit}
              </div>
              <span className="text-[10px] text-stone-500">
                Current: {item.currentStock} {item.unit}
              </span>
            </div>
          </div>

          {/* Quick presets for common numbers */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-stone-400">Presets:</span>
            {[1, 2, 5, 10].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQuantity(preset)}
                className="px-2 py-0.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Reason / Activity Description
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-800 font-medium mb-1.5"
            >
              {action === 'add' ? (
                <>
                  <option value="Received stock shipment / delivery">Received stock shipment / delivery</option>
                  <option value="Supplier restock order arrival">Supplier restock order arrival</option>
                  <option value="Found unaccounted inventory">Found unaccounted inventory</option>
                  <option value="Return / exchange from vendor">Return / exchange from vendor</option>
                </>
              ) : (
                <>
                  <option value="Bar prep / daily barista usage">Bar prep / daily barista usage</option>
                  <option value="Spillage / accidental drop during shift">Spillage / accidental drop during shift</option>
                  <option value="Machine calibration / grind dial-in test">Machine calibration / grind dial-in test</option>
                  <option value="Past shelf life / expired">Past shelf life / expired</option>
                  <option value="Customer complaint remake">Customer complaint remake</option>
                </>
              )}
            </select>
          </div>

          {/* Performed by */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Staff Member
            </label>
            <input
              type="text"
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-800"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-xs font-bold text-white rounded-lg cursor-pointer shadow-xs ${
                action === 'add' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              Confirm Adjustment ({action === 'add' ? `+${quantity}` : `-${quantity}`})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
