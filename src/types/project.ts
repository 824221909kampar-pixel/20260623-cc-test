import type { ID, Timestamps, ProjectStatus } from './common';

export interface Project extends Timestamps {
  id: ID;
  title: string;
  description: string;
  coverImage?: string;
  status: ProjectStatus;
  themeId?: ID;
  tags: string[];
  targetDuration: number;
  team?: string[];
  notes: string;
}

export type CreateProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProjectInput = Partial<CreateProjectInput>;
