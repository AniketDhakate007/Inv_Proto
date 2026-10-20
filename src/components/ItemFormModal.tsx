import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { InventoryItem, ItemCategory, StorageLocation, Supplier } from '../types/inventory.ts';
import { CATEGORIES } from '../data/mockCafeData.ts';

interface ItemFormModalProps {
  initialItem?: InventoryItem | null;
  suppliers: Supplier[];
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
}

const STORAGE_LOCATIONS: StorageLocation[] = [
  'Bar Station 1',
  'Bar Station 2',
  'Walk-in Cooler',
  'Dry Storage Shelf A',
  'Dry Storage Shelf B',
  'Pastry Display Case',
  'Backroom Shelving'
];

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  initialItem,
  suppliers,
  onClose,
  onSave,
}) => {
  const isEditing = !!initialItem;

  const [name, setName] = useState(initialItem?.name || '');
  const [sku, setSku] = useState(initialItem?.sku || '');
  const [category, setCategory] = useState<ItemCategory>(initialItem?.category || 'coffee-beans');
  const [unit, setUnit] = useState<InventoryItem['unit']>(initialItem?.unit || 'kg');
  const [currentStock, setCurrentStock] = useState<number>(initialItem?.currentStock ?? 10);
  const [minThreshold, setMinThreshold] = useState<number>(initialItem?.minThreshold ?? 5);
  const [idealStock, setIdealStock] = useState<number>(initialItem?.idealStock ?? 20);
  const [costPerUnit, setCostPerUnit] = useState<number>(initialItem?.costPerUnit ?? 15.0);
  const [location, setLocation] = useState<StorageLocation>(initialItem?.location || 'Bar Station 1');
  const [supplierId, setSupplierId] = useState(initialItem?.supplierId || suppliers[0]?.id || '');
  const [expiryDate, setExpiryDate] = useState(initialItem?.expiryDate || '');
  const [batchNumber, setBatchNumber] = useState(initialItem?.batchNumber || '');
  const [notes, setNotes] = useState(initialItem?.notes || '');

  // Auto-generate SKU helper
  const handleGenerateSku = () => {
    const catCode = category.slice(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setSku(`${catCode}-${randomNum}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const supplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];

    const newItem: InventoryItem = {
      id: initialItem?.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sku: sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      category,
      unit,
      currentStock: Number(currentStock),
      minThreshold: Number(minThreshold),
      idealStock: Number(idealStock),
      costPerUnit: Number(costPerUnit),
      supplierId: supplier.id,
      supplierName: supplier.name,
      location,
      lastRestocked: initialItem?.lastRestocked || new Date().toISOString().split('T')[0],
      expiryDate: expiryDate.trim() || undefined,
      batchNumber: batchNumber.trim() || undefined,
      notes: notes.trim() || undefined
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-editorial">
              {isEditing ? 'Edit Stock Item' : 'Add New Cafe Stock Line'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Configure inventory parameters, reorder par levels, storage location, and vendor linkage.
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Colombian Supremo Coffee Beans"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-stone-700">SKU Code</label>
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="text-[10px] text-amber-700 hover:text-amber-800 flex items-center gap-0.5 font-medium cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Auto
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="COF-001"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-mono"
              />
            </div>
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Measurement Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="L">Liters (L)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="units">Individual Units</option>
                <option value="bottles">Bottles</option>
                <option value="boxes">Boxes</option>
              </select>
            </div>
          </div>

          {/* Stock Levels: Current, Min Par, Ideal */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Current Stock ({unit})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Par Level (Min Alert)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(parseFloat(e.target.value) || 0)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Ideal Target Stock
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={idealStock}
                onChange={(e) => setIdealStock(parseFloat(e.target.value) || 0)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900"
                required
              />
            </div>
          </div>

          {/* Cost per unit & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Cost Per Unit ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Storage Station / Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as StorageLocation)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              >
                {STORAGE_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Supplier & Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Assigned Supplier
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Expiry Date (For Perishables)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900"
              />
            </div>
          </div>

          {/* Batch Number & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Lot / Batch Number (Optional)
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. LOT-2610-09"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Operational Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Keep refrigerated below 4°C"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer shadow-xs"
            >
              {isEditing ? 'Save Changes' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
