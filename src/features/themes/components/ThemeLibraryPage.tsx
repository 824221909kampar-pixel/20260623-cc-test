import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';

import { useThemes } from '../../../hooks/useThemes';
import { useProjects } from '../../../hooks/useProjects';
import { useUIStore } from '../../../stores/useUIStore';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { Tag } from '../../../components/ui/tag';
import { SearchInput } from '../../../components/common/SearchInput';
import { cn } from '../../../lib/utils';
import type { Theme } from '../../../types/theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_FILTERS: Array<{ key: string; label: string }> = [
  { key: '全部', label: '全部' },
  { key: '人文', label: '人文' },
  { key: '自然', label: '自然' },
  { key: '社会', label: '社会' },
  { key: '科技', label: '科技' },
  { key: '美食', label: '美食' },
  { key: '旅行', label: '旅行' },
  { key: '文化', label: '文化' },
  { key: '运动', label: '运动' },
];

const DIFFICULTY_FILTERS: Array<{ key: string; label: string }> = [
  { key: '全部', label: '全部' },
  { key: '入门', label: '入门' },
  { key: '进阶', label: '进阶' },
  { key: '高阶', label: '高阶' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  '入门': 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
  '进阶': 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  '高阶': 'bg-rose-900/40 text-rose-300 border-rose-700/50',
};

// Predefined gradient backgrounds for theme card covers
const COVER_GRADIENTS = [
  'from-violet-700 via-purple-800 to-indigo-900',
  'from-teal-700 via-cyan-800 to-blue-900',
  'from-rose-700 via-pink-800 to-fuchsia-900',
  'from-amber-600 via-orange-700 to-red-800',
  'from-emerald-700 via-green-800 to-teal-900',
  'from-sky-600 via-blue-700 to-indigo-800',
  'from-fuchsia-700 via-purple-800 to-violet-900',
  'from-lime-600 via-green-700 to-emerald-800',
];

function getGradientForTheme(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COVER_GRADIENTS[Math.abs(hash) % COVER_GRADIENTS.length];
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 28 },
  },
};

// ---------------------------------------------------------------------------
// ThemeCard sub-component
// ---------------------------------------------------------------------------

