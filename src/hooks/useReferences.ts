import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { generateId } from '../lib/utils';
import type { ReferenceItem, ReferenceBoard } from '../types/reference';

// ── Reference Item: Create ───────────────────────────────────────────────────

export async function createReferenceItem(
  input: Omit<ReferenceItem, 'id' | 'createdAt' | 'updatedAt'> & {
    thumbnail?: string;
  }
): Promise<ReferenceItem> {
  const now = Date.now();

  // Generate a thumbnail for image URLs when one isn't provided.
  let thumbnail = input.thumbnail;
  if (!thumbnail && input.url) {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i;
    if (imageExtensions.test(input.url)) {
      thumbnail = input.url;
    }
  }

  const item: ReferenceItem = {
    ...input,
    id: generateId(),
    thumbnailUrl: thumbnail,
    createdAt: now,
    updatedAt: now,
  };
  await db.referenceItems.add(item);
  return item;
}

// ── Reference Item: Update ───────────────────────────────────────────────────

export async function updateReferenceItem(
  id: string,
  input: Partial<Omit<ReferenceItem, 'id' | 'createdAt'>>
): Promise<void> {
  await db.referenceItems.update(id, { ...input, updatedAt: Date.now() });
}

// ── Reference Item: Delete ───────────────────────────────────────────────────

export async function deleteReferenceItem(id: string): Promise<void> {
  // Remove this item from any board's items array.
  const boards = await db.referenceBoards
    .filter((b) => (b.items ?? []).includes(id))
    .toArray();

  for (const board of boards) {
    await db.referenceBoards.update(board.id, {
      items: (board.items ?? []).filter((itemId) => itemId !== id),
      updatedAt: Date.now(),
    });
  }

  await db.referenceItems.delete(id);
}

// ── Reference Board: Create ──────────────────────────────────────────────────

export async function createBoard(
  input: Omit<ReferenceBoard, 'id' | 'createdAt' | 'updatedAt' | 'items'>
): Promise<ReferenceBoard> {
  const now = Date.now();
  const board: ReferenceBoard = {
    ...input,
    id: generateId(),
    items: [],
    createdAt: now,
    updatedAt: now,
  };
  await db.referenceBoards.add(board);
  return board;
}

// ── Reference Board: Update ──────────────────────────────────────────────────

export async function updateBoard(
  id: string,
  input: Partial<Omit<ReferenceBoard, 'id' | 'createdAt'>>
): Promise<void> {
  await db.referenceBoards.update(id, { ...input, updatedAt: Date.now() });
}

// ── Reference Board: Delete ──────────────────────────────────────────────────

export async function deleteBoard(id: string): Promise<void> {
  // Delete the board but do NOT delete its items.
  await db.referenceBoards.delete(id);
}

// ── Board <-> Item helpers ───────────────────────────────────────────────────

export async function addItemToBoard(
  boardId: string,
  itemId: string
): Promise<void> {
  const board = await db.referenceBoards.get(boardId);
  if (!board) throw new Error(`Board ${boardId} not found`);
  const items = board.items ?? [];
  if (items.includes(itemId)) return; // already present
  await db.referenceBoards.update(boardId, {
    items: [...items, itemId],
    updatedAt: Date.now(),
  });
}

export async function removeItemFromBoard(
  boardId: string,
  itemId: string
): Promise<void> {
  const board = await db.referenceBoards.get(boardId);
  if (!board) throw new Error(`Board ${boardId} not found`);
  await db.referenceBoards.update(boardId, {
    items: (board.items ?? []).filter((id) => id !== itemId),
    updatedAt: Date.now(),
  });
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useReferenceItems(
  projectId: string | undefined,
  boardId?: string
): ReferenceItem[] {
  return (
    useLiveQuery(async () => {
      if (!projectId) return [];

      let items = await db.referenceItems
        .where('projectId')
        .equals(projectId)
        .toArray();

      if (boardId) {
        const board = await db.referenceBoards.get(boardId);
        if (board && board.items) {
          items = items.filter((item) => board.items!.includes(item.id));
        } else {
          return [];
        }
      }

      return items;
    }, [projectId, boardId]) ?? []
  );
}

export function useReferenceItem(
  id: string | undefined
): ReferenceItem | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined;
    return db.referenceItems.get(id);
  }, [id]);
}

export function useReferenceBoards(
  projectId: string | undefined
): ReferenceBoard[] {
  return (
    useLiveQuery(async () => {
      if (!projectId) return [];
      return db.referenceBoards
        .where('projectId')
        .equals(projectId)
        .toArray();
    }, [projectId]) ?? []
  );
}

export function useReferenceBoard(
  id: string | undefined
): ReferenceBoard | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined;
    return db.referenceBoards.get(id);
  }, [id]);
}
