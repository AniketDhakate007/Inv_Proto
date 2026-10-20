import React from 'react';
import { Truck, Mail, Phone, Clock, DollarSign, Package, Plus } from 'lucide-react';
import { Supplier, InventoryItem } from '../types/inventory.ts';

interface SuppliersViewProps {
  suppliers: Supplier[];
  items: InventoryItem[];
  onTriggerReorder: (supplierId: string) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  items,
  onTriggerReorder,
}) => {
  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-600 text-xs font-semibold uppercase tracking-wider">
            <Truck className="w-4 h-4 text-amber-600" />
            <span>Approved Vendors &amp; Supply Chain</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 mt-1 font-editorial">
            Cafe Suppliers &amp; Logistics Directory
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Keep roasteries, local organic dairies, artisan bakeries, and packaging manufacturers in sync.
            Monitor lead times and minimum order constraints before placing weekly replenishment orders.
          </p>
        </div>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {suppliers.map((supplier) => {
          const supplierItems = items.filter((i) => i.supplierId === supplier.id);
          const lowCount = supplierItems.filter((i) => i.currentStock <= i.minThreshold).length;

          return (
            <div
              key={supplier.id}
              className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 flex flex-col justify-between hover:border-stone-300 transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                      {supplier.category}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-2 font-editorial">
                      {supplier.name}
                    </h3>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100 text-xs">
                  <div className="p-2 bg-stone-50 rounded-lg">
                    <div className="text-[10px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Lead Time
                    </div>
                    <div className="font-semibold text-stone-800 mt-0.5">
                      ~{supplier.leadTimeDays} {supplier.leadTimeDays === 1 ? 'day' : 'days'}
                    </div>
                  </div>

                  <div className="p-2 bg-stone-50 rounded-lg">
                    <div className="text-[10px] text-stone-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Min Order
                    </div>
                    <div className="font-semibold text-stone-800 mt-0.5">
                      ${supplier.minOrderValue} MOQ
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-3.5 space-y-1.5 text-xs text-stone-600">
                  <div className="font-medium text-stone-900">{supplier.contactPerson}</div>
                  <div className="flex items-center gap-2 text-stone-500">
                    <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-500">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{supplier.phone}</span>
                  </div>
                </div>

                {/* Supplied Items summary */}
                <div className="mt-4 pt-3 border-t border-stone-100 text-xs">
                  <div className="flex items-center justify-between text-stone-500 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-stone-400" /> Supplied Lines ({supplierItems.length})
                    </span>
                    {lowCount > 0 && (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                        {lowCount} need restock
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto text-[11px] text-stone-600 pr-1">
                    {supplierItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-0.5">
                        <span className="truncate pr-2">{item.name}</span>
                        <span className={`font-mono shrink-0 ${item.currentStock <= item.minThreshold ? 'text-amber-700 font-bold' : 'text-stone-400'}`}>
                          {item.currentStock} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-stone-100">
                <button
                  onClick={() => onTriggerReorder(supplier.id)}
                  className="w-full py-2 px-3 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-stone-950" />
                  <span>Create Reorder with {supplier.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
