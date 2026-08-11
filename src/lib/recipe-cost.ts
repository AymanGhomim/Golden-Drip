import { convertInventoryQuantity } from "@/lib/inventory-units";
import { roundMoney } from "@/lib/money";
import type { InventoryItem, Recipe } from "@/types/cafe-operations.types";

export function calculateRecipeCost(recipe: Recipe, inventory: InventoryItem[]) {
  return roundMoney(recipe.ingredients.reduce((total, ingredient) => {
    const item = inventory.find((candidate) => candidate.id === ingredient.inventoryItemId);
    if (!item) return total;
    const quantity = convertInventoryQuantity(ingredient.quantity, ingredient.unit, item.unit);
    return total + quantity * Number(item.averageCost ?? 0);
  }, 0));
}
