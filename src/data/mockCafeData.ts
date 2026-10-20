import { InventoryItem, CategoryMeta, Supplier, CafeRecipe, StockMovementLog, PurchaseOrder } from '../types/inventory.ts';

export const CATEGORIES: CategoryMeta[] = [
  { id: 'coffee-beans', name: 'Coffee Beans', icon: 'Coffee', description: 'Whole bean espresso and filter roasts' },
  { id: 'dairy-milks', name: 'Dairy & Plant Milks', icon: 'Milk', description: 'Fresh organic milk, oat, almond, cream' },
  { id: 'syrups-flavors', name: 'Syrups & Sauces', icon: 'Droplets', description: 'Artisan syrups, honeys, and sauces' },
  { id: 'bakery-food', name: 'Bakery & Fresh Food', icon: 'Croissant', description: 'Daily baked pastries, scones, and loaves' },
  { id: 'tea-botanicals', name: 'Teas & Matcha', icon: 'Leaf', description: 'Ceremonial grade matcha, chai & botanicals' },
  { id: 'packaging-cups', name: 'Cups & Disposables', icon: 'Package', description: 'Compostable cups, lids, sleeves, straws' },
  { id: 'barista-supplies', name: 'Barista Essentials', icon: 'Wrench', description: 'Machine cleaners, towels, filters' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-roastery',
    name: 'Blue Ridge Roastery',
    category: 'coffee-beans',
    contactPerson: 'Marcus Vance',
    email: 'orders@blueridgeroasters.com',
    phone: '(555) 234-8901',
    leadTimeDays: 2,
    minOrderValue: 150
  },
  {
    id: 'sup-dairy',
    name: 'Golden Valley Organic Dairy',
    category: 'dairy-milks',
    contactPerson: 'Sarah Jenkins',
    email: 'delivery@goldenvalleydairy.com',
    phone: '(555) 489-1120',
    leadTimeDays: 1,
    minOrderValue: 80
  },
  {
    id: 'sup-syrups',
    name: 'Botanical Craft Flavorings',
    category: 'syrups-flavors',
    contactPerson: 'Julian Chen',
    email: 'accounts@botanicalcraftsyrups.com',
    phone: '(555) 671-9934',
    leadTimeDays: 3,
    minOrderValue: 100
  },
  {
    id: 'sup-bakery',
    name: 'Hearthstone Bakery Atelier',
    category: 'bakery-food',
    contactPerson: 'Chef Claude Moreau',
    email: 'daily@hearthstonebakery.com',
    phone: '(555) 890-4412',
    leadTimeDays: 1,
    minOrderValue: 60
  },
  {
    id: 'sup-tea',
    name: 'Kyoto Import & Tea Co.',
    category: 'tea-botanicals',
    contactPerson: 'Kenji Sato',
    email: 'orders@kyototeaco.com',
    phone: '(555) 332-9018',
    leadTimeDays: 4,
    minOrderValue: 120
  },
  {
    id: 'sup-packaging',
    name: 'EcoPack Green Foodservice',
    category: 'packaging-cups',
    contactPerson: 'Priya Sharma',
    email: 'sales@ecopackgreen.com',
    phone: '(555) 912-4455',
    leadTimeDays: 2,
    minOrderValue: 100
  },
  {
    id: 'sup-maintenance',
    name: 'Barista Hardware & Chemical',
    category: 'barista-supplies',
    contactPerson: 'Leo Rossi',
    email: 'support@baristahardware.com',
    phone: '(555) 412-7721',
    leadTimeDays: 2,
    minOrderValue: 50
  }
];

