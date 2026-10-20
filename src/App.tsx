import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { NavigationTabs, TabKey } from './components/NavigationTabs.tsx';
import { StockInventoryView } from './components/StockInventoryView.tsx';
import { RecipeSimulatorView } from './components/RecipeSimulatorView.tsx';
import { StockAuditView } from './components/StockAuditView.tsx';
import { PurchaseOrdersView } from './components/PurchaseOrdersView.tsx';
import { WasteLogView } from './components/WasteLogView.tsx';
import { SuppliersView } from './components/SuppliersView.tsx';
import { QuickAdjustModal } from './components/QuickAdjustModal.tsx';
import { ItemFormModal } from './components/ItemFormModal.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import {
  INITIAL_ITEMS,
  INITIAL_SUPPLIERS,
  INITIAL_MOVEMENT_LOGS,
  INITIAL_PURCHASE_ORDERS,
  CAFE_RECIPES
} from './data/mockCafeData.ts';
import {
  InventoryItem,
  Supplier,
  StockMovementLog,
  PurchaseOrder,
  CafeRecipe,
  MovementType
} from './types/inventory.ts';
import {
  calculateStockStatus,
  deductRecipeStock
} from './utils/inventoryCalculations.ts';

export default function App() {
  // Inventory state with localStorage caching
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('crema_cafe_items');
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    } catch {
      return INITIAL_ITEMS;
    }
  });

  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);

  const [movementLogs, setMovementLogs] = useState<StockMovementLog[]>(() => {
    try {
      const saved = localStorage.getItem('crema_cafe_logs');
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENT_LOGS;
    } catch {
      return INITIAL_MOVEMENT_LOGS;
    }
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem('crema_cafe_pos');
      return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
    } catch {
      return INITIAL_PURCHASE_ORDERS;
    }
  });

  const [activeTab, setActiveTab] = useState<TabKey>('inventory');

  // Modals state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [quickAdjustTarget, setQuickAdjustTarget] = useState<{
    item: InventoryItem;
    action: 'add' | 'subtract';
  } | null>(null);

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'warning' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('crema_cafe_items', JSON.stringify(items));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('crema_cafe_logs', JSON.stringify(movementLogs));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [movementLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('crema_cafe_pos', JSON.stringify(purchaseOrders));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [purchaseOrders]);

  // Derived counts for tabs
  const lowStockCount = items.filter(
    (i) => calculateStockStatus(i.currentStock, i.minThreshold, i.expiryDate) === 'low-stock'
  ).length;

  const openPOCount = purchaseOrders.filter((po) => po.status !== 'received').length;

  // 1. Quick stock adjust (+ / -)
  const handleQuickAdjustConfirm = (
    itemId: string,
    delta: number,
    type: MovementType,
    reason: string,
    performedBy: string
  ) => {
    const target = items.find((i) => i.id === itemId);
    if (!target) return;

    const newStock = Math.max(0, Number((target.currentStock + delta).toFixed(3)));
    const costImpact = Number((Math.abs(delta) * target.costPerUnit).toFixed(2));

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, currentStock: newStock } : i))
    );

    const log: StockMovementLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      itemId: target.id,
      itemName: target.name,
      type,
      quantityDelta: delta,
      unit: target.unit,
      reason,
      performedBy,
      costImpact: delta < 0 ? costImpact : 0
    };

    setMovementLogs((prev) => [log, ...prev]);

    addToast(
      'success',
      `Stock Adjusted: ${target.name}`,
      `${delta > 0 ? `+${delta}` : delta} ${target.unit} recorded (${reason})`
    );
  };

  // 2. Save Item (Create or Edit)
  const handleSaveItem = (item: InventoryItem) => {
    const isEdit = items.some((i) => i.id === item.id);
    if (isEdit) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      addToast('success', 'Item Updated', `"${item.name}" parameters saved.`);
    } else {
      setItems((prev) => [item, ...prev]);
      addToast('success', 'Item Added', `"${item.name}" is now being tracked in stock.`);
    }
  };

  // 3. Delete Item
  const handleDeleteItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (target) {
      addToast('info', 'Item Removed', `"${target.name}" has been deleted from inventory.`);
    }
  };

  // 4. Recipe POS Drink Simulation
  const handleDeductRecipe = (recipe: CafeRecipe, quantity: number, baristaName: string) => {
    const result = deductRecipeStock(items, recipe, quantity, baristaName);

    setItems(result.updatedInventory);
    setMovementLogs((prev) => [...result.logs, ...prev]);

    addToast(
      'success',
      `Order Prepared: ${quantity}x ${recipe.name}`,
      `Deducted ${recipe.ingredients.length} ingredients from cafe stock balances.`
    );
  };

  // 5. Apply Physical Count Audit
  const handleApplyAudit = (
    counts: Record<string, number>,
    auditorName: string,
    notes: string
  ) => {
    let reconciledCount = 0;
    const newLogs: StockMovementLog[] = [];

    const updated = items.map((item) => {
      if (counts[item.id] !== undefined) {
        const physical = counts[item.id];
        const diff = Number((physical - item.currentStock).toFixed(3));

        if (diff !== 0) {
          reconciledCount++;
          newLogs.push({
            id: `audit-${Date.now()}-${item.id}`,
            timestamp: new Date().toISOString(),
            itemId: item.id,
            itemName: item.name,
            type: 'audit_adjustment',
            quantityDelta: diff,
            unit: item.unit,
            reason: `Physical count reconciliation (${notes})`,
            performedBy: auditorName,
            costImpact: Number((diff * item.costPerUnit).toFixed(2))
          });
        }
        return { ...item, currentStock: physical };
      }
      return item;
    });

    setItems(updated);
    setMovementLogs((prev) => [...newLogs, ...prev]);

    addToast(
      'success',
      'Audit Reconciled Successfully',
      `Adjusted ${reconciledCount} variance items to match physical stock counts.`
    );
    setActiveTab('inventory');
  };

  // 6. Purchase Order creation & receiving
  const handleCreateOrder = (order: PurchaseOrder) => {
    setPurchaseOrders((prev) => [order, ...prev]);
    addToast('success', 'Purchase Order Created', `${order.poNumber} generated for ${order.supplierName}.`);
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'draft' | 'ordered') => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === orderId ? { ...po, status } : po))
    );
    addToast('info', 'Order Dispatched', `PO marked as ${status} with supplier.`);
  };

  const handleReceiveOrder = (orderId: string) => {
    const po = purchaseOrders.find((p) => p.id === orderId);
    if (!po) return;

    // Add ordered quantities directly back to stock
    const itemMap = new Map<string, InventoryItem>(items.map((i) => [i.id, { ...i }]));
    const now = new Date().toISOString();
    const receiveLogs: StockMovementLog[] = [];

    for (const line of po.items) {
      const existing = itemMap.get(line.itemId);
      if (existing) {
        existing.currentStock = Number((existing.currentStock + line.orderQuantity).toFixed(3));
        existing.lastRestocked = now.split('T')[0];
        itemMap.set(existing.id, existing);

        receiveLogs.push({
          id: `rec-${Date.now()}-${line.itemId}`,
          timestamp: now,
          itemId: existing.id,
          itemName: existing.name,
          type: 'received',
          quantityDelta: line.orderQuantity,
          unit: line.unit,
          reason: `Restocked via PO arrival ${po.poNumber}`,
          performedBy: 'Receiving Dock',
          costImpact: line.totalCost
        });
      }
    }

    setItems(Array.from(itemMap.values()));
    setMovementLogs((prev) => [...receiveLogs, ...prev]);
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === orderId ? { ...p, status: 'received', receivedAt: now } : p))
    );

    addToast(
      'success',
      `Shipment Received: ${po.poNumber}`,
      `Restocked ${po.items.length} lines into inventory for ${po.supplierName}.`
    );
  };

  // 7. Log Waste
  const handleLogWaste = (
    itemId: string,
    quantity: number,
    type: 'spillage' | 'expired_waste',
    reason: string,
    performedBy: string
  ) => {
    const target = items.find((i) => i.id === itemId);
    if (!target) return;

    const newStock = Math.max(0, Number((target.currentStock - quantity).toFixed(3)));
    const costImpact = Number((quantity * target.costPerUnit).toFixed(2));

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, currentStock: newStock } : i))
    );

    const log: StockMovementLog = {
      id: `waste-${Date.now()}`,
      timestamp: new Date().toISOString(),
      itemId: target.id,
      itemName: target.name,
      type,
      quantityDelta: -quantity,
      unit: target.unit,
      reason,
      performedBy,
      costImpact
    };

    setMovementLogs((prev) => [log, ...prev]);

    addToast(
      'warning',
      `Loss Recorded: ${target.name}`,
      `Deducted ${quantity} ${target.unit} ($${costImpact.toFixed(2)} loss) - ${reason}`
    );
  };

  // 8. Scenario Presets
  const handleApplyPreset = (preset: 'normal' | 'rush-alert' | 'reset') => {
    if (preset === 'reset') {
      setItems(INITIAL_ITEMS);
      setMovementLogs(INITIAL_MOVEMENT_LOGS);
      setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
      localStorage.removeItem('crema_cafe_items');
      localStorage.removeItem('crema_cafe_logs');
      localStorage.removeItem('crema_cafe_pos');
      addToast('info', 'Reset Complete', 'Restored pristine demo cafe data.');
      return;
    }

    if (preset === 'rush-alert') {
      // Simulate heavy rush: Oat milk down to 2L, whole milk to 3L, 12oz cups down to 18 units, croissants to 2
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === 'item-milk-oat') return { ...i, currentStock: 2.0 };
          if (i.id === 'item-milk-whole') return { ...i, currentStock: 3.5 };
          if (i.id === 'item-pkg-cup-12oz') return { ...i, currentStock: 25 };
          if (i.id === 'item-pastry-croissant') return { ...i, currentStock: 2 };
          if (i.id === 'item-coffee-house') return { ...i, currentStock: 1.8 };
          return i;
        })
      );
      addToast('warning', 'Afternoon Rush Scenario Active', 'Multiple core supplies dropped below threshold!');
      setActiveTab('inventory');
    }

    if (preset === 'normal') {
      setItems(INITIAL_ITEMS);
      addToast('success', 'Standard Morning Scenario', 'Morning shift par levels loaded.');
      setActiveTab('inventory');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col selection:bg-amber-200">
      {/* Top Header */}
      <Header
        items={items}
        onOpenNewItem={() => {
          setEditingItem(null);
          setItemModalOpen(true);
        }}
        onOpenDrinkSimulator={() => setActiveTab('recipes')}
        onOpenAudit={() => setActiveTab('audit')}
        onApplyPreset={handleApplyPreset}
      />

      {/* Navigation Bar */}
      <NavigationTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        lowStockCount={lowStockCount}
        openPOCount={openPOCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'inventory' && (
          <StockInventoryView
            items={items}
            onOpenQuickAdjust={(item, defaultAction) => {
              setQuickAdjustTarget({ item, action: defaultAction });
            }}
            onEditItem={(item) => {
              setEditingItem(item);
              setItemModalOpen(true);
            }}
            onDeleteItem={handleDeleteItem}
            onAddNewItem={() => {
              setEditingItem(null);
              setItemModalOpen(true);
            }}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipeSimulatorView
            inventory={items}
            onDeductRecipe={handleDeductRecipe}
          />
        )}

        {activeTab === 'audit' && (
          <StockAuditView
            items={items}
            onApplyAudit={handleApplyAudit}
          />
        )}

        {activeTab === 'orders' && (
          <PurchaseOrdersView
            orders={purchaseOrders}
            suppliers={suppliers}
            items={items}
            onCreateOrder={handleCreateOrder}
            onReceiveOrder={handleReceiveOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'waste' && (
          <WasteLogView
            logs={movementLogs}
            items={items}
            onLogWaste={handleLogWaste}
          />
        )}

        {activeTab === 'suppliers' && (
          <SuppliersView
            suppliers={suppliers}
            items={items}
            onTriggerReorder={(supplierId) => {
              setActiveTab('orders');
            }}
          />
        )}
      </main>

      {/* Modals */}
      {itemModalOpen && (
        <ItemFormModal
          initialItem={editingItem}
          suppliers={suppliers}
          onClose={() => setItemModalOpen(false)}
          onSave={handleSaveItem}
        />
      )}

      {quickAdjustTarget && (
        <QuickAdjustModal
          item={quickAdjustTarget.item}
          defaultAction={quickAdjustTarget.action}
          onClose={() => setQuickAdjustTarget(null)}
          onConfirm={handleQuickAdjustConfirm}
        />
      )}

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Clean quiet footer */}
      <footer className="mt-auto py-5 border-t border-stone-200 bg-white text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Crema &amp; Co. Artisan Roasters · Integrated Stock Control &amp; FIFO Inventory
          </div>
          <div className="text-stone-400">
            Shift: Morning Service · All Par Levels Calibrated
          </div>
        </div>
      </footer>
    </div>
  );
}
