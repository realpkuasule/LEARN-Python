import type { GameState } from "./game-state.ts";

export const INVENTORY_CAPACITY = 20;

export const inventoryQuantity = (state: GameState, itemId: string): number => (
  state.inventory.find((entry) => entry.itemId === itemId)?.quantity ?? 0
);

export const addInventoryItem = (state: GameState, itemId: string, quantity = 1): GameState => {
  if (!Number.isInteger(quantity) || quantity < 1) throw new RangeError("物品数量必须是正整数");
  const existing = state.inventory.find((entry) => entry.itemId === itemId);
  if (!existing && state.inventory.length >= INVENTORY_CAPACITY) throw new Error("背包已满");

  return {
    ...state,
    inventory: existing
      ? state.inventory.map((entry) => entry.itemId === itemId ? { ...entry, quantity: entry.quantity + quantity } : entry)
      : [...state.inventory, { itemId, quantity }],
  };
};

export const removeInventoryItem = (state: GameState, itemId: string): GameState => {
  const existing = state.inventory.find((entry) => entry.itemId === itemId);
  if (!existing) throw new Error("背包中没有这件物品");

  return {
    ...state,
    inventory: existing.quantity === 1
      ? state.inventory.filter((entry) => entry.itemId !== itemId)
      : state.inventory.map((entry) => entry.itemId === itemId ? { ...entry, quantity: entry.quantity - 1 } : entry),
  };
};
