import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { generateId } from '../lib/utils';
import type {
  Script,
  Scene,
  Shot,
  CreateScriptInput,
  CreateSceneInput,
  CreateShotInput,
} from '../types/script';

// ═══════════════════════════════════════════════════════════════════════════════
// Script
// ═══════════════════════════════════════════════════════════════════════════════

export async function createScript(
  input: CreateScriptInput
): Promise<Script> {
  const now = Date.now();
  const script: Script = {
    ...input,
    id: generateId(),
    scenes: [],
    createdAt: now,
    updatedAt: now,
  };
  await db.scripts.add(script);
  return script;
}

export async function updateScript(
  id: string,
  input: Partial<Omit<Script, 'id' | 'createdAt'>>
): Promise<void> {
  await db.scripts.update(id, { ...input, updatedAt: Date.now() });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Scenes
// ═══════════════════════════════════════════════════════════════════════════════

export async function createScene(input: CreateSceneInput): Promise<Scene> {
  const now = Date.now();

  // Auto-assign next order number.
  const existing = await db.scenes
    .where('scriptId')
    .equals(input.scriptId)
    .toArray();
  const nextOrder =
    existing.length === 0
      ? 0
      : Math.max(...existing.map((s) => s.order ?? 0)) + 1;

  const scene: Scene = {
    ...input,
    id: generateId(),
    order: input.order ?? nextOrder,
    shots: [],
    createdAt: now,
    updatedAt: now,
  };
  await db.scenes.add(scene);

  // Append scene id to the parent script.
  const script = await db.scripts.get(input.scriptId);
  if (script) {
    await db.scripts.update(input.scriptId, {
      scenes: [...(script.scenes ?? []), scene.id],
      updatedAt: Date.now(),
    });
  }

  return scene;
}

export async function updateScene(
  id: string,
  input: Partial<Omit<Scene, 'id' | 'createdAt'>>
): Promise<void> {
  await db.scenes.update(id, { ...input, updatedAt: Date.now() });
}

export async function deleteScene(id: string): Promise<void> {
  const scene = await db.scenes.get(id);
  if (!scene) return;

  // Cascade-delete shots belonging to this scene — bulk operation
  await db.shots.where('sceneId').equals(id).delete();

  // Remove scene from its parent script's scenes array.
  const script = await db.scripts.get(scene.scriptId);
  if (script) {
    await db.scripts.update(scene.scriptId, {
      scenes: (script.scenes ?? []).filter((s) => s !== id),
      updatedAt: Date.now(),
    });
  }

  await db.scenes.delete(id);
}

export async function reorderScenes(
  scriptId: string,
  sceneIds: string[]
): Promise<void> {
  for (let i = 0; i < sceneIds.length; i++) {
    await db.scenes.update(sceneIds[i], {
      order: i,
      updatedAt: Date.now(),
    });
  }
  // Touch the parent script so live queries re-fire.
  await db.scripts.update(scriptId, { updatedAt: Date.now() });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Shots
// ═══════════════════════════════════════════════════════════════════════════════

export async function createShot(input: CreateShotInput): Promise<Shot> {
  const now = Date.now();

  // Auto-assign next order number within the scene.
  const existing = await db.shots
    .where('sceneId')
    .equals(input.sceneId)
    .toArray();
  const nextOrder =
    existing.length === 0
      ? 0
      : Math.max(...existing.map((s) => s.order ?? 0)) + 1;

  const shot: Shot = {
    ...input,
    id: generateId(),
    order: input.order ?? nextOrder,
    createdAt: now,
    updatedAt: now,
  };
  await db.shots.add(shot);

  // Append shot id to the parent scene.
  const scene = await db.scenes.get(input.sceneId);
  if (scene) {
    await db.scenes.update(input.sceneId, {
      shots: [...(scene.shots ?? []), shot.id],
      updatedAt: Date.now(),
    });
  }

  return shot;
}

export async function updateShot(
  id: string,
  input: Partial<Omit<Shot, 'id' | 'createdAt'>>
): Promise<void> {
  await db.shots.update(id, { ...input, updatedAt: Date.now() });
}

export async function deleteShot(id: string): Promise<void> {
  const shot = await db.shots.get(id);
  if (!shot) return;

  // Remove shot from its parent scene's shots array.
  const scene = await db.scenes.get(shot.sceneId);
  if (scene) {
    await db.scenes.update(shot.sceneId, {
      shots: (scene.shots ?? []).filter((s) => s !== id),
      updatedAt: Date.now(),
    });
  }

  await db.shots.delete(id);
}

export async function reorderShots(
  sceneId: string,
  shotIds: string[]
): Promise<void> {
  for (let i = 0; i < shotIds.length; i++) {
    await db.shots.update(shotIds[i], {
      order: i,
      updatedAt: Date.now(),
    });
  }
  // Touch the parent scene so live queries re-fire.
  await db.scenes.update(sceneId, { updatedAt: Date.now() });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Hooks
// ═══════════════════════════════════════════════════════════════════════════════

export function useScript(projectId: string | undefined): Script | undefined {
  return useLiveQuery(() => {
    if (!projectId) return undefined;
    return db.scripts.where('projectId').equals(projectId).first();
  }, [projectId]);
}

export function useScriptById(id: string | undefined): Script | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined;
    return db.scripts.get(id);
  }, [id]);
}

export function useScenes(scriptId: string | undefined): Scene[] {
  return (
    useLiveQuery(async () => {
      if (!scriptId) return [];
      return db.scenes
        .where('scriptId')
        .equals(scriptId)
        .sortBy('order');
    }, [scriptId]) ?? []
  );
}

export function useScene(id: string | undefined): Scene | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined;
    return db.scenes.get(id);
  }, [id]);
}

export function useShots(sceneId: string | undefined): Shot[] {
  return (
    useLiveQuery(async () => {
      if (!sceneId) return [];
      return db.shots
        .where('sceneId')
        .equals(sceneId)
        .sortBy('order');
    }, [sceneId]) ?? []
  );
}

export function useShot(id: string | undefined): Shot | undefined {
  return useLiveQuery(() => {
    if (!id) return undefined;
    return db.shots.get(id);
  }, [id]);
}
