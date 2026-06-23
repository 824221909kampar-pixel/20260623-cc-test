import type { ID, Timestamps } from './common';
import type { ShotType, CameraMovement, CameraAngle } from './script';

export type ShotStatus = 'pending' | 'ready' | 'shot' | 'reshoot';

export const SHOT_STATUS_LABELS: Record<ShotStatus, string> = {
  pending: '待拍',
  ready: '就绪',
  shot: '已拍',
  reshoot: '补拍',
};

export const SHOT_STATUS_COLORS: Record<ShotStatus, string> = {
  pending: '#6b6b80',
  ready: '#f39c12',
  shot: '#00b894',
  reshoot: '#e84393',
};

export interface ShotListItem extends Timestamps {
  id: ID;
  projectId: ID;
  sceneId: ID;
  shotId: ID;
  sceneTitle: string;
  shotOrder: number;
  shotType: ShotType;
  cameraMovement: CameraMovement;
  cameraAngle: CameraAngle;
  duration: number;
  description: string;
  status: ShotStatus;
  notes: string;
  equipment: string[];
  cast: string[];
  location: string;
}
