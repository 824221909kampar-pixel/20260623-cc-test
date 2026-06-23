import type { ID, Timestamps, ThemeCategory, ThemeDifficulty } from './common';

export interface Theme extends Timestamps {
  id: ID;
  title: string;
  description: string;
  category: ThemeCategory;
  difficulty: ThemeDifficulty;
  tags: string[];
  coverImage: string;
  shootingTips: string;
  suggestedDuration: string;
  relatedThemes: ID[];
  isBuiltIn: boolean;
}

export interface ThemeFilter {
  category?: ThemeCategory;
  difficulty?: ThemeDifficulty;
  search?: string;
}
