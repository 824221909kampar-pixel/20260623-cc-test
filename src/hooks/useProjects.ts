import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/project';
import { generateId } from '../lib/utils';

export function useProjects() {
  const projects = useLiveQuery(() =>
    db.projects.orderBy('updatedAt').reverse().toArray()
  ) ?? [];

  const create = async (input: CreateProjectInput): Promise<Project> => {
    const now = Date.now();
    const project: Project = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.projects.add(project);
    return project;
  };

  const update = async (id: string, input: UpdateProjectInput): Promise<void> => {
    await db.projects.update(id, { ...input, updatedAt: Date.now() });
  };

  const remove = async (id: string): Promise<void> => {
    await db.projects.delete(id);
    await db.ideas.where('projectId').equals(id).delete();
    await db.referenceItems.where('projectId').equals(id).delete();
    await db.referenceBoards.where('projectId').equals(id).delete();
    const scripts = await db.scripts.where('projectId').equals(id).toArray();
    for (const script of scripts) {
      const scenes = await db.scenes.where('scriptId').equals(script.id).toArray();
      for (const scene of scenes) {
        await db.shots.where('sceneId').equals(scene.id).delete();
      }
      await db.scenes.where('scriptId').equals(script.id).delete();
    }
    await db.scripts.where('projectId').equals(id).delete();
    await db.shotListItems.where('projectId').equals(id).delete();
  };

  const getById = async (id: string): Promise<Project | undefined> => {
    return db.projects.get(id);
  };

  return { projects, create, update, remove, getById };
}

export function useProject(id: string | undefined) {
  return useLiveQuery(
    () => id ? db.projects.get(id) : undefined,
    [id]
  );
}