export const INITIAL_ITEMS: InventoryItem[] = [
  // Coffee Beans
  {
    id: 'item-coffee-house',
    sku: 'COF-ESP-01',
    name: 'House Espresso Blend (50/50 Ethiopia/Colombia)',
    category: 'coffee-beans',
    unit: 'kg',
    currentStock: 4.8,
    minThreshold: 3.5,
    idealStock: 15.0,
    costPerUnit: 24.50,
    supplierId: 'sup-roastery',
    supplierName: 'Blue Ridge Roastery',
    location: 'Bar Station 1',
    lastRestocked: '2026-10-18',
    batchNumber: 'LOT-2610-09'
  },
  {
    id: 'item-coffee-single-origin',
    sku: 'COF-SGL-02',
    name: 'Single Origin Guatemala Antigua (Washed)',
    category: 'coffee-beans',
    unit: 'kg',
    currentStock: 2.1,
    minThreshold: 2.5, // Low stock!
    idealStock: 8.0,
    costPerUnit: 29.00,
    supplierId: 'sup-roastery',
    supplierName: 'Blue Ridge Roastery',
    location: 'Bar Station 2',
    lastRestocked: '2026-10-14',
    batchNumber: 'LOT-2610-04'
  },
  {
    id: 'item-coffee-decaf',
    sku: 'COF-DEC-03',
    name: 'Swiss Water Decaf Huila',
    category: 'coffee-beans',
    unit: 'kg',
    currentStock: 3.0,
    minThreshold: 1.5,
    idealStock: 5.0,
    costPerUnit: 26.00,
    supplierId: 'sup-roastery',
    supplierName: 'Blue Ridge Roastery',
    location: 'Bar Station 1',
    lastRestocked: '2026-10-16',
    batchNumber: 'LOT-2610-06'
  },

  // Dairy & Plant Milks
  {
    id: 'item-milk-oat',
    sku: 'MLK-OAT-01',
    name: 'Oat Barista Blend (Specialty Steaming)',
    category: 'dairy-milks',
    unit: 'L',
    currentStock: 6.0,
    minThreshold: 8.0, // Low stock!
    idealStock: 32.0,
    costPerUnit: 3.40,
    supplierId: 'sup-dairy',
    supplierName: 'Golden Valley Organic Dairy',
    location: 'Walk-in Cooler',
    lastRestocked: '2026-10-19',
    expiryDate: '2026-10-23' // Expiring in 3 days!
  },
  {
    id: 'item-milk-whole',
    sku: 'MLK-WHL-02',
    name: 'Whole Milk 3.8% Organic Grade A',
    category: 'dairy-milks',
    unit: 'L',
    currentStock: 14.0,
    minThreshold: 10.0,
    idealStock: 40.0,
    costPerUnit: 2.10,
    supplierId: 'sup-dairy',
    supplierName: 'Golden Valley Organic Dairy',
    location: 'Walk-in Cooler',
    lastRestocked: '2026-10-19',
    expiryDate: '2026-10-25'
  },
  {
    id: 'item-milk-almond',
    sku: 'MLK-ALM-03',
    name: 'Almond Barista Unsweetened',
    category: 'dairy-milks',
    unit: 'L',
    currentStock: 5.0,
    minThreshold: 4.0,
    idealStock: 16.0,
    costPerUnit: 3.60,
    supplierId: 'sup-dairy',
    supplierName: 'Golden Valley Organic Dairy',
    location: 'Walk-in Cooler',
    lastRestocked: '2026-10-17',
    expiryDate: '2026-10-27'
  },
  {
    id: 'item-milk-heavy-cream',
    sku: 'MLK-CRM-04',
    name: 'Heavy Whipping Cream 36%',
    category: 'dairy-milks',
    unit: 'L',
    currentStock: 1.0,
    minThreshold: 2.0, // Low stock
    idealStock: 6.0,
    costPerUnit: 4.80,
    supplierId: 'sup-dairy',
    supplierName: 'Golden Valley Organic Dairy',
    location: 'Walk-in Cooler',
    lastRestocked: '2026-10-18',
    expiryDate: '2026-10-22' // Expiring in 2 days!
  },

  // Syrups & Sauces
  {
    id: 'item-syrup-vanilla',
    sku: 'SYR-VAN-01',
    name: 'Madagascar Bourbon Vanilla Bean Syrup',
    category: 'syrups-flavors',
    unit: 'bottles',
    currentStock: 4,
    minThreshold: 2,
    idealStock: 8,
    costPerUnit: 14.50,
    supplierId: 'sup-syrups',
    supplierName: 'Botanical Craft Flavorings',
    location: 'Bar Station 1',
    lastRestocked: '2026-10-12'
  },
  {
    id: 'item-sauce-caramel',
    sku: 'SYR-CAR-02',
    name: 'Sea Salt Caramel Sauce (Artisan Kettle)',
    category: 'syrups-flavors',
    unit: 'bottles',
    currentStock: 1,
    minThreshold: 2, // Low stock
    idealStock: 6,
    costPerUnit: 16.00,
    supplierId: 'sup-syrups',
    supplierName: 'Botanical Craft Flavorings',
    location: 'Bar Station 2',
    lastRestocked: '2026-10-10'
  },
  {
    id: 'item-syrup-lavender',
    sku: 'SYR-LAV-03',
    name: 'French Lavender & Wildflower Honey',
    category: 'syrups-flavors',
    unit: 'bottles',
    currentStock: 3,
    minThreshold: 2,
    idealStock: 6,
    costPerUnit: 15.50,
    supplierId: 'sup-syrups',
    supplierName: 'Botanical Craft Flavorings',
    location: 'Bar Station 1',
    lastRestocked: '2026-10-14'
  },
  {
    id: 'item-sauce-chocolate',
    sku: 'SYR-CHO-04',
    name: 'Dark Mocha Chocolate Ganache 70%',
    category: 'syrups-flavors',
    unit: 'bottles',
    currentStock: 3,
    minThreshold: 2,
    idealStock: 6,
    costPerUnit: 17.00,
    supplierId: 'sup-syrups',
    supplierName: 'Botanical Craft Flavorings',
    location: 'Bar Station 1',
    lastRestocked: '2026-10-15'
  },

  // Bakery & Fresh Food
  {
    id: 'item-pastry-croissant',
    sku: 'BAK-CRS-01',
    name: 'French Butter Croissants (Fresh Daily)',
    category: 'bakery-food',
    unit: 'units',
    currentStock: 8,
    minThreshold: 12, // Low stock
    idealStock: 36,
    costPerUnit: 1.85,
    supplierId: 'sup-bakery',
    supplierName: 'Hearthstone Bakery Atelier',
    location: 'Pastry Display Case',
    lastRestocked: '2026-10-20',
    expiryDate: '2026-10-21' // Expiring tomorrow!
  },
  {
    id: 'item-pastry-choc-croissant',
    sku: 'BAK-PAI-02',
    name: 'Valrhona Pain au Chocolat',
    category: 'bakery-food',
    unit: 'units',
    currentStock: 14,
    minThreshold: 10,
    idealStock: 28,
    costPerUnit: 2.15,
    supplierId: 'sup-bakery',
    supplierName: 'Hearthstone Bakery Atelier',
    location: 'Pastry Display Case',
    lastRestocked: '2026-10-20',
    expiryDate: '2026-10-21'
  },
  {
    id: 'item-pastry-scone',
    sku: 'BAK-SCN-03',
    name: 'Wild Blueberry Lemon Thyme Scones',
    category: 'bakery-food',
    unit: 'units',
    currentStock: 6,
    minThreshold: 8, // Low stock
    idealStock: 20,
    costPerUnit: 1.95,
    supplierId: 'sup-bakery',
    supplierName: 'Hearthstone Bakery Atelier',
    location: 'Pastry Display Case',
    lastRestocked: '2026-10-20',
    expiryDate: '2026-10-21'
  },
  {
    id: 'item-food-sourdough',
    sku: 'BAK-SOU-04',
    name: 'Country Sourdough Loaf (For Toast Prep)',
    category: 'bakery-food',
    unit: 'units',
    currentStock: 4,
    minThreshold: 3,
    idealStock: 10,
    costPerUnit: 4.50,
    supplierId: 'sup-bakery',
    supplierName: 'Hearthstone Bakery Atelier',
    location: 'Dry Storage Shelf A',
    lastRestocked: '2026-10-19',
    expiryDate: '2026-10-22'
  },

  // Teas & Botanicals
  {
    id: 'item-tea-matcha',
    sku: 'TEA-MTC-01',
    name: 'Ceremonial Grade Uji Matcha (First Harvest)',
    category: 'tea-botanicals',
    unit: 'g',
    currentStock: 450,
    minThreshold: 200,
    idealStock: 1000,
    costPerUnit: 0.18, // $180 / kg
    supplierId: 'sup-tea',
    supplierName: 'Kyoto Import & Tea Co.',
    location: 'Bar Station 2',
    lastRestocked: '2026-10-10'
  },
  {
    id: 'item-tea-chai',
    sku: 'TEA-CHI-02',
    name: 'Slow Steeped Spiced Masala Chai Concentrate',
    category: 'tea-botanicals',
    unit: 'L',
    currentStock: 2.0,
    minThreshold: 4.0, // Low stock
    idealStock: 12.0,
    costPerUnit: 6.20,
    supplierId: 'sup-tea',
    supplierName: 'Kyoto Import & Tea Co.',
    location: 'Walk-in Cooler',
    lastRestocked: '2026-10-17',
    expiryDate: '2026-10-26'
  },
  {
    id: 'item-tea-earlgrey',
    sku: 'TEA-EGY-03',
    name: 'Loose Leaf Earl Grey Supreme Bergamot',
    category: 'tea-botanicals',
    unit: 'g',
    currentStock: 800,
    minThreshold: 300,
    idealStock: 1500,
    costPerUnit: 0.05,
    supplierId: 'sup-tea',
    supplierName: 'Kyoto Import & Tea Co.',
    location: 'Dry Storage Shelf A',
    lastRestocked: '2026-10-05'
  },

  // Packaging & Disposables
  {
    id: 'item-pkg-cup-8oz',
    sku: 'PKG-CUP-08',
    name: '8oz Bamboo Compostable Hot Cups',
    category: 'packaging-cups',
    unit: 'units',
    currentStock: 280,
    minThreshold: 150,
    idealStock: 1000,
    costPerUnit: 0.12,
    supplierId: 'sup-packaging',
    supplierName: 'EcoPack Green Foodservice',
    location: 'Backroom Shelving',
    lastRestocked: '2026-10-15'
  },
  {
    id: 'item-pkg-cup-12oz',
    sku: 'PKG-CUP-12',
    name: '12oz Bamboo Compostable Hot Cups',
    category: 'packaging-cups',
    unit: 'units',
    currentStock: 95,
    minThreshold: 150, // Low stock
    idealStock: 1500,
    costPerUnit: 0.14,
    supplierId: 'sup-packaging',
    supplierName: 'EcoPack Green Foodservice',
    location: 'Bar Station 1',
    lastRestocked: '2026-10-12'
  },
  {
    id: 'item-pkg-cup-16oz-cold',
    sku: 'PKG-CUP-16C',
    name: '16oz PLA Plant-Based Cold Cups',
    category: 'packaging-cups',
    unit: 'units',
    currentStock: 320,
    minThreshold: 200,
    idealStock: 1200,
    costPerUnit: 0.16,
    supplierId: 'sup-packaging',
    supplierName: 'EcoPack Green Foodservice',
    location: 'Backroom Shelving',
    lastRestocked: '2026-10-16'
  },
  {
    id: 'item-pkg-lids-hot',
    sku: 'PKG-LID-HOT',
    name: 'Universal Hot Sip Lids (Fits 8/12oz)',
    category: 'packaging-cups',
    unit: 'units',
    currentStock: 450,
    minThreshold: 300,
    idealStock: 2000,
    costPerUnit: 0.06,
    supplierId: 'sup-packaging',
    supplierName: 'EcoPack Green Foodservice',
    location: 'Bar Station 1',
    lastRestocked: '2026-10-15'
  },
  {
    id: 'item-pkg-sleeves',
    sku: 'PKG-SLV-01',
    name: 'Embossed Kraft Cup Sleeves',
    category: 'packaging-cups',
    unit: 'units',
    currentStock: 520,
    minThreshold: 250,
    idealStock: 1500,
    costPerUnit: 0.04,
    supplierId: 'sup-packaging',
    supplierName: 'EcoPack Green Foodservice',
    location: 'Bar Station 1',
    lastRestocked: '2026-10-15'
  },

  // Barista Supplies & Chemicals
  {
    id: 'item-chem-cafiza',
    sku: 'CHM-CAF-01',
    name: 'Cafiza Espresso Machine Cleaning Powder (900g)',
    category: 'barista-supplies',
    unit: 'bottles',
    currentStock: 1,
    minThreshold: 2, // Low stock
    idealStock: 4,
    costPerUnit: 18.00,
    supplierId: 'sup-maintenance',
    supplierName: 'Barista Hardware & Chemical',
    location: 'Dry Storage Shelf B',
    lastRestocked: '2026-09-28'
  },
  {
    id: 'item-sup-towels',
    sku: 'SUP-TWL-01',
    name: 'Microfiber Steam Wand Barista Towels (Pack of 10)',
    category: 'barista-supplies',
    unit: 'packs',
    currentStock: 3,
    minThreshold: 2,
    idealStock: 6,
    costPerUnit: 12.50,
    supplierId: 'sup-maintenance',
    supplierName: 'Barista Hardware & Chemical',
    location: 'Dry Storage Shelf B',
    lastRestocked: '2026-10-02'
  }
];

