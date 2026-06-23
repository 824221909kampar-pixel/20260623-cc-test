import { create } from 'zustand';
import type { ID } from '../types/common';

interface EditorState {
  activeScriptId: ID | null;
  activeSceneId: ID | null;
  activeBoardId: ID | null;

  setActiveScript: (id: ID | null) => void;
  setActiveScene: (id: ID | null) => void;
  setActiveBoard: (id: ID | null) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  activeScriptId: null,
  activeSceneId: null,
  activeBoardId: null,

  setActiveScript: (id) => set({ activeScriptId: id }),
  setActiveScene: (id) => set({ activeSceneId: id }),
  setActiveBoard: (id) => set({ activeBoardId: id }),
}));
