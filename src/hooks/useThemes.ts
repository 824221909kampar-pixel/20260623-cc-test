import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { generateId } from '../lib/utils';
import type { Theme, ThemeFilter } from '../types/theme';

// ── Create ───────────────────────────────────────────────────────────────────

export async function createTheme(
  input: Omit<Theme, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltIn'>
): Promise<Theme> {
  const now = Date.now();
  const theme: Theme = {
    ...input,
    id: generateId(),
    isBuiltIn: false,
    createdAt: now,
    updatedAt: now,
  };
  await db.themes.add(theme);
  return theme;
}

// ── Update ───────────────────────────────────────────────────────────────────

export async function updateTheme(
  id: string,
  input: Partial<Omit<Theme, 'id' | 'createdAt' | 'isBuiltIn'>>
): Promise<void> {
  await db.themes.update(id, { ...input, updatedAt: Date.now() });
}

// ── Delete ───────────────────────────────────────────────────────────────────

export async function deleteTheme(id: string): Promise<void> {
  await db.themes.delete(id);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<
  { category: string; count: number }[]
> {
  const all = await db.themes.toArray();
  const map = new Map<string, number>();
  for (const t of all) {
    const cat = t.category ?? 'Uncategorized';
    map.set(cat, (map.get(cat) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([category, count]) => ({
    category,
    count,
  }));
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useThemes(filter?: ThemeFilter): Theme[] {
  return (
    useLiveQuery(async () => {
      let collection = db.themes.toCollection();

      if (filter?.category) {
        collection = collection.filter((t) => t.category === filter.category);
      }
      if (filter?.difficulty) {
        collection = collection.filter(
          (t) => t.difficulty === filter.difficulty
        );
      }

      const results = await collection.toArray();

      if (filter?.search) {
        const lower = filter.search.toLowerCase();
        return results.filter(
          (t) =>
            t.title.toLowerCase().includes(lower) ||
            (t.description ?? '').toLowerCase().includes(lower)
        );
      }

      return results;
    }, [filter?.category, filter?.difficulty, filter?.search]) ?? []
  );
}

export function useTheme(id: string | undefined): Theme | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined;
    return db.themes.get(id);
  }, [id]);
}
