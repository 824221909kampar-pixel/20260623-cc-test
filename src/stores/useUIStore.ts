import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ID } from '../types/common';

interface UIState {
  sidebarCollapsed: boolean;
  activeProjectId: ID | null;
  theme: 'dark';

  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setActiveProject: (id: ID | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeProjectId: null,
      theme: 'dark',

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setActiveProject: (id) => set({ activeProjectId: id }),
    }),
    {
      name: 'doc-pre-prod-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);
