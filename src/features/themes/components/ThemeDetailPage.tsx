import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Lightbulb,
  Plus,
} from 'lucide-react';

import { useTheme, useThemes, createTheme } from '../../../hooks/useThemes';
import { useProjects } from '../../../hooks/useProjects';
import { useUIStore } from '../../../stores/useUIStore';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Spinner } from '../../../components/ui/spinner';
import { Tag } from '../../../components/ui/tag';
import { EmptyState } from '../../../components/ui/empty-state';
import { cn } from '../../../lib/utils';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../../../types/common';
import type { ThemeCategory, ThemeDifficulty } from '../../../types/common';

export default function ThemeDetailPage() {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const theme = useTheme(themeId);
  const themes = useThemes();
  const { setActiveProject } = useUIStore();

  const handleCreateProject = async () => {
    if (!theme) return;
    const { create } = useProjects.getState?.() ?? (await import('../../../hooks/useProjects')).useProjects;
    // Direct import approach
    const { create: createProject } = await import('../../../hooks/useProjects');
    // Actually let's use the projects hook properly
    const project = await createProject({
      title: `纪录片：${theme.title}`,
      description: theme.description,
      status: 'planning',
      themeId: theme.id,
      tags: [...theme.tags],
      targetDuration: parseInt(theme.suggestedDuration) * 60 || 300,
      notes: theme.shootingTips,
    });
    setActiveProject(project.id);
    navigate(`/script/${project.id}`);
  };

  if (!theme) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const categoryLabel = CATEGORY_LABELS[theme.category as ThemeCategory] || theme.category;
  const difficultyLabel = DIFFICULTY_LABELS[theme.difficulty as ThemeDifficulty] || theme.difficulty;
  const relatedThemes = themes.filter((t) => t.id !== theme.id && t.category === theme.category).slice(0, 4);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/themes')}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={16} /> 返回主题库
      </button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="h-56 rounded-2xl bg-gradient-to-br from-accent-primary/30 via-accent-rose/20 to-accent-cool/10 flex items-center justify-center mb-6">
          <Lightbulb size={64} className="text-accent-primary/30" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="default">{categoryLabel}</Badge>
          <Badge variant="outline">{difficultyLabel}</Badge>
          <span className="text-sm text-text-tertiary flex items-center gap-1">
            <Clock size={14} /> {theme.suggestedDuration}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-3">{theme.title}</h1>
        <p className="text-base text-text-secondary leading-relaxed">{theme.description}</p>
      </motion.div>

      {/* Action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Button size="lg" onClick={handleCreateProject} icon={<Plus size={18} />} className="w-full sm:w-auto">
          使用此主题创建项目
        </Button>
      </motion.div>

      {/* Shooting Tips */}
      {theme.shootingTips && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <Card.Header>
              <Card.Title>🎥 拍摄建议</Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {theme.shootingTips}
              </p>
            </Card.Content>
          </Card>
        </motion.div>
      )}

      {/* Tags */}
      {theme.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-text-primary mb-3">标签</h3>
          <div className="flex flex-wrap gap-2">
            {theme.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Related Themes */}
      {relatedThemes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h3 className="text-sm font-medium text-text-primary mb-4">相关主题</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedThemes.map((t) => (
              <Card
                key={t.id}
                className="cursor-pointer hover:border-border-accent transition-colors p-4"
                onClick={() => navigate(`/themes/${t.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-primary/20 to-accent-rose/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={20} className="text-accent-primary/60" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">{t.title}</h4>
                    <p className="text-xs text-text-tertiary mt-1 line-clamp-2">{t.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge size="sm" variant="outline">{CATEGORY_LABELS[t.category as ThemeCategory]}</Badge>
                      <span className="text-[10px] text-text-disabled">{t.suggestedDuration}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
