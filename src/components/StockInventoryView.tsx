import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Minus,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle,
  HelpCircle,
  ArrowUpDown
} from 'lucide-react';
import { InventoryItem, ItemCategory, StorageLocation } from '../types/inventory.ts';
import { CATEGORIES } from '../data/mockCafeData.ts';
import { calculateStockStatus } from '../utils/inventoryCalculations.ts';

interface StockInventoryViewProps {
  items: InventoryItem[];
  onOpenQuickAdjust: (item: InventoryItem, defaultAction: 'add' | 'subtract') => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onAddNewItem: () => void;
}

export const StockInventoryView: React.FC<StockInventoryViewProps> = ({
  items,
  onOpenQuickAdjust,
  onEditItem,
  onDeleteItem,
  onAddNewItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock-asc' | 'cost-desc' | 'urgency'>('urgency');

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Location
        if (selectedLocation !== 'all' && item.location !== selectedLocation) {
          return false;
        }

        // Status
        const status = calculateStockStatus(item.currentStock, item.minThreshold, item.expiryDate);
        if (statusFilter === 'low-stock' && status !== 'low-stock') return false;
        if (statusFilter === 'out-of-stock' && status !== 'out-of-stock') return false;
        if (statusFilter === 'expiring' && status !== 'expiring-soon' && status !== 'expired') return false;

        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = item.name.toLowerCase().includes(q);
          const matchesSku = item.sku.toLowerCase().includes(q);
          const matchesSupplier = item.supplierName.toLowerCase().includes(q);
          const matchesLoc = item.location.toLowerCase().includes(q);
          if (!matchesName && !matchesSku && !matchesSupplier && !matchesLoc) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'stock-asc') {
          return (a.currentStock / a.idealStock) - (b.currentStock / b.idealStock);
        }
        if (sortBy === 'cost-desc') {
          return (b.currentStock * b.costPerUnit) - (a.currentStock * a.costPerUnit);
        }
        // Urgency: out-of-stock first, then low-stock, then expiring, then healthy
        const score = (item: InventoryItem) => {
          const st = calculateStockStatus(item.currentStock, item.minThreshold, item.expiryDate);
          if (st === 'out-of-stock') return 4;
          if (st === 'expired') return 3.5;
          if (st === 'low-stock') return 3;
          if (st === 'expiring-soon') return 2;
          return 1;
        };
        return score(b) - score(a);
      });
  }, [items, selectedCategory, selectedLocation, statusFilter, searchQuery, sortBy]);

  // Unique locations from items
  const locations = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.location));
    return Array.from(set).sort();
  }, [items]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Current Stock', 'Unit', 'Par Level', 'Ideal Stock', 'Unit Cost', 'Total Value', 'Location', 'Supplier', 'Expiry Date'];
    const rows = filteredItems.map((i) => [
      i.sku,
      `"${i.name.replace(/"/g, '""')}"`,
      i.category,
      i.currentStock,
      i.unit,
      i.minThreshold,
      i.idealStock,
      i.costPerUnit.toFixed(2),
      (i.currentStock * i.costPerUnit).toFixed(2),
      `"${i.location}"`,
      `"${i.supplierName}"`,
      i.expiryDate || 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crema-cafe-inventory-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Category Horizontal Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          All Items ({items.length})
        </button>

        {CATEGORIES.map((cat) => {
          const count = items.filter((i) => i.category === cat.id).length;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] ${isSelected ? 'text-amber-300' : 'text-stone-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search beans, milks, syrups, SKU, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs px-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills / Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('low-stock')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'low-stock' ? 'bg-amber-100 text-amber-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStatusFilter('expiring')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'expiring' ? 'bg-rose-100 text-rose-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Expiring
            </button>
          </div>

          {/* Location Dropdown */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 text-stone-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 text-xs text-stone-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-stone-50 border border-stone-200 text-stone-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="urgency">Sort: Attention First</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="stock-asc">Sort: Stock Level (Low to High)</option>
              <option value="cost-desc">Sort: Highest Valuation ($)</option>
            </select>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            title="Download stock sheet as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-stone-800">No items match your filter</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, status filter, or selected category to see more cafe supplies.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setStatusFilter('all');
                setSelectedLocation('all');
              }}
              className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Item &amp; SKU</th>
                  <th className="py-3 px-4">Location &amp; Supplier</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Status &amp; Expiry</th>
                  <th className="py-3 px-4 text-right">Unit / Value</th>
                  <th className="py-3 px-4 text-center">Quick Adjust</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                {filteredItems.map((item) => {
                  const status = calculateStockStatus(item.currentStock, item.minThreshold, item.expiryDate);
                  const fillPercentage = Math.min(100, Math.round((item.currentStock / item.idealStock) * 100));

                  const isLow = status === 'low-stock';
                  const isOut = status === 'out-of-stock';
                  const isExpiring = status === 'expiring-soon';
                  const isExpired = status === 'expired';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-stone-50/80 transition-colors ${
                        isLow ? 'bg-amber-50/30' : isExpiring ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Name & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900 leading-tight">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1.5">
                          <span>{item.sku}</span>
                          {item.batchNumber && (
                            <>
                              <span>·</span>
                              <span>{item.batchNumber}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Location & Supplier */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-800">{item.location}</div>
                        <div className="text-[11px] text-stone-400 mt-0.5">{item.supplierName}</div>
                      </td>

                      {/* Stock Level & Visual Bar */}
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <span className="font-bold text-stone-900 text-sm">
                            {item.currentStock} {item.unit}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            Par: {item.minThreshold} {item.unit} · Ideal: {item.idealStock}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOut
                                ? 'bg-rose-500 w-full'
                                : isLow
                                ? 'bg-amber-500'
                                : isExpiring
                                ? 'bg-rose-400'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(4, fillPercentage)}%` }}
                          />
                        </div>
                      </td>

                      {/* Status & Expiry */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {isOut && (
                            <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock
                            </span>
                          )}
                          {isLow && (
                            <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Low Stock ({item.currentStock} left)
                            </span>
                          )}
                          {status === 'in-stock' && (
                            <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> In Stock
                            </span>
                          )}

                          {item.expiryDate && (
                            <div className="text-[11px] text-stone-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>Exp: {item.expiryDate}</span>
                              {isExpiring && (
                                <span className="text-rose-600 font-semibold">(Expiring soon)</span>
                              )}
                              {isExpired && (
                                <span className="text-rose-700 font-bold">(Expired!)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Unit / Total Cost */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-semibold text-stone-900">
                          ${(item.currentStock * item.costPerUnit).toFixed(2)}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          ${item.costPerUnit.toFixed(2)} / {item.unit}
                        </div>
                      </td>

                      {/* Quick Adjust Stepper (+ / -) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenQuickAdjust(item, 'subtract')}
                            className="p-1 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors border border-stone-200 cursor-pointer"
                            title="Quick log usage / spillage"
                            aria-label={`Subtract stock for ${item.name}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-mono font-medium px-1 text-stone-700">
                            {item.currentStock}
                          </span>
                          <button
                            onClick={() => onOpenQuickAdjust(item, 'add')}
                            className="p-1 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors border border-stone-200 cursor-pointer"
                            title="Quick receive stock"
                            aria-label={`Add stock for ${item.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Edit / Delete actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                            title="Edit details"
                            aria-label={`Edit ${item.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${item.name}" from cafe stock inventory?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete item"
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info bar */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <div>
            Showing <span className="font-semibold text-stone-800">{filteredItems.length}</span> of {items.length} total inventory items
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Optimal Par
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Low Stock
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Expiring Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
