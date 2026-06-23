import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { generateId } from '../lib/utils';
import type { ShotListItem } from '../types/shotlist';

// ── Create ───────────────────────────────────────────────────────────────────

export async function createShotListItem(
  input: Omit<ShotListItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ShotListItem> {
  const now = Date.now();
  const item: ShotListItem = {
    ...input,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  await db.shotListItems.add(item);
  return item;
}

// ── Update ───────────────────────────────────────────────────────────────────

export async function updateShotListItem(
  id: string,
  input: Partial<Omit<ShotListItem, 'id' | 'createdAt'>>
): Promise<void> {
  await db.shotListItems.update(id, { ...input, updatedAt: Date.now() });
}

// ── Delete ───────────────────────────────────────────────────────────────────

export async function deleteShotListItem(id: string): Promise<void> {
  await db.shotListItems.delete(id);
}

// ── Generate ─────────────────────────────────────────────────────────────────

export async function generateShotList(projectId: string): Promise<void> {
  // Fetch the project's script.
  const script = await db.scripts
    .where('projectId')
    .equals(projectId)
    .first();

  if (!script) return;

  // Load all scenes (ordered).
  const scenes = await db.scenes
    .where('scriptId')
    .equals(script.id)
    .sortBy('order');

  // Delete existing shot-list items for this project — bulk operation.
  await db.shotListItems.where('projectId').equals(projectId).delete();

  // Load all shots for all scenes in a single query.
  const sceneIds = scenes.map((s) => s.id);
  const allShots = sceneIds.length > 0
    ? await db.shots.where('sceneId').anyOf(sceneIds).sortBy('order')
    : [];

  // Group shots by scene.
  const shotsByScene = new Map<string, typeof allShots>();
  for (const shot of allShots) {
    const list = shotsByScene.get(shot.sceneId) ?? [];
    list.push(shot);
    shotsByScene.set(shot.sceneId, list);
  }

  const now = Date.now();
  const newItems: ShotListItem[] = [];

  for (const scene of scenes) {
    const shots = shotsByScene.get(scene.id) ?? [];

    for (const shot of shots) {
      newItems.push({
        id: generateId(),
        projectId,
        sceneTitle: scene.title,
        sceneId: scene.id,
        shotId: shot.id,
        shotOrder: shot.order,
        shotType: shot.shotType,
        cameraMovement: shot.cameraMovement,
        cameraAngle: shot.cameraAngle,
        description: shot.description,
        duration: shot.duration,
        status: 'pending',
        notes: shot.notes,
        equipment: [],
        cast: [],
        location: scene.location,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  await db.shotListItems.bulkAdd(newItems);
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useShotListItems(
  projectId: string | undefined
): ShotListItem[] {
  return (
    useLiveQuery(async () => {
      if (!projectId) return [];
      return db.shotListItems
        .where('projectId')
        .equals(projectId)
        .toArray();
    }, [projectId]) ?? []
  );
}

export function useShotListItem(
  id: string | undefined
): ShotListItem | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined;
    return db.shotListItems.get(id);
  }, [id]);
}
