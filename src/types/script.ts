import type { ID, Timestamps } from './common';

export interface CreateScriptInput {
  projectId: ID;
  title: string;
  notes: string;
}

export interface CreateSceneInput {
  scriptId: ID;
  title: string;
  description: string;
  location: string;
  timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night' | 'interior';
  interior: boolean;
  dialogue: string;
  shots: ID[];
  notes: string;
  duration: number;
}

export interface CreateShotInput {
  sceneId: ID;
  shotType: ShotType;
  cameraMovement: CameraMovement;
  cameraAngle: CameraAngle;
  transition: TransitionType;
  duration: number;
  description: string;
  sketch?: string;
  notes: string;
  status: 'pending' | 'ready' | 'done';
}

export interface Script extends Timestamps {
  id: ID;
  projectId: ID;
  title: string;
  scenes: ID[];
  notes: string;
}

export interface Scene extends Timestamps {
  id: ID;
  scriptId: ID;
  order: number;
  title: string;
  location: string;
  timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night' | 'interior';
  interior: boolean;
  description: string;
  dialogue: string;
  shots: ID[];
  notes: string;
  duration: number;
}

export type ShotType =
  | 'extreme-wide'
  | 'wide'
  | 'full'
  | 'medium-wide'
  | 'medium'
  | 'medium-close'
  | 'close'
  | 'extreme-close'
  | 'insert';

export const SHOT_TYPE_LABELS: Record<ShotType, string> = {
  'extreme-wide': '大远景',
  'wide': '远景',
  'full': '全景',
  'medium-wide': '中全景',
  'medium': '中景',
  'medium-close': '近景',
  'close': '特写',
  'extreme-close': '大特写',
  'insert': '插入镜头',
};

export type CameraMovement =
  | 'static'
  | 'push-in'
  | 'pull-out'
  | 'pan-left'
  | 'pan-right'
  | 'tilt-up'
  | 'tilt-down'
  | 'dolly'
  | 'track'
  | 'follow'
  | 'crane-up'
  | 'crane-down'
  | 'handheld'
  | 'aerial';

export const CAMERA_MOVEMENT_LABELS: Record<CameraMovement, string> = {
  'static': '固定',
  'push-in': '推',
  'pull-out': '拉',
  'pan-left': '左摇',
  'pan-right': '右摇',
  'tilt-up': '上摇',
  'tilt-down': '下摇',
  'dolly': '滑动',
  'track': '跟轨',
  'follow': '跟随',
  'crane-up': '升',
  'crane-down': '降',
  'handheld': '手持',
  'aerial': '航拍',
};

export type CameraAngle = 'eye-level' | 'low' | 'high' | 'dutch' | 'overhead' | 'pov';

export const CAMERA_ANGLE_LABELS: Record<CameraAngle, string> = {
  'eye-level': '平视',
  'low': '仰视',
  'high': '俯视',
  'dutch': '斜角',
  'overhead': '俯瞰',
  'pov': '主观视角',
};

export type TransitionType = 'cut' | 'dissolve' | 'fade-in' | 'fade-out' | 'wipe' | 'none';

export const TRANSITION_LABELS: Record<TransitionType, string> = {
  'cut': '硬切',
  'dissolve': '叠化',
  'fade-in': '淡入',
  'fade-out': '淡出',
  'wipe': '划像',
  'none': '无',
};

export interface Shot extends Timestamps {
  id: ID;
  sceneId: ID;
  order: number;
  shotType: ShotType;
  cameraMovement: CameraMovement;
  cameraAngle: CameraAngle;
  transition: TransitionType;
  duration: number;
  description: string;
  sketch?: string;
  notes: string;
  status: 'pending' | 'ready' | 'done';
}
