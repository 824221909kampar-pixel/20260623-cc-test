import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Film,
  Clock,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  FolderOpen,
  FileText,
  ListChecks,
  Play,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useProjects } from '../../../hooks/useProjects';
import { useUIStore } from '../../../stores/useUIStore';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { Modal } from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { formatDate } from '../../../lib/utils';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '../../../types/common';
import type { Project } from '../../../types/project';

const QUICK_ACTIONS = [
  { label: '浏览主题库', icon: Lightbulb, path: '/themes', color: '#a29bfe' },
  { label: '新建脑暴', icon: TrendingUp, path: '/brainstorm/', color: '#e84393', needsProject: true },
  { label: '搜集参考', icon: FolderOpen, path: '/references/', color: '#00cec9', needsProject: true },
  { label: '撰写脚本', icon: FileText, path: '/script/', color: '#f39c12', needsProject: true },
  { label: '拍摄清单', icon: ListChecks, path: '/shotlist/', color: '#74b9ff', needsProject: true },
];

function StatsOverview({ projects }: { projects: Project[] }) {
  const total = projects.length;
  const active = projects.filter((p) => !['completed', 'archived'].includes(p.status)).length;
  const completed = projects.filter((p) => p.status === 'completed').length;
  const totalMinutes = projects.reduce((sum, p) => sum + (p.targetDuration || 0), 0);

  const stats = [
    { label: '全部项目', value: total, icon: Film, color: '#6c5ce7' },
    { label: '进行中', value: active, icon: Play, color: '#f39c12' },
    { label: '已完成', value: completed, icon: CheckCircle2, color: '#00b894' },
    { label: '总时长', value: `${Math.floor(totalMinutes / 60)}h`, icon: Clock, color: '#e84393' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${stat.color}15` }}
          >
            <stat.icon size={20} style={{ color: stat.color }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-tertiary">{stat.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ProjectCard({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
  const navigate = useNavigate();
  const { setActiveProject } = useUIStore();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="group cursor-pointer hover:border-border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent-glow/10">
      <Card.Content className="p-5">
        {/* Cover */}
        <div className="h-32 rounded-lg bg-gradient-to-br from-accent-primary/20 to-accent-rose/10 mb-4 flex items-center justify-center overflow-hidden">
          {project.coverImage ? (
            <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <Film size={40} className="text-accent-primary/40" />
          )}
        </div>

        {/* Info */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-text-primary text-sm truncate flex-1 mr-2">
            {project.title}
          </h3>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-bg-hover text-text-tertiary transition-all"
            >
              <MoreHorizontal size={14} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 z-20 bg-bg-elevated border border-border-primary rounded-lg py-1 shadow-xl min-w-[120px]">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(project.id); setShowMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-error hover:bg-error/10 flex items-center gap-2"
                  >
                    <Trash2 size={12} />
                    删除项目
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-text-tertiary mb-3 line-clamp-2">
          {project.description || '暂无描述'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            size="sm"
          >
            <span
              className="w-1.5 h-1.5 rounded-full mr-1.5 inline-block"
              style={{ backgroundColor: PROJECT_STATUS_COLORS[project.status] }}
            />
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>
          <span className="text-xs text-text-disabled">{formatDate(project.updatedAt)}</span>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-bg-tertiary text-text-tertiary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects, create, remove } = useProjects();
  const { activeProjectId, setActiveProject } = useUIStore();
  const [showNewModal, setShowNewModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', targetDuration: 300 });

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    const project = await create({
      title: form.title,
      description: form.description,
      status: 'planning',
      tags: [],
      targetDuration: form.targetDuration,
      notes: '',
    });
    setActiveProject(project.id);
    setShowNewModal(false);
    setForm({ title: '', description: '', targetDuration: 300 });
    navigate(`/script/${project.id}`);
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    if (activeProjectId === id) setActiveProject(null);
    setDeleteId(null);
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    if (action.needsProject) {
      if (activeProjectId) {
        navigate(action.path + activeProjectId);
      } else {
        setShowNewModal(true);
      }
    } else {
      navigate(action.path);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">项目仪表盘</h1>
          <p className="text-sm text-text-tertiary mt-1">管理你的纪录片前期制作项目</p>
        </div>
        <Button onClick={() => setShowNewModal(true)} icon={Plus}>
          新建项目
        </Button>
      </div>

      {/* Stats */}
      <StatsOverview projects={projects} />

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <Card.Title>快捷操作</Card.Title>
          <Card.Description>快速开始纪录片制作流程</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-5 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action)}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border-primary hover:border-border-accent hover:bg-bg-hover transition-all duration-200 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${action.color}15` }}
                >
                  <action.icon size={22} style={{ color: action.color }} />
                </div>
                <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            全部项目
            <span className="text-sm text-text-tertiary ml-2 font-normal">{projects.length} 个</span>
          </h2>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={<Film size={48} />}
            title="还没有项目"
            description="创建你的第一个纪录片项目，开始前期筹备工作"
            action={{ label: '新建项目', onClick: () => setShowNewModal(true) }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProjectCard project={project} onDelete={(id) => setDeleteId(id)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      <Modal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="新建纪录片项目"
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowNewModal(false)}>取消</Button>
            <Button onClick={handleCreate} disabled={!form.title.trim()}>创建项目</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="项目名称"
            placeholder="给你的纪录片项目起个名字"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            autoFocus
          />
          <Textarea
            label="项目描述"
            placeholder="简单描述你想拍什么样的纪录片..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
          <Input
            label="预计总时长（秒）"
            type="number"
            value={String(form.targetDuration)}
            onChange={(e) => setForm({ ...form, targetDuration: Number(e.target.value) || 300 })}
          />
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="删除项目"
        message="删除后将无法恢复，相关数据（脑暴、参考、脚本、分镜）都会被一并删除。确认删除？"
        confirmLabel="删除"
        variant="danger"
      />
    </div>
  );
}
