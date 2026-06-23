import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Clock,
  FileText,
  Eye,
} from 'lucide-react';
import {
  useScript,
  useScenes,
  useShots,
  createScene,
  updateScene,
  deleteScene,
  createShot,
  updateShot,
  deleteShot,
  reorderScenes,
} from '../../../hooks/useScripts';
import { useProject } from '../../../hooks/useProjects';
import { useEditorStore } from '../../../stores/useEditorStore';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Modal } from '../../../components/ui/modal';
import { EmptyState } from '../../../components/ui/empty-state';
import { Spinner } from '../../../components/ui/spinner';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { cn, formatDuration } from '../../../lib/utils';
import {
  SHOT_TYPE_LABELS,
  CAMERA_MOVEMENT_LABELS,
} from '../../../types/script';
import type { Scene, Shot } from '../../../types/script';

function SceneCard({
  scene,
  isActive,
  onClick,
  onDelete,
}: {
  scene: Scene;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const shots = useShots(scene.id);
  const totalDuration = shots.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-all duration-200 group',
        isActive
          ? 'border-accent-primary bg-accent-primary/5'
          : 'border-transparent hover:border-border-primary hover:bg-bg-hover'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] text-text-disabled font-mono w-5">{scene.order + 1}</span>
        <h4 className="text-sm font-medium text-text-primary truncate flex-1">{scene.title}</h4>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-0.5 rounded hover:bg-error/10 text-text-disabled hover:text-error opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <p className="text-xs text-text-tertiary line-clamp-2 ml-7">{scene.description || '暂无描述'}</p>
      <div className="flex items-center gap-3 ml-7 mt-2">
        <span className="text-[10px] text-text-disabled flex items-center gap-1">
          <Clock size={10} /> {formatDuration(totalDuration)}
        </span>
        <span className="text-[10px] text-text-disabled">{shots.length} 镜头</span>
        {scene.location && (
          <span className="text-[10px] text-text-disabled truncate">{scene.location}</span>
        )}
      </div>
    </div>
  );
}