export const CAFE_RECIPES: CafeRecipe[] = [
  {
    id: 'rec-signature-latte',
    name: 'Signature Oat Latte (12oz)',
    category: 'Espresso & Hot Coffee',
    price: 5.75,
    description: 'Double shot of house espresso with velvety microfoamed oat milk',
    preparationTimeMinutes: 2,
    ingredients: [
      { itemId: 'item-coffee-house', itemName: 'House Espresso Blend', amount: 18, unit: 'g' },
      { itemId: 'item-milk-oat', itemName: 'Oat Barista Blend', amount: 250, unit: 'ml' },
      { itemId: 'item-pkg-cup-12oz', itemName: '12oz Hot Cup', amount: 1, unit: 'units' },
      { itemId: 'item-pkg-lids-hot', itemName: 'Universal Hot Sip Lid', amount: 1, unit: 'units' },
      { itemId: 'item-pkg-sleeves', itemName: 'Kraft Cup Sleeve', amount: 1, unit: 'units' }
    ]
  },
  {
    id: 'rec-vanilla-latte',
    name: 'Madagascar Vanilla Latte (12oz)',
    category: 'Espresso & Hot Coffee',
    price: 6.25,
    description: 'House espresso, organic whole milk, and real vanilla bean syrup',
    preparationTimeMinutes: 2,
    ingredients: [
      { itemId: 'item-coffee-house', itemName: 'House Espresso Blend', amount: 18, unit: 'g' },
      { itemId: 'item-milk-whole', itemName: 'Whole Milk Organic', amount: 240, unit: 'ml' },
      { itemId: 'item-syrup-vanilla', itemName: 'Vanilla Bean Syrup', amount: 0.03, unit: 'bottles' }, // ~25ml pump
      { itemId: 'item-pkg-cup-12oz', itemName: '12oz Hot Cup', amount: 1, unit: 'units' },
      { itemId: 'item-pkg-lids-hot', itemName: 'Universal Hot Sip Lid', amount: 1, unit: 'units' }
    ]
  },
  {
    id: 'rec-iced-caramel',
    name: 'Iced Sea Salt Caramel Latte (16oz)',
    category: 'Cold Brew & Iced',
    price: 6.50,
    description: 'Over ice with artisan kettle caramel and creamy whole milk',
    preparationTimeMinutes: 3,
    ingredients: [
      { itemId: 'item-coffee-house', itemName: 'House Espresso Blend', amount: 20, unit: 'g' },
      { itemId: 'item-milk-whole', itemName: 'Whole Milk Organic', amount: 220, unit: 'ml' },
      { itemId: 'item-sauce-caramel', itemName: 'Sea Salt Caramel Sauce', amount: 0.04, unit: 'bottles' },
      { itemId: 'item-pkg-cup-16oz-cold', itemName: '16oz Cold Cup', amount: 1, unit: 'units' }
    ]
  },
  {
    id: 'rec-espresso-double',
    name: 'Guatemala Pour-Over / Double Espresso',
    category: 'Espresso & Hot Coffee',
    price: 4.25,
    description: 'Single origin washed coffee with notes of cocoa and clementine',
    preparationTimeMinutes: 3,
    ingredients: [
      { itemId: 'item-coffee-single-origin', itemName: 'Guatemala Antigua', amount: 22, unit: 'g' },
      { itemId: 'item-pkg-cup-8oz', itemName: '8oz Hot Cup', amount: 1, unit: 'units' }
    ]
  },
  {
    id: 'rec-matcha-latte',
    name: 'Ceremonial Uji Matcha Latte (12oz)',
    category: 'Tea & Botanicals',
    price: 6.25,
    description: 'Whisked first harvest Kyoto matcha with steamed oat milk',
    preparationTimeMinutes: 3,
    ingredients: [
      { itemId: 'item-tea-matcha', itemName: 'Ceremonial Matcha', amount: 4, unit: 'g' },
      { itemId: 'item-milk-oat', itemName: 'Oat Barista Blend', amount: 240, unit: 'ml' },
      { itemId: 'item-pkg-cup-12oz', itemName: '12oz Hot Cup', amount: 1, unit: 'units' },
      { itemId: 'item-pkg-lids-hot', itemName: 'Universal Hot Sip Lid', amount: 1, unit: 'units' }
    ]
  },
  {
    id: 'rec-spiced-chai',
    name: 'Slow Steeped Spiced Chai Latte (12oz)',
    category: 'Tea & Botanicals',
    price: 5.50,
    description: 'Fresh brewed black tea, cinnamon, cardamom, ginger and whole milk',
    preparationTimeMinutes: 2,
    ingredients: [
      { itemId: 'item-tea-chai', itemName: 'Spiced Chai Concentrate', amount: 0.12, unit: 'L' },
      { itemId: 'item-milk-whole', itemName: 'Whole Milk Organic', amount: 140, unit: 'ml' },
      { itemId: 'item-pkg-cup-12oz', itemName: '12oz Hot Cup', amount: 1, unit: 'units' },
      { itemId: 'item-pkg-lids-hot', itemName: 'Universal Hot Sip Lid', amount: 1, unit: 'units' }
    ]
  },
  {
    id: 'rec-croissant-butter',
    name: 'Toasted French Butter Croissant',
    category: 'Pastries & Food',
    price: 4.50,
    description: 'Flaky 100% butter morning pastry lightly warmed to order',
    preparationTimeMinutes: 1,
    ingredients: [
      { itemId: 'item-pastry-croissant', itemName: 'French Butter Croissant', amount: 1, unit: 'units' }
    ]
  },
  {
    id: 'rec-croissant-choc',
    name: 'Valrhona Pain au Chocolat',
    category: 'Pastries & Food',
    price: 4.95,
    description: 'Classic Parisian chocolate croissant with dual dark chocolate batons',
    preparationTimeMinutes: 1,
    ingredients: [
      { itemId: 'item-pastry-choc-croissant', itemName: 'Valrhona Pain au Chocolat', amount: 1, unit: 'units' }
    ]
  }
];

