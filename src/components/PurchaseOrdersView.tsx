import React, { useState } from 'react';
import { ShoppingCart, Plus, CheckCircle, Truck, Download, AlertTriangle, Package, Calendar } from 'lucide-react';
import { PurchaseOrder, InventoryItem, Supplier } from '../types/inventory.ts';
import { generateSuggestedOrderItems } from '../utils/inventoryCalculations.ts';

interface PurchaseOrdersViewProps {
  orders: PurchaseOrder[];
  suppliers: Supplier[];
  items: InventoryItem[];
  onCreateOrder: (order: PurchaseOrder) => void;
  onReceiveOrder: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: 'draft' | 'ordered') => void;
}

export const PurchaseOrdersView: React.FC<PurchaseOrdersViewProps> = ({
  orders,
  suppliers,
  items,
  onCreateOrder,
  onReceiveOrder,
  onUpdateOrderStatus,
}) => {
  const [selectedPOId, setSelectedPOId] = useState<string>(orders[0]?.id || '');
  const [showAutoModal, setShowAutoModal] = useState<boolean>(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [customNotes, setCustomNotes] = useState<string>('');

  const selectedPO = orders.find((o) => o.id === selectedPOId) || orders[0] || null;

  // Find low items for the modal preview
  const lowItems = items.filter((i) => i.currentStock <= i.minThreshold);
  const suggestedItems = generateSuggestedOrderItems(
    items,
    selectedSupplierId ? selectedSupplierId : undefined
  );

  const selectedSupplier = suppliers.find((s) => s.id === (selectedPO?.supplierId || selectedSupplierId));

  const handleCreateAutoOrder = () => {
    if (suggestedItems.length === 0) return;

    const supplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
    const totalAmount = suggestedItems.reduce((acc, curr) => acc + curr.totalCost, 0);

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      status: 'draft',
      createdAt: new Date().toISOString(),
      items: suggestedItems,
      totalAmount: Number(totalAmount.toFixed(2)),
      notes: customNotes || `Auto-replenishment for par levels (${supplier.name})`
    };

    onCreateOrder(newPO);
    setSelectedPOId(newPO.id);
    setShowAutoModal(false);
  };

  // Export current PO as CSV
  const handleExportPOCSV = (po: PurchaseOrder) => {
    const headers = ['PO Number', 'Supplier', 'Item Name', 'Order Quantity', 'Unit', 'Unit Price', 'Line Total'];
    const rows = po.items.map((i) => [
      po.poNumber,
      `"${po.supplierName}"`,
      `"${i.itemName.replace(/"/g, '""')}"`,
      i.orderQuantity,
      i.unit,
      i.unitPrice.toFixed(2),
      i.totalCost.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${po.poNumber}-${po.supplierName.toLowerCase().replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-600 text-xs font-semibold uppercase tracking-wider">
            <ShoppingCart className="w-4 h-4 text-amber-600" />
            <span>Supplier Purchase Orders &amp; Restock</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 mt-1 font-editorial">
            Restock Orders &amp; Replenishment
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Automatically calculate quantities needed to return inventory to target par levels.
            Dispatch orders to roasters, dairies, and packaging vendors, and receive shipments in 1 click.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAutoModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Auto-Generate Reorder ({lowItems.length} Low Items)</span>
          </button>
        </div>
      </div>

      {/* Grid: PO List on Left vs Selected PO Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: PO List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-1">
            Order History &amp; Active Shipments
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {orders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-stone-200 text-stone-500 text-xs">
                No purchase orders yet. Click "Auto-Generate Reorder" to create one.
              </div>
            ) : (
              orders.map((po) => {
                const isSelected = selectedPO?.id === po.id;
                const isReceived = po.status === 'received';
                const isOrdered = po.status === 'ordered';

                return (
                  <div
                    key={po.id}
                    onClick={() => setSelectedPOId(po.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-stone-900">
                          {po.poNumber}
                        </span>
                        <h4 className="text-xs font-semibold text-stone-700 mt-0.5">
                          {po.supplierName}
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isReceived
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOrdered
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {po.status}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span>{po.items.length} line items</span>
                      <span className="font-bold text-stone-900">${po.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected PO Inspector */}
        <div className="lg:col-span-8">
          {selectedPO ? (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-stone-900 font-mono">
                      {selectedPO.poNumber}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        selectedPO.status === 'received'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedPO.status === 'ordered'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {selectedPO.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Vendor: <span className="font-semibold text-stone-800">{selectedPO.supplierName}</span>
                    {selectedSupplier && ` · Lead time ~${selectedSupplier.leadTimeDays} days`}
                  </p>
                </div>

                {/* PO Actions */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => handleExportPOCSV(selectedPO)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>

                  {selectedPO.status === 'draft' && (
                    <button
                      onClick={() => onUpdateOrderStatus(selectedPO.id, 'ordered')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Mark Sent / In Transit</span>
                    </button>
                  )}

                  {selectedPO.status === 'ordered' && (
                    <button
                      onClick={() => onReceiveOrder(selectedPO.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Receive &amp; Restock Inventory</span>
                    </button>
                  )}

                  {selectedPO.status === 'received' && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Received &amp; Stock Updated
                    </span>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
                  Order Line Items
                </h4>
                <div className="border border-stone-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3 text-center">Current Stock</th>
                        <th className="py-2.5 px-3 text-center">Order Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selectedPO.items.map((line, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="py-2.5 px-3 font-medium text-stone-900">
                            {line.itemName}
                          </td>
                          <td className="py-2.5 px-3 text-center text-stone-500">
                            {line.currentStock} {line.unit}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-stone-900">
                            {line.orderQuantity} {line.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-600">
                            ${line.unitPrice.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-stone-900">
                            ${line.totalCost.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-stone-50 border-t border-stone-200 font-bold text-stone-900">
                        <td colSpan={4} className="py-3 px-3 text-right">
                          Total Invoice Value:
                        </td>
                        <td className="py-3 px-3 text-right text-base text-stone-950 font-mono">
                          ${selectedPO.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Vendor & Delivery Notes */}
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-1">
                <span className="font-semibold text-stone-700">Delivery &amp; Vendor Notes:</span>
                <p className="text-stone-500">{selectedPO.notes || 'No special instructions recorded.'}</p>
                {selectedPO.receivedAt && (
                  <p className="text-emerald-700 font-medium pt-1">
                    Received at: {new Date(selectedPO.receivedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-400 text-xs">
              Select an order from the left column to view line items and manage status.
            </div>
          )}
        </div>
      </div>

      {/* Auto Reorder Modal */}
      {showAutoModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-editorial">
                Auto-Generate Supplier Reorder
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Calculates suggested restock quantities up to ideal par level for items currently low or out of stock.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Select Vendor / Supplier
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-800 font-medium"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold text-stone-700 mb-2">
                Items to be Ordered ({suggestedItems.length})
              </div>
              {suggestedItems.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs text-center">
                  All items for this supplier are currently well above par levels! No reorder needed.
                </div>
              ) : (
                <div className="border border-stone-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-stone-100 text-xs">
                  {suggestedItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-stone-900">{item.itemName}</div>
                        <div className="text-[11px] text-stone-400">
                          Current: {item.currentStock} {item.unit} → Target: {item.targetStock}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-stone-900">
                          +{item.orderQuantity} {item.unit}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          ${item.totalCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Order Notes / Delivery Time Request
              </label>
              <textarea
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Please deliver by 6:30 AM before morning cafe opening"
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setShowAutoModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAutoOrder}
                disabled={suggestedItems.length === 0}
                className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer ${
                  suggestedItems.length > 0
                    ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-xs'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                Create Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
