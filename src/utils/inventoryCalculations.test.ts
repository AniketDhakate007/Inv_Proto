import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertRecipeAmountToItemStockUnit,
  calculateStockStatus,
  calculateInventoryValuation,
  deductRecipeStock,
  generateSuggestedOrderItems,
  calculateAuditVariance,
  calculateWasteMetrics
} from './inventoryCalculations.ts';
import type { InventoryItem, CafeRecipe, StockMovementLog } from '../types/inventory.ts';

const mockItemBeans: InventoryItem = {
  id: 'item-beans',
  sku: 'COF-ESP-01',
  name: 'Espresso House Blend',
  category: 'coffee-beans',
  unit: 'kg',
  currentStock: 5.0,
  minThreshold: 2.0,
  idealStock: 10.0,
  costPerUnit: 22.0,
  supplierId: 'sup-roastery',
  supplierName: 'Artisan Coffee Roasters',
  location: 'Bar Station 1',
  lastRestocked: '2026-10-18'
};

const mockItemMilk: InventoryItem = {
  id: 'item-milk',
  sku: 'MLK-OAT-01',
  name: 'Oat Barista Milk',
  category: 'dairy-milks',
  unit: 'L',
  currentStock: 4.0,
  minThreshold: 6.0,
  idealStock: 24.0,
  costPerUnit: 3.2,
  supplierId: 'sup-dairy',
  supplierName: 'Oat Crafters Co',
  location: 'Walk-in Cooler',
  lastRestocked: '2026-10-19',
  expiryDate: '2026-10-22' // Expiring soon relative to 2026-10-20
};

const mockItemCup: InventoryItem = {
  id: 'item-cup12',
  sku: 'PKG-CUP-12',
  name: '12oz Compostable Cup',
  category: 'packaging-cups',
  unit: 'units',
  currentStock: 150,
  minThreshold: 50,
  idealStock: 500,
  costPerUnit: 0.15,
  supplierId: 'sup-pack',
  supplierName: 'EcoPackaging Co',
  location: 'Bar Station 1',
  lastRestocked: '2026-10-15'
};

test('convertRecipeAmountToItemStockUnit converts units accurately', () => {
  // 18g to kg = 0.018 kg
  assert.equal(convertRecipeAmountToItemStockUnit(18, 'g', 'kg'), 0.018);
  // 250ml to L = 0.25 L
  assert.equal(convertRecipeAmountToItemStockUnit(250, 'ml', 'L'), 0.25);
  // Same units pass through
  assert.equal(convertRecipeAmountToItemStockUnit(2, 'units', 'units'), 2);
  // 1 L to ml = 1000 ml
  assert.equal(convertRecipeAmountToItemStockUnit(1.5, 'L', 'ml'), 1500);
});

test('calculateStockStatus correctly identifies in-stock, low-stock, out-of-stock, and expiring states', () => {
  const currentDate = '2026-10-20';

  // Out of stock
  assert.equal(calculateStockStatus(0, 5, '2026-11-01', currentDate), 'out-of-stock');
  assert.equal(calculateStockStatus(-1, 5, '2026-11-01', currentDate), 'out-of-stock');

  // Expired
  assert.equal(calculateStockStatus(10, 2, '2026-10-18', currentDate), 'expired');

  // Expiring soon (within 3 days)
  assert.equal(calculateStockStatus(10, 2, '2026-10-22', currentDate), 'expiring-soon');

  // Low stock (above 0, below or equal threshold)
  assert.equal(calculateStockStatus(3, 5, '2026-11-01', currentDate), 'low-stock');
  assert.equal(calculateStockStatus(5, 5, '2026-11-01', currentDate), 'low-stock');

  // In stock healthy
  assert.equal(calculateStockStatus(12, 5, '2026-11-01', currentDate), 'in-stock');
});

test('calculateInventoryValuation aggregates correct metrics', () => {
  const items = [mockItemBeans, mockItemMilk, mockItemCup];
  const valuation = calculateInventoryValuation(items, '2026-10-20');

  // Expected cost: 5.0 * 22 ($110) + 4.0 * 3.20 ($12.80) + 150 * 0.15 ($22.50) = $145.30
  assert.equal(valuation.totalItems, 3);
  assert.equal(valuation.totalStockCost, 145.30);
  assert.equal(valuation.expiringSoonCount, 1); // mockItemMilk has expiry 2026-10-22
  assert.equal(valuation.outOfStockCount, 0);
  assert.equal(valuation.lowStockCount, 0); // milk was caught as expiring soon first, or low
});

