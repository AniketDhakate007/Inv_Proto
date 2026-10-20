export type ItemCategory =
  | 'coffee-beans'
  | 'dairy-milks'
  | 'syrups-flavors'
  | 'bakery-food'
  | 'tea-botanicals'
  | 'packaging-cups'
  | 'barista-supplies';

export interface CategoryMeta {
  id: ItemCategory;
  name: string;
  icon: string;
  description: string;
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'expiring-soon' | 'expired';

export type StorageLocation =
  | 'Bar Station 1'
  | 'Bar Station 2'
  | 'Walk-in Cooler'
  | 'Dry Storage Shelf A'
  | 'Dry Storage Shelf B'
  | 'Pastry Display Case'
  | 'Backroom Shelving';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: ItemCategory;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'units' | 'bottles' | 'boxes' | 'packs';
  currentStock: number;
  minThreshold: number;
  idealStock: number;
  costPerUnit: number;
  supplierId: string;
  supplierName: string;
  location: StorageLocation;
  lastRestocked: string;
  expiryDate?: string; // YYYY-MM-DD
  batchNumber?: string;
  notes?: string;
}

export type MovementType =
  | 'received'
  | 'recipe_deduction'
  | 'spillage'
  | 'expired_waste'
  | 'audit_adjustment'
  | 'manual_adjustment';

export interface StockMovementLog {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  type: MovementType;
  quantityDelta: number;
  unit: string;
  reason: string;
  performedBy: string;
  costImpact: number;
}

export interface RecipeIngredient {
  itemId: string;
  itemName: string;
  amount: number;
  unit: string;
}

export interface CafeRecipe {
  id: string;
  name: string;
  category: 'Espresso & Hot Coffee' | 'Cold Brew & Iced' | 'Tea & Botanicals' | 'Pastries & Food';
  price: number;
  description: string;
  ingredients: RecipeIngredient[];
  preparationTimeMinutes: number;
}

export interface Supplier {
  id: string;
  name: string;
  category: ItemCategory;
  contactPerson: string;
  email: string;
  phone: string;
  leadTimeDays: number;
  minOrderValue: number;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  unit: string;
  currentStock: number;
  targetStock: number;
  orderQuantity: number;
  unitPrice: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'ordered' | 'received';
  createdAt: string;
  receivedAt?: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  notes?: string;
}

export interface AuditEntry {
  itemId: string;
  countedStock: number;
}
