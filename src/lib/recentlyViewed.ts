const STORAGE_KEY = "rizo-docs-recent-products";
const MAX_ITEMS = 8;

export function readRecentlyViewed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function pushRecentlyViewed(productId: string): string[] {
  const prev = readRecentlyViewed().filter((id) => id !== productId);
  const next = [productId, ...prev].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}