function ThemeCard({
  theme,
  gradient,
  onCreateProject,
  onNavigate,
}: {
  theme: Theme;
  gradient: string;
  onCreateProject: (e: React.MouseEvent, theme: Theme) => void;
  onNavigate: (themeId: string) => void;
}) {
  return (
    <motion.div variants={cardVariants} layout>
      <Card
        className={cn(
          'group cursor-pointer overflow-hidden border border-border-primary',
          'bg-bg-elevated hover:border-accent-primary/40',
          'transition-colors duration-200',
        )}
        onClick={() => onNavigate(theme.id)}
      >
        {/* Cover placeholder */}
        <div
          className={cn(
            'relative h-40 w-full bg-gradient-to-br',
            gradient,
          )}
        >
          {/* Category badge overlay */}
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-white/80 text-text-primary backdrop-blur-sm border-0 text-xs">
              {theme.category}
            </Badge>
          </div>

          {/* Difficulty badge overlay */}
          <div className="absolute top-3 right-3">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                DIFFICULTY_COLORS[theme.difficulty] ?? 'bg-bg-primary/60 text-text-secondary',
              )}
            >
              {theme.difficulty}
            </span>
          </div>

          {/* Play icon centre */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
              <svg
                className="h-5 w-5 text-white ml-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.23v11.54a1.5 1.5 0 0 0 2.3 1.39l9.5-5.77a1.5 1.5 0 0 0 0-2.78l-9.5-5.77Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 space-y-3">
          <h3 className="text-base font-semibold text-text-primary group-hover:text-accent-secondary transition-colors line-clamp-1">
            {theme.title}
          </h3>

          <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
            {theme.description}
          </p>

          {/* Tags */}
          {theme.tags && theme.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {theme.tags.slice(0, 4).map((tag) => (
                <Tag key={tag} label={tag} variant="outline" className="text-[11px] py-0 px-2" />
              ))}
              {theme.tags.length > 4 && (
                <span className="text-[11px] text-text-tertiary self-center">
                  +{theme.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Action button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 border-accent-primary/40 text-accent-secondary hover:bg-accent-primary/10 hover:border-accent-primary text-xs"
            onClick={(e) => onCreateProject(e, theme)}
          >
            <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            从主题创建项目
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ThemeLibraryPage
// ---------------------------------------------------------------------------

export default function ThemeLibraryPage() {
  const navigate = useNavigate();
  const themes = useThemes();
  const { create: createProject } = useProjects();
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [activeDifficulty, setActiveDifficulty] = useState('全部');

  // Derived filtered list
  const filteredThemes = useMemo(() => {
    if (!themes) return [];

    return themes.filter((theme) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = theme.title?.toLowerCase().includes(q);
        const matchesDesc = theme.description?.toLowerCase().includes(q);
        const matchesTags = theme.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }

      // Category filter
      if (activeCategory !== '全部' && theme.category !== activeCategory) {
        return false;
      }

      // Difficulty filter
      if (activeDifficulty !== '全部' && theme.difficulty !== activeDifficulty) {
        return false;
      }

      return true;
    });
  }, [themes, searchQuery, activeCategory, activeDifficulty]);

  // Handlers
  const handleNavigateToTheme = (themeId: string) => {
    navigate(`/themes/${themeId}`);
  };

  const handleCreateProject = async (e: React.MouseEvent, theme: Theme) => {
    e.stopPropagation();
    try {
      const project = await createProject({
        title: `纪录片：${theme.title}`,
        description: theme.description,
        status: 'planning',
        themeId: theme.id,
        tags: [...theme.tags],
        targetDuration: 300,
        notes: theme.shootingTips,
      });
      navigate(`/script/${project.id}`);
    } catch {
      // Error handled by hook or toast
    }
  };

  // ------------------------------------------------------------------
  // Main render
  // ------------------------------------------------------------------
  return (
    <div className={cn('mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8', !sidebarCollapsed && 'lg:pl-72')}>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">主题库</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          选择一个主题开始您的纪录片创作之旅
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索主题名称、描述或标签..."
        />
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Category filter pills */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-tertiary">
            主题类别
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  'inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
                  'border',
                  activeCategory === cat.key
                    ? 'border-accent-primary bg-accent-primary/15 text-accent-secondary shadow-sm shadow-accent-primary/20'
                    : 'border-border-primary bg-bg-secondary text-text-secondary hover:border-border-primary hover:text-text-primary hover:bg-bg-elevated',
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty filter pills */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-tertiary">
            难度级别
          </p>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_FILTERS.map((diff) => (
              <button
                key={diff.key}
                type="button"
                onClick={() => setActiveDifficulty(diff.key)}
                className={cn(
                  'inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
                  'border',
                  activeDifficulty === diff.key
                    ? 'border-accent-primary bg-accent-primary/15 text-accent-secondary shadow-sm shadow-accent-primary/20'
                    : 'border-border-primary bg-bg-secondary text-text-secondary hover:border-border-primary hover:text-text-primary hover:bg-bg-elevated',
                )}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-tertiary">
          {filteredThemes.length === 0
            ? '未找到匹配的主题'
            : `共 ${filteredThemes.length} 个主题`}
        </p>

        {(searchQuery || activeCategory !== '全部' || activeDifficulty !== '全部') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('全部');
              setActiveDifficulty('全部');
            }}
            className="text-xs text-accent-secondary hover:text-accent-primary transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            清除筛选
          </button>
        )}
      </div>

      {/* Theme grid or empty state */}
      {filteredThemes.length === 0 ? (
        <EmptyState
          icon={<SlidersHorizontal className="h-10 w-10 text-text-tertiary" />}
          title="未找到匹配的主题"
          description="尝试调整搜索条件或筛选器"
          action={{
            label: '重置全部筛选',
            onClick: () => {
              setSearchQuery('');
              setActiveCategory('全部');
              setActiveDifficulty('全部');
            },
          }}
        />
      ) : (
        <motion.div
          key={`${activeCategory}-${activeDifficulty}-${searchQuery}`}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              gradient={getGradientForTheme(theme.id)}
              onCreateProject={handleCreateProject}
              onNavigate={handleNavigateToTheme}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
