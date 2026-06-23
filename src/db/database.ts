import Dexie, { type Table } from 'dexie';
import type { Project } from '../types/project';
import type { Theme } from '../types/theme';
import type { IdeaNode } from '../types/idea';
import type { ReferenceItem, ReferenceBoard } from '../types/reference';
import type { Script, Scene, Shot } from '../types/script';
import type { ShotListItem } from '../types/shotlist';

export class DocPreProdDB extends Dexie {
  projects!: Table<Project, string>;
  themes!: Table<Theme, string>;
  ideas!: Table<IdeaNode, string>;
  referenceItems!: Table<ReferenceItem, string>;
  referenceBoards!: Table<ReferenceBoard, string>;
  scripts!: Table<Script, string>;
  scenes!: Table<Scene, string>;
  shots!: Table<Shot, string>;
  shotListItems!: Table<ShotListItem, string>;

  constructor() {
    super('DocPreProd');

    this.version(1).stores({
      projects: 'id, createdAt, updatedAt, status',
      themes: 'id, category, difficulty, createdAt',
      ideas: 'id, projectId, type, parentId, createdAt',
      referenceItems: 'id, projectId, boardId, type, *tags, createdAt',
      referenceBoards: 'id, projectId, createdAt',
      scripts: 'id, projectId, updatedAt',
      scenes: 'id, scriptId, order',
      shots: 'id, sceneId, order',
      shotListItems: 'id, projectId, sceneId, shotId, status',
    });
  }
}

export const db = new DocPreProdDB();