test('deductRecipeStock decreases quantities and logs movements', () => {
  const inventory = [mockItemBeans, mockItemMilk, mockItemCup];

  const latteRecipe: CafeRecipe = {
    id: 'rec-latte',
    name: '12oz Oat Latte',
    category: 'Espresso & Hot Coffee',
    price: 5.50,
    description: 'Double shot with silky oat milk',
    preparationTimeMinutes: 2,
    ingredients: [
      { itemId: 'item-beans', itemName: 'Espresso House Blend', amount: 18, unit: 'g' },
      { itemId: 'item-milk', itemName: 'Oat Barista Milk', amount: 250, unit: 'ml' },
      { itemId: 'item-cup12', itemName: '12oz Compostable Cup', amount: 1, unit: 'units' }
    ]
  };

  // Ring up 2 lattes
  const result = deductRecipeStock(inventory, latteRecipe, 2, 'Barista Maya');

  assert.equal(result.shortages.length, 0);
  assert.equal(result.logs.length, 3);

  // Beans deduction: 2 * 18g = 36g = 0.036kg -> 5.0 - 0.036 = 4.964kg
  const updatedBeans = result.updatedInventory.find(i => i.id === 'item-beans')!;
  assert.equal(updatedBeans.currentStock, 4.964);

  // Milk deduction: 2 * 250ml = 500ml = 0.5L -> 4.0 - 0.5 = 3.5L
  const updatedMilk = result.updatedInventory.find(i => i.id === 'item-milk')!;
  assert.equal(updatedMilk.currentStock, 3.5);

  // Cup deduction: 2 * 1 = 2 -> 150 - 2 = 148
  const updatedCup = result.updatedInventory.find(i => i.id === 'item-cup12')!;
  assert.equal(updatedCup.currentStock, 148);
});

test('generateSuggestedOrderItems calculates replenishment orders up to ideal stock', () => {
  // itemMilk is below threshold (4.0 <= 6.0), ideal is 24.0 -> order 20
  const orders = generateSuggestedOrderItems([mockItemBeans, mockItemMilk], 'sup-dairy');
  assert.equal(orders.length, 1);
  assert.equal(orders[0].itemId, 'item-milk');
  assert.equal(orders[0].orderQuantity, 20);
  assert.equal(orders[0].totalCost, 20 * 3.20);
});

test('calculateAuditVariance detects discrepancy and financial impact', () => {
  const counts = {
    'item-beans': 4.5, // System has 5.0 -> -0.5kg difference
    'item-cup12': 160  // System has 150 -> +10 difference
  };

  const audit = calculateAuditVariance([mockItemBeans, mockItemCup], counts);
  assert.equal(audit.discrepancies.length, 2);

  const beansDisc = audit.discrepancies.find(d => d.item.id === 'item-beans')!;
  assert.equal(beansDisc.difference, -0.5);
  assert.equal(beansDisc.varianceCost, -11.0); // -0.5 * 22

  const cupsDisc = audit.discrepancies.find(d => d.item.id === 'item-cup12')!;
  assert.equal(cupsDisc.difference, 10);
  assert.equal(cupsDisc.varianceCost, 1.50); // 10 * 0.15
});

test('calculateWasteMetrics aggregates spillage and expired waste', () => {
  const logs: StockMovementLog[] = [
    {
      id: 'l1',
      timestamp: '2026-10-19T08:00:00Z',
      itemId: 'item-milk',
      itemName: 'Oat Barista Milk',
      type: 'spillage',
      quantityDelta: -1.0,
      unit: 'L',
      reason: 'Dropped during morning bar setup',
      performedBy: 'Barista Maya',
      costImpact: 3.20
    },
    {
      id: 'l2',
      timestamp: '2026-10-19T14:00:00Z',
      itemId: 'item-milk',
      itemName: 'Oat Barista Milk',
      type: 'recipe_deduction',
      quantityDelta: -0.25,
      unit: 'L',
      reason: 'Order prep',
      performedBy: 'Barista Maya',
      costImpact: 0.80
    }
  ];

  const waste = calculateWasteMetrics(logs);
  assert.equal(waste.totalWasteIncidents, 1);
  assert.equal(waste.totalCostLost, 3.20);
  assert.equal(waste.breakdown.length, 1);
});
