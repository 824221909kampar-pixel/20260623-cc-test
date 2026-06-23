import type { ID, Timestamps } from './common';

export type IdeaNodeType = 'core' | 'character' | 'scene' | 'conflict' | 'visual' | 'free';

export const IDEA_NODE_LABELS: Record<IdeaNodeType, string> = {
  core: '核心概念',
  character: '人物',
  scene: '场景',
  conflict: '冲突',
  visual: '视觉风格',
  free: '自由',
};

export const IDEA_NODE_COLORS: Record<IdeaNodeType, string> = {
  core: '#6c5ce7',
  character: '#e84393',
  scene: '#00cec9',
  conflict: '#f39c12',
  visual: '#a29bfe',
  free: '#74b9ff',
};

export interface IdeaNode extends Timestamps {
  id: ID;
  projectId: ID;
  type: IdeaNodeType;
  title: string;
  content: string;
  position: { x: number; y: number };
  parentId?: ID;
  color?: string;
  tags: string[];
  expanded: boolean;
}

export interface IdeaEdge {
  id: ID;
  source: ID;
  target: ID;
  label?: string;
}
