import type { InventoryItem, StockStatus, CafeRecipe, StockMovementLog, PurchaseOrderItem } from '../types/inventory.ts';

/**
 * Normalizes unit differences between recipe measurements and warehouse stock.
 * Supported conversions:
 * - g to kg (1 kg = 1000 g)
 * - ml to L (1 L = 1000 ml)
 */
export function convertRecipeAmountToItemStockUnit(
  amount: number,
  recipeUnit: string,
  stockUnit: string
): number {
  const normRecipe = recipeUnit.toLowerCase().trim();
  const normStock = stockUnit.toLowerCase().trim();

  if (normRecipe === normStock) {
    return amount;
  }

  // Grams to Kilograms
  if (normRecipe === 'g' && normStock === 'kg') {
    return amount / 1000;
  }
  // Kilograms to Grams
  if (normRecipe === 'kg' && normStock === 'g') {
    return amount * 1000;
  }

  // Milliliters to Liters
  if (normRecipe === 'ml' && normStock === 'l') {
    return amount / 1000;
  }
  // Liters to Milliliters
  if (normRecipe === 'l' && normStock === 'ml') {
    return amount * 1000;
  }

  // Units, bottles, boxes, packs matching
  return amount;
}

/**
 * Calculates stock health status based on quantity and expiration date.
 */
export function calculateStockStatus(
  currentStock: number,
  minThreshold: number,
  expiryDate?: string,
  currentDateStr: string = new Date().toISOString().split('T')[0]
): StockStatus {
  if (currentStock <= 0) {
    return 'out-of-stock';
  }

  if (expiryDate) {
    const today = new Date(currentDateStr);
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'expired';
    }
    if (diffDays <= 3) {
      return 'expiring-soon';
    }
  }

  if (currentStock <= minThreshold) {
    return 'low-stock';
  }

  return 'in-stock';
}

/**
 * Computes high-level KPI metrics for the cafe owner's dashboard.
 */
export function calculateInventoryValuation(
  items: InventoryItem[],
  currentDateStr?: string
) {
  let totalStockCost = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let expiringSoonCount = 0;
  let expiredCount = 0;
  let healthyCount = 0;

  for (const item of items) {
    const itemValuation = Math.max(0, item.currentStock) * item.costPerUnit;
    totalStockCost += itemValuation;

    const status = calculateStockStatus(
      item.currentStock,
      item.minThreshold,
      item.expiryDate,
      currentDateStr
    );

    if (status === 'out-of-stock') outOfStockCount++;
    else if (status === 'expired') expiredCount++;
    else if (status === 'expiring-soon') expiringSoonCount++;
    else if (status === 'low-stock') lowStockCount++;
    else healthyCount++;
  }

  return {
    totalItems: items.length,
    totalStockCost: Number(totalStockCost.toFixed(2)),
    healthyCount,
    lowStockCount,
    outOfStockCount,
    expiringSoonCount,
    expiredCount,
    needsAttentionCount: lowStockCount + outOfStockCount + expiringSoonCount + expiredCount
  };
}

/**
 * Simulates ringing up a cafe menu recipe and deducts accurate stock quantities
 * including milk, coffee beans, syrups, cups, and lids.
 */
