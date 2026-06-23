import type { ID, Timestamps } from './common';

export type ReferenceType = 'image' | 'video' | 'link' | 'audio' | 'file';

export const REFERENCE_TYPE_LABELS: Record<ReferenceType, string> = {
  image: '图片',
  video: '视频',
  link: '链接',
  audio: '音频',
  file: '文件',
};

export interface ReferenceItem extends Timestamps {
  id: ID;
  projectId: ID;
  boardId?: ID;
  type: ReferenceType;
  title: string;
  description: string;
  url?: string;
  dataUrl?: string;
  thumbnailUrl?: string;
  tags: string[];
  annotations: Annotation[];
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface Annotation {
  id: ID;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
}

export interface ReferenceBoard extends Timestamps {
  id: ID;
  projectId: ID;
  title: string;
  description: string;
  coverImage?: string;
  backgroundColor: string;
  items: ID[];
}