export const INITIAL_MOVEMENT_LOGS: StockMovementLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-10-20T07:15:00Z',
    itemId: 'item-pastry-croissant',
    itemName: 'French Butter Croissants',
    type: 'received',
    quantityDelta: 24,
    unit: 'units',
    reason: 'Morning delivery from Hearthstone Bakery',
    performedBy: 'Head Barista Maya',
    costImpact: 44.40
  },
  {
    id: 'log-002',
    timestamp: '2026-10-20T08:30:00Z',
    itemId: 'item-milk-oat',
    itemName: 'Oat Barista Blend',
    type: 'spillage',
    quantityDelta: -1.0,
    unit: 'L',
    reason: 'Pitcher dropped during rush hour bar slip',
    performedBy: 'Barista Liam',
    costImpact: 3.40
  },
  {
    id: 'log-003',
    timestamp: '2026-10-19T17:45:00Z',
    itemId: 'item-pastry-croissant',
    itemName: 'French Butter Croissants',
    type: 'expired_waste',
    quantityDelta: -4,
    unit: 'units',
    reason: 'End-of-day unsold pastries composted',
    performedBy: 'Shift Lead Sam',
    costImpact: 7.40
  },
  {
    id: 'log-004',
    timestamp: '2026-10-18T11:00:00Z',
    itemId: 'item-coffee-house',
    itemName: 'House Espresso Blend',
    type: 'received',
    quantityDelta: 10.0,
    unit: 'kg',
    reason: 'Weekly roast delivery PO-9821',
    performedBy: 'Owner Elena',
    costImpact: 245.00
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1021',
    poNumber: 'PO-2026-1021',
    supplierId: 'sup-dairy',
    supplierName: 'Golden Valley Organic Dairy',
    status: 'draft',
    createdAt: '2026-10-20T09:00:00Z',
    items: [
      {
        itemId: 'item-milk-oat',
        itemName: 'Oat Barista Blend',
        unit: 'L',
        currentStock: 6.0,
        targetStock: 32.0,
        orderQuantity: 26,
        unitPrice: 3.40,
        totalCost: 88.40
      },
      {
        itemId: 'item-milk-heavy-cream',
        itemName: 'Heavy Whipping Cream 36%',
        unit: 'L',
        currentStock: 1.0,
        targetStock: 6.0,
        orderQuantity: 5,
        unitPrice: 4.80,
        totalCost: 24.00
      }
    ],
    totalAmount: 112.40,
    notes: 'Please deliver to back alley loading dock before 7:00 AM'
  },
  {
    id: 'po-1019',
    poNumber: 'PO-2026-1019',
    supplierId: 'sup-roastery',
    supplierName: 'Blue Ridge Roastery',
    status: 'received',
    createdAt: '2026-10-16T14:30:00Z',
    receivedAt: '2026-10-18T10:15:00Z',
    items: [
      {
        itemId: 'item-coffee-house',
        itemName: 'House Espresso Blend',
        unit: 'kg',
        currentStock: 15.0,
        targetStock: 15.0,
        orderQuantity: 10,
        unitPrice: 24.50,
        totalCost: 245.00
      }
    ],
    totalAmount: 245.00,
    notes: 'Received and verified in full'
  }
];