function ShotRow({ shot, index }: { shot: Shot; index: number }) {
  const [desc, setDesc] = useState(shot.description);
  const [duration, setDuration] = useState(shot.duration);

  const handleDescBlur = async () => {
    if (desc !== shot.description) {
      await updateShot(shot.id, { description: desc });
    }
  };

  const handleDurationBlur = async () => {
    if (duration !== shot.duration) {
      await updateShot(shot.id, { duration });
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-tertiary border border-border-primary group hover:border-border-accent transition-colors">
      <span className="text-xs text-text-disabled font-mono mt-1.5 w-6 flex-shrink-0">{index + 1}</span>
      <div className="flex-1 min-w-0 space-y-2">
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={handleDescBlur}
          placeholder="描述这个镜头..."
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-disabled focus:outline-none"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-tertiary">
            {SHOT_TYPE_LABELS[shot.shotType]}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-tertiary">
            {CAMERA_MOVEMENT_LABELS[shot.cameraMovement]}
          </span>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            onBlur={handleDurationBlur}
            className="w-14 text-[10px] bg-bg-elevated border border-border-primary rounded px-1.5 py-0.5 text-text-primary text-center focus:outline-none focus:ring-1 focus:ring-accent-primary"
            min={1}
          />
          <span className="text-[10px] text-text-disabled">秒</span>
          <button
            onClick={() => deleteShot(shot.id)}
            className="p-0.5 rounded hover:bg-error/10 text-text-disabled hover:text-error opacity-0 group-hover:opacity-100 transition-all ml-auto"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScriptPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const project = useProject(projectId);
  const script = useScript(projectId!);
  const scenes = useScenes(script?.id);
  const { setActiveScript, setActiveScene, activeSceneId } = useEditorStore();

  const [showNewSceneModal, setShowNewSceneModal] = useState(false);
  const [deleteSceneId, setDeleteSceneId] = useState<string | null>(null);
  const [sceneForm, setSceneForm] = useState({ title: '', description: '', location: '' });

  const activeScene = scenes.find(s => s.id === activeSceneId);
  const shots = useShots(activeScene?.id);

  useEffect(() => {
    if (script) setActiveScript(script.id);
    return () => { setActiveScript(null); setActiveScene(null); };
  }, [script, setActiveScript, setActiveScene]);

  useEffect(() => {
    if (scenes.length > 0 && !activeSceneId) {
      setActiveScene(scenes[0].id);
    }
  }, [scenes, activeSceneId, setActiveScene]);

  // Ensure script exists
  useEffect(() => {
    if (projectId && !script) {
      const init = async () => {
        const { createScript: initScript } = await import('../../../hooks/useScripts');
        const s = await initScript({ projectId: projectId!, title: project?.title || '未命名脚本', notes: '' });
        setActiveScript(s.id);
      };
      init();
    }
  }, [projectId, script, project?.title, setActiveScript]);

  const handleCreateScene = async () => {
    if (!sceneForm.title.trim() || !script) return;
    const scene = await createScene({
      scriptId: script.id,
      title: sceneForm.title,
      description: sceneForm.description,
      location: sceneForm.location,
      timeOfDay: 'interior',
      interior: true,
      dialogue: '',
      shots: [],
      notes: '',
      duration: 0,
    });
    setActiveScene(scene.id);
    setSceneForm({ title: '', description: '', location: '' });
    setShowNewSceneModal(false);
  };

  const handleDeleteScene = async () => {
    if (!deleteSceneId) return;
    await deleteScene(deleteSceneId);
    if (activeSceneId === deleteSceneId) {
      const remaining = scenes.filter(s => s.id !== deleteSceneId);
      setActiveScene(remaining[0]?.id || null);
    }
    setDeleteSceneId(null);
  };

  const handleCreateShot = async () => {
    if (!activeScene) return;
    await createShot({
      sceneId: activeScene.id,
      shotType: 'medium',
      cameraMovement: 'static',
      cameraAngle: 'eye-level',
      transition: 'cut',
      duration: 5,
      description: '',
      notes: '',
      status: 'pending',
    });
  };

  if (!projectId || !project) {
    return <div className="h-full flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Scene Sidebar */}
      <div className="w-64 border-r border-border-primary bg-bg-secondary flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-border-primary flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">场景列表</h3>
          <button
            onClick={() => setShowNewSceneModal(true)}
            className="p-1 rounded hover:bg-bg-hover text-text-tertiary hover:text-text-primary"
            title="添加场景"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {!script ? (
            <div className="text-center py-8">
              <Spinner size="sm" />
              <p className="text-xs text-text-disabled mt-2">加载中...</p>
            </div>
          ) : scenes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-text-disabled">暂无场景</p>
              <button onClick={() => setShowNewSceneModal(true)} className="text-xs text-accent-primary hover:text-accent-secondary mt-1">
                + 添加第一个场景
              </button>
            </div>
          ) : (
            scenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                isActive={activeSceneId === scene.id}
                onClick={() => setActiveScene(scene.id)}
                onDelete={() => setDeleteSceneId(scene.id)}
              />
            ))
          )}
        </div>
        <div className="p-3 border-t border-border-primary">
          <Button
            size="sm"
            className="w-full"
            onClick={() => activeScene && navigate(`/script/${projectId}/scene/${activeScene.id}`)}
            icon={<Eye size={14} />}
          >
            分镜详情
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border-primary bg-bg-secondary">
          {activeScene ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge size="sm" variant="outline">场景 {activeScene.order + 1}</Badge>
                <h2 className="text-lg font-semibold text-text-primary">{activeScene.title}</h2>
              </div>
              <p className="text-sm text-text-secondary">{activeScene.description || '暂无描述'}</p>
              {activeScene.location && (
                <p className="text-xs text-text-tertiary mt-1">📍 {activeScene.location}</p>
              )}
            </div>
          ) : (
            <EmptyState
              icon={<FileText size={36} />}
              title="选择或创建一个场景"
              description="从左侧场景列表中选择，或点击 + 创建新场景"
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeScene ? (
            <div className="space-y-4 max-w-3xl">
              <Textarea
                label="场景描述"
                value={activeScene.description}
                onChange={async (e) => {
                  await updateScene(activeScene.id, { description: e.target.value });
                }}
                placeholder="描述这个场景发生的内容、氛围、情绪..."
                rows={4}
              />
              <Textarea
                label="对白 / 旁白"
                value={activeScene.dialogue}
                onChange={async (e) => {
                  await updateScene(activeScene.id, { dialogue: e.target.value });
                }}
                placeholder="人物对话或旁白文字..."
                rows={4}
              />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-text-primary">
                    镜头列表 ({shots.length})
                  </h4>
                  <Button size="sm" variant="ghost" onClick={handleCreateShot} icon={<Plus size={14} />}>
                    添加镜头
                  </Button>
                </div>
                <div className="space-y-2">
                  {shots.length === 0 ? (
                    <p className="text-xs text-text-disabled text-center py-8">暂无镜头，点击"添加镜头"开始</p>
                  ) : (
                    shots.map((shot, idx) => (
                      <ShotRow key={shot.id} shot={shot} index={idx} />
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="h-10 border-t border-border-primary bg-bg-secondary flex items-center justify-between px-4">
          <span className="text-xs text-text-disabled">
            {script ? `共 ${scenes.length} 个场景` : '初始化中...'}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => activeScene && navigate(`/script/${projectId}/scene/${activeScene.id}`)}>
              进入分镜视图 →
            </Button>
          </div>
        </div>
      </div>

      {/* New Scene Modal */}
      <Modal open={showNewSceneModal} onClose={() => setShowNewSceneModal(false)} title="新建场景" size="sm">
        <div className="space-y-4">
          <Input
            label="场景标题"
            value={sceneForm.title}
            onChange={(e) => setSceneForm({ ...sceneForm, title: e.target.value })}
            placeholder="例如：街头相遇"
            autoFocus
          />
          <Textarea
            label="场景描述（可选）"
            value={sceneForm.description}
            onChange={(e) => setSceneForm({ ...sceneForm, description: e.target.value })}
            placeholder="简单描述这个场景..."
            rows={3}
          />
          <Input
            label="拍摄地点（可选）"
            value={sceneForm.location}
            onChange={(e) => setSceneForm({ ...sceneForm, location: e.target.value })}
            placeholder="例如：北京东城胡同"
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowNewSceneModal(false)}>取消</Button>
            <Button onClick={handleCreateScene}>创建场景</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteSceneId}
        onClose={() => setDeleteSceneId(null)}
        onConfirm={handleDeleteScene}
        title="删除场景"
        message="删除后该场景下的所有镜头也会被删除，确认删除？"
        confirmLabel="删除"
        variant="danger"
      />
    </div>
  );
}