export function deductRecipeStock(
  inventory: InventoryItem[],
  recipe: CafeRecipe,
  multiplier: number = 1,
  performedBy: string = 'Barista Station'
): {
  updatedInventory: InventoryItem[];
  logs: StockMovementLog[];
  shortages: { itemName: string; required: number; available: number; unit: string }[];
} {
  const inventoryMap = new Map<string, InventoryItem>(
    inventory.map((item) => [item.id, { ...item }])
  );

  const logs: StockMovementLog[] = [];
  const shortages: { itemName: string; required: number; available: number; unit: string }[] = [];
  const now = new Date().toISOString();

  for (const ingredient of recipe.ingredients) {
    const item = inventoryMap.get(ingredient.itemId);
    if (!item) continue;

    const totalNeededRecipeUnits = ingredient.amount * multiplier;
    const deductionInStockUnits = convertRecipeAmountToItemStockUnit(
      totalNeededRecipeUnits,
      ingredient.unit,
      item.unit
    );

    if (item.currentStock < deductionInStockUnits) {
      shortages.push({
        itemName: item.name,
        required: Number(deductionInStockUnits.toFixed(3)),
        available: Number(item.currentStock.toFixed(3)),
        unit: item.unit
      });
    }

    const newStock = Math.max(0, Number((item.currentStock - deductionInStockUnits).toFixed(3)));
    const costImpact = Number((deductionInStockUnits * item.costPerUnit).toFixed(2));

    item.currentStock = newStock;
    inventoryMap.set(item.id, item);

    logs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now,
      itemId: item.id,
      itemName: item.name,
      type: 'recipe_deduction',
      quantityDelta: -Number(deductionInStockUnits.toFixed(3)),
      unit: item.unit,
      reason: `Order prep: ${multiplier}x ${recipe.name}`,
      performedBy,
      costImpact
    });
  }

  return {
    updatedInventory: Array.from(inventoryMap.values()),
    logs,
    shortages
  };
}

/**
 * Builds suggested purchase order line items for all items currently below par level.
 */
export function generateSuggestedOrderItems(
  items: InventoryItem[],
  supplierId?: string
): PurchaseOrderItem[] {
  const filtered = supplierId ? items.filter((i) => i.supplierId === supplierId) : items;
  const lowItems = filtered.filter((i) => i.currentStock <= i.minThreshold);

  return lowItems.map((item) => {
    // Fill back to idealStock, or at least 2x minThreshold
    const orderQty = Math.max(1, Math.ceil(item.idealStock - item.currentStock));
    const totalCost = Number((orderQty * item.costPerUnit).toFixed(2));

    return {
      itemId: item.id,
      itemName: item.name,
      unit: item.unit,
      currentStock: item.currentStock,
      targetStock: item.idealStock,
      orderQuantity: orderQty,
      unitPrice: item.costPerUnit,
      totalCost
    };
  });
}

/**
 * Calculates discrepancy and financial variance between physical stock counts and system records.
 */
export function calculateAuditVariance(
  items: InventoryItem[],
  counts: Record<string, number>
) {
  const discrepancies: Array<{
    item: InventoryItem;
    systemStock: number;
    countedStock: number;
    difference: number;
    varianceCost: number;
  }> = [];

  let totalVarianceCost = 0;

  for (const item of items) {
    if (counts[item.id] !== undefined) {
      const counted = counts[item.id];
      const difference = Number((counted - item.currentStock).toFixed(3));
      const varianceCost = Number((difference * item.costPerUnit).toFixed(2));
      totalVarianceCost += varianceCost;

      discrepancies.push({
        item,
        systemStock: item.currentStock,
        countedStock: counted,
        difference,
        varianceCost
      });
    }
  }

  return {
    discrepancies,
    totalVarianceCost: Number(totalVarianceCost.toFixed(2))
  };
}

/**
 * Aggregates waste and spillage losses.
 */
export function calculateWasteMetrics(logs: StockMovementLog[]) {
  const wasteLogs = logs.filter(
    (log) => log.type === 'spillage' || log.type === 'expired_waste'
  );

  let totalCostLost = 0;
  const byItem: Record<string, { name: string; cost: number; count: number; unit: string }> = {};

  for (const log of wasteLogs) {
    const cost = Math.abs(log.costImpact);
    totalCostLost += cost;

    if (!byItem[log.itemId]) {
      byItem[log.itemId] = {
        name: log.itemName,
        cost: 0,
        count: 0,
        unit: log.unit
      };
    }
    byItem[log.itemId].cost += cost;
    byItem[log.itemId].count += Math.abs(log.quantityDelta);
  }

  return {
    totalWasteIncidents: wasteLogs.length,
    totalCostLost: Number(totalCostLost.toFixed(2)),
    breakdown: Object.values(byItem).sort((a, b) => b.cost - a.cost)
  };
}
