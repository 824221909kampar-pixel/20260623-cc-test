import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Library,
  Lightbulb,
  FolderOpen,
  FileText,
  ListChecks,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Zap,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useProjects } from '../../hooks/useProjects';
import { cn } from '../../lib/utils';
import type { ID } from '../../types/common';
import type { Project } from '../../types/project';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘', exact: true },
  { to: '/themes', icon: Library, label: '主题库' },
  { to: '/settings', icon: Settings, label: '设置' },
];

const FEATURE_ITEMS = (projectId: ID | null) => [
  { to: `/brainstorm/${projectId}`, icon: Lightbulb, label: '脑暴构思', disabled: !projectId },
  { to: `/references/${projectId}`, icon: FolderOpen, label: '参考搜集', disabled: !projectId },
  { to: `/script/${projectId}`, icon: FileText, label: '脚本分镜', disabled: !projectId },
  { to: `/shotlist/${projectId}`, icon: ListChecks, label: '拍摄清单', disabled: !projectId },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, activeProjectId, setActiveProject } = useUIStore();
  const { projects, create } = useProjects();

  const handleNewProject = async () => {
    const project = await create({
      title: '未命名项目',
      description: '',
      status: 'planning',
      tags: [],
      targetDuration: 300,
      notes: '',
    });
    setActiveProject(project.id);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      className="h-full bg-bg-secondary border-r border-border-primary flex flex-col overflow-hidden"
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {/* Logo */}
      <div className={cn(
        'h-14 flex items-center border-b border-border-primary px-4 gap-3',
        sidebarCollapsed && 'justify-center px-2'
      )}>
        <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center flex-shrink-0">
          <Zap size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-semibold text-sm whitespace-nowrap overflow-hidden"
            >
              闪电分镜
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
              'hover:bg-bg-hover',
              isActive
                ? 'bg-accent-primary/10 text-accent-primary font-medium'
                : 'text-text-secondary hover:text-text-primary',
              sidebarCollapsed && 'justify-center px-2'
            )}
          >
            <item.icon size={20} />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {/* Divider */}
        <div className="my-3 border-t border-border-primary" />

        {/* Project-dependent features */}
        {FEATURE_ITEMS(activeProjectId).map((item) => (
          <NavLink
            key={item.to}
            to={item.disabled ? '#' : item.to}
            onClick={(e) => item.disabled && e.preventDefault()}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
              item.disabled
                ? 'text-text-disabled cursor-not-allowed opacity-50'
                : 'hover:bg-bg-hover text-text-secondary hover:text-text-primary',
              isActive && !item.disabled && 'bg-accent-primary/10 text-accent-primary font-medium',
              sidebarCollapsed && 'justify-center px-2'
            )}
          >
            <item.icon size={20} />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Project selector */}
      <div className={cn(
        'border-t border-border-primary p-3',
        sidebarCollapsed && 'p-2'
      )}>
        {!sidebarCollapsed && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
              项目
            </span>
            <button
              onClick={handleNewProject}
              className="p-1 rounded hover:bg-bg-hover text-text-tertiary hover:text-text-primary transition-colors"
              title="新建项目"
            >
              <Plus size={14} />
            </button>
          </div>
        )}

        {!sidebarCollapsed && (
          <div className="space-y-0.5 max-h-40 overflow-y-auto">
            {projects.slice(0, 5).map((project: Project) => (
              <button
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                className={cn(
                  'w-full text-left px-2 py-1.5 rounded text-xs transition-colors truncate block',
                  activeProjectId === project.id
                    ? 'bg-accent-primary/20 text-accent-secondary'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                )}
              >
                {project.title}
              </button>
            ))}
          </div>
        )}

        {sidebarCollapsed && activeProjectId && (
          <div className="flex justify-center">
            <div className="w-2 h-2 rounded-full bg-accent-primary" title="有活跃项目" />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="h-10 border-t border-border-primary flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
      >
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </motion.aside>
  );
}
