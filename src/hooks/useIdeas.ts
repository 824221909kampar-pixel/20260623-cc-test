import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { generateId } from '../lib/utils';
import type { IdeaNode } from '../types/idea';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function collectDescendantIds(parentId: string): Promise<string[]> {
  const ids: string[] = [];
  const children = await db.ideas.where('parentId').equals(parentId).toArray();
  for (const child of children) {
    ids.push(child.id);
    ids.push(...(await collectDescendantIds(child.id)));
  }
  return ids;
}

async function cascadeDeleteChildren(parentId: string): Promise<void> {
  const allIds = await collectDescendantIds(parentId);
  if (allIds.length > 0) {
    await db.ideas.bulkDelete(allIds);
  }
}

// ── Create ───────────────────────────────────────────────────────────────────

export async function createIdea(
  input: Omit<IdeaNode, 'id' | 'createdAt' | 'updatedAt'> &
    Partial<Pick<IdeaNode, 'position'>>
): Promise<IdeaNode> {
  const now = Date.now();
  const idea: IdeaNode = {
    ...input,
    id: generateId(),
    position: input.position ?? { x: 0, y: 0 },
    createdAt: now,
    updatedAt: now,
  };
  await db.ideas.add(idea);
  return idea;
}

// ── Update ───────────────────────────────────────────────────────────────────

export async function updateIdea(
  id: string,
  input: Partial<Omit<IdeaNode, 'id' | 'createdAt'>>
): Promise<void> {
  await db.ideas.update(id, { ...input, updatedAt: Date.now() });
}

// ── Delete ───────────────────────────────────────────────────────────────────

export async function deleteIdea(id: string): Promise<void> {
  await cascadeDeleteChildren(id);
  await db.ideas.delete(id);
}

// ── Tree ─────────────────────────────────────────────────────────────────────

export async function getIdeaTree(projectId: string): Promise<IdeaNode[]> {
  const all = await db.ideas
    .where('projectId')
    .equals(projectId)
    .sortBy('createdAt');

  const map = new Map<string, IdeaNode & { children?: IdeaNode[] }>();
  const roots: (IdeaNode & { children?: IdeaNode[] })[] = [];

  for (const node of all) {
    map.set(node.id, { ...node, children: [] });
  }

  for (const node of map.values()) {
    const parent = node.parentId ? map.get(node.parentId) : undefined;
    if (parent) {
      parent.children = parent.children ?? [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useIdeas(projectId: string | undefined): IdeaNode[] {
  return (
    useLiveQuery(async () => {
      if (!projectId) return [];
      return db.ideas
        .where('projectId')
        .equals(projectId)
        .sortBy('createdAt');
    }, [projectId]) ?? []
  );
}

export function useIdea(id: string | undefined): IdeaNode | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined;
    return db.ideas.get(id);
  }, [id]);
}
