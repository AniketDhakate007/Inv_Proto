import React, { useState } from 'react';
import { Coffee, Plus, Minus, CheckCircle, AlertTriangle, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { InventoryItem, CafeRecipe } from '../types/inventory.ts';
import { CAFE_RECIPES } from '../data/mockCafeData.ts';
import { convertRecipeAmountToItemStockUnit } from '../utils/inventoryCalculations.ts';

interface RecipeSimulatorViewProps {
  inventory: InventoryItem[];
  onDeductRecipe: (recipe: CafeRecipe, quantity: number, baristaName: string) => void;
}

export const RecipeSimulatorView: React.FC<RecipeSimulatorViewProps> = ({
  inventory,
  onDeductRecipe,
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<CafeRecipe>(CAFE_RECIPES[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [baristaName, setBaristaName] = useState<string>('Barista Station 1');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lastDeducted, setLastDeducted] = useState<string | null>(null);

  const categories = ['all', 'Espresso & Hot Coffee', 'Cold Brew & Iced', 'Tea & Botanicals', 'Pastries & Food'];

  const filteredRecipes = CAFE_RECIPES.filter(
    (r) => activeCategory === 'all' || r.category === activeCategory
  );

  // Compute live ingredient feasibility for selected recipe & quantity
  const ingredientChecks = selectedRecipe.ingredients.map((ing) => {
    const invItem = inventory.find((i) => i.id === ing.itemId);
    const needed = ing.amount * quantity;
    const neededInStockUnit = invItem
      ? convertRecipeAmountToItemStockUnit(needed, ing.unit, invItem.unit)
      : needed;

    const available = invItem ? invItem.currentStock : 0;
    const isSufficient = available >= neededInStockUnit;
    const remaining = Math.max(0, available - neededInStockUnit);
    const ingredientCost = invItem ? Number((neededInStockUnit * invItem.costPerUnit).toFixed(2)) : 0;

    return {
      ingredient: ing,
      invItem,
      neededInStockUnit: Number(neededInStockUnit.toFixed(3)),
      available: Number(available.toFixed(3)),
      remaining: Number(remaining.toFixed(3)),
      isSufficient,
      ingredientCost,
      stockUnit: invItem ? invItem.unit : ing.unit
    };
  });

  const allIngredientsAvailable = ingredientChecks.every((c) => c.isSufficient);
  const totalCostOfIngredients = ingredientChecks.reduce((acc, curr) => acc + curr.ingredientCost, 0);
  const totalRevenue = selectedRecipe.price * quantity;
  const grossProfit = totalRevenue - totalCostOfIngredients;
  const marginPercent = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  const handleExecuteDeduction = () => {
    onDeductRecipe(selectedRecipe, quantity, baristaName);
    setLastDeducted(`${quantity}x ${selectedRecipe.name}`);
    setTimeout(() => setLastDeducted(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Menu Recipe &amp; POS Depletion Simulator</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1 font-editorial">
              Barista Order &amp; Ingredient Depletion
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
              Simulate ringing up drink and bakery orders. Crema instantly calculates exact espresso grams,
              milk milliliters, syrups, and packaging disposables, deducting them in real time from cafe stock.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200 self-start md:self-auto">
            <span className="text-xs text-stone-500 font-medium">Logged by:</span>
            <input
              type="text"
              value={baristaName}
              onChange={(e) => setBaristaName(e.target.value)}
              className="text-xs bg-white border border-stone-300 rounded px-2 py-1 text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-6 pt-4 border-t border-stone-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg shrink-0 transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {cat === 'all' ? 'All Menu Items' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Menu Items vs Live Recipe Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Menu Items Selector */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-1">
            Select Cafe Menu Item
          </div>
          <div className="grid grid-cols-1 gap-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredRecipes.map((recipe) => {
              const isSelected = selectedRecipe.id === recipe.id;
              return (
                <div
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400 shadow-xs'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900 leading-tight">
                        {recipe.name}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                        {recipe.description}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-stone-900 shrink-0">
                      ${recipe.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span>{recipe.ingredients.length} ingredients</span>
                    <span className="text-stone-600 font-medium">Prep: ~{recipe.preparationTimeMinutes} min</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Ingredient Depletion & Action Card */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-6">
            {/* Header of selected recipe */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700">
                  {selectedRecipe.category}
                </span>
                <h3 className="text-lg font-bold text-stone-900 font-editorial mt-0.5">
                  {selectedRecipe.name}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Retail Price: ${selectedRecipe.price.toFixed(2)} / serving
                </p>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-xl self-start sm:self-auto">
                <span className="text-xs font-semibold text-stone-600 px-2">Order Quantity:</span>
                <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-stone-200">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Ingredient Stock Requirements Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Ingredient Depletion Breakdown ({quantity}x Drink{quantity > 1 ? 's' : ''})
                </h4>
                {allIngredientsAvailable ? (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Ready to Brew
                  </span>
                ) : (
                  <span className="text-xs text-rose-700 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Stock Shortage Detected
                  </span>
                )}
              </div>

              <div className="border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-100">
                {ingredientChecks.map((check, idx) => (
                  <div
                    key={idx}
                    className={`p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      !check.isSufficient ? 'bg-rose-50/50' : 'bg-stone-50/30'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-stone-900">
                        {check.invItem ? check.invItem.name : check.ingredient.itemName}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Recipe specifies: {check.ingredient.amount * quantity} {check.ingredient.unit}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-stone-500 text-[11px]">Deducts</div>
                        <div className="font-semibold text-stone-800">
                          -{check.neededInStockUnit} {check.stockUnit}
                        </div>
                      </div>

                      <div className="min-w-[90px]">
                        <div className="text-stone-500 text-[11px]">Remaining</div>
                        <div
                          className={`font-bold ${
                            check.isSufficient ? 'text-stone-800' : 'text-rose-600'
                          }`}
                        >
                          {check.isSufficient
                            ? `${check.remaining} ${check.stockUnit}`
                            : `Deficit (${check.available} left)`}
                        </div>
                      </div>

                      <div className="min-w-[60px]">
                        <div className="text-stone-500 text-[11px]">Cost</div>
                        <div className="font-medium text-stone-700">
                          ${check.ingredientCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Margin Card */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-700" />
                  Estimated Order Financials ({quantity} items)
                </span>
                <span className="text-xs font-bold text-amber-800">
                  {marginPercent}% Gross Margin
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="p-2 bg-white rounded-lg border border-amber-200/50">
                  <div className="text-[11px] text-stone-400">Total Revenue</div>
                  <div className="text-sm font-bold text-stone-900">${totalRevenue.toFixed(2)}</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-amber-200/50">
                  <div className="text-[11px] text-stone-400">Cost of Goods (COGS)</div>
                  <div className="text-sm font-bold text-stone-900">${totalCostOfIngredients.toFixed(2)}</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-amber-200/50">
                  <div className="text-[11px] text-stone-400">Gross Profit</div>
                  <div className="text-sm font-bold text-emerald-700">${grossProfit.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Confirmation Banner */}
            {lastDeducted && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Successfully deducted {lastDeducted} from inventory! Stock balances updated and logged.
                </span>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleExecuteDeduction}
              disabled={!allIngredientsAvailable}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                allIngredientsAvailable
                  ? 'bg-stone-900 hover:bg-stone-800 text-white shadow-md hover:shadow-lg'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>
                {allIngredientsAvailable
                  ? `Deduct Ingredients for ${quantity}x ${selectedRecipe.name}`
                  : 'Cannot Deduct: Insufficient Stock Available'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
