export type ID = string;

export type Timestamps = {
  createdAt: number;
  updatedAt: number;
};

export type ProjectStatus = 'planning' | 'scripting' | 'storyboarding' | 'shooting' | 'editing' | 'completed' | 'archived';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: '策划中',
  scripting: '撰写脚本',
  storyboarding: '分镜设计中',
  shooting: '拍摄中',
  editing: '后期中',
  completed: '已完成',
  archived: '已归档',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: '#6c5ce7',
  scripting: '#a29bfe',
  storyboarding: '#00cec9',
  shooting: '#f39c12',
  editing: '#e84393',
  completed: '#00b894',
  archived: '#6b6b80',
};

export type ThemeDifficulty = 'beginner' | 'intermediate' | 'advanced';

export const DIFFICULTY_LABELS: Record<ThemeDifficulty, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高阶',
};

export type ThemeCategory =
  | 'humanity'
  | 'nature'
  | 'society'
  | 'technology'
  | 'food'
  | 'travel'
  | 'culture'
  | 'sports';

export const CATEGORY_LABELS: Record<ThemeCategory, string> = {
  humanity: '人文',
  nature: '自然',
  society: '社会',
  technology: '科技',
  food: '美食',
  travel: '旅行',
  culture: '文化',
  sports: '运动',
};
