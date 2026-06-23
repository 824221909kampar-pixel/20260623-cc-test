import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Camera,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useScene,
  useShots,
  createShot,
  updateShot,
  deleteShot,
} from '../../../hooks/useScripts';
import { useProject } from '../../../hooks/useProjects';
import { useEditorStore } from '../../../stores/useEditorStore';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import { EmptyState } from '../../../components/ui/empty-state';
import { Spinner } from '../../../components/ui/spinner';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { cn } from '../../../lib/utils';
import {
  SHOT_TYPE_LABELS,
  CAMERA_MOVEMENT_LABELS,
  CAMERA_ANGLE_LABELS,
  TRANSITION_LABELS,
} from '../../../types/script';
import type { Shot, ShotType, CameraMovement, CameraAngle, TransitionType } from '../../../types/script';

const shotTypeOptions = Object.entries(SHOT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const cameraMovementOptions = Object.entries(CAMERA_MOVEMENT_LABELS).map(([value, label]) => ({ value, label }));
const cameraAngleOptions = Object.entries(CAMERA_ANGLE_LABELS).map(([value, label]) => ({ value, label }));
const transitionOptions = Object.entries(TRANSITION_LABELS).map(([value, label]) => ({ value, label }));

function ShotDetailCard({
  shot,
  index,
  total,
  onPrev,
  onNext,
}: {
  shot: Shot;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [showSketch, setShowSketch] = useState(false);

  return (
    <Card className="overflow-hidden">
      {/* Shot header */}
      <div className="p-4 bg-bg-tertiary border-b border-border-primary flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={onPrev} disabled={index === 0} className="p-1 rounded hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed text-text-tertiary">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-mono text-text-primary">{index + 1} / {total}</span>
            <button onClick={onNext} disabled={index === total - 1} className="p-1 rounded hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed text-text-tertiary">
              <ChevronRight size={16} />
            </button>
          </div>
          <Badge variant="outline" size="sm">
            {SHOT_TYPE_LABELS[shot.shotType]}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            icon={showSketch ? Eye : Pencil}
            onClick={() => setShowSketch(!showSketch)}
          >
            {showSketch ? '查看信息' : '绘制草图'}
          </Button>
          <button
            onClick={() => deleteShot(shot.id)}
            className="p-1.5 rounded hover:bg-error/10 text-text-tertiary hover:text-error transition-colors"
            title="删除镜头"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {showSketch ? (
        <SketchCanvas
          dataUrl={shot.sketch}
          onSave={async (dataUrl) => {
            await updateShot(shot.id, { sketch: dataUrl });
          }}
        />
      ) : (
        <div className="p-5 space-y-5">
          {/* Shot parameters grid */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="景别"
              value={shot.shotType}
              onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                await updateShot(shot.id, { shotType: e.target.value as ShotType });
              }}
              options={shotTypeOptions}
            />
            <Select
              label="机位运动"
              value={shot.cameraMovement}
              onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                await updateShot(shot.id, { cameraMovement: e.target.value as CameraMovement });
              }}
              options={cameraMovementOptions}
            />
            <Select
              label="拍摄角度"
              value={shot.cameraAngle}
              onChange={async (value: string) => {
                await updateShot(shot.id, { cameraAngle: value as CameraAngle });
              }}
              options={cameraAngleOptions}
            />
            <Select
              label="转场效果"
              value={shot.transition}
              onChange={async (value: string) => {
                await updateShot(shot.id, { transition: value as TransitionType });
              }}
              options={transitionOptions}
            />
          </div>

          {/* Duration */}
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-text-tertiary" />
            <input
              type="number"
              value={shot.duration}
              onChange={async (e) => {
                await updateShot(shot.id, { duration: Number(e.target.value) || 1 });
              }}
              className="w-20 bg-bg-tertiary border border-border-primary rounded px-3 py-1.5 text-sm text-text-primary text-center focus:outline-none focus:ring-2 focus:ring-accent-primary"
              min={1}
              max={300}
            />
            <span className="text-sm text-text-tertiary">秒</span>
          </div>

          {/* Description */}
          <Textarea
            label="镜头描述"
            value={shot.description}
            onChange={async (e) => {
              await updateShot(shot.id, { description: e.target.value });
            }}
            placeholder="详细描述这个镜头：画面内容、人物动作、环境氛围..."
            rows={3}
          />

          {/* Notes */}
          <Textarea
            label="备注"
            value={shot.notes}
            onChange={async (e) => {
              await updateShot(shot.id, { notes: e.target.value });
            }}
            placeholder="拍摄注意事项、道具清单、布光要求..."
            rows={2}
          />
        </div>
      )}
    </Card>
  );
}

function SketchCanvas({ dataUrl, onSave }: { dataUrl?: string; onSave: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1a1a26';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#f0f0f5';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (dataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    }
  }, [dataUrl]);

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    setLastPos(getPos(e));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !lastPos) return;
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPos(null);
    const dataUrl = canvasRef.current?.toDataURL();
    if (dataUrl) onSave(dataUrl);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1a1a26';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onSave('');
  };

  return (
    <div className="p-4">
      <div className="text-xs text-text-secondary mb-2 flex items-center justify-between">
        <span>✏️ 在此绘制镜头草图</span>
        <button onClick={handleClear} className="text-error hover:text-error/80 text-xs">清除</button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        className="w-full border border-border-primary rounded-lg cursor-crosshair"
        style={{ aspectRatio: '16/9' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}

export default function SceneDetailPage() {
  const { projectId, sceneId } = useParams<{ projectId: string; sceneId: string }>();
  const navigate = useNavigate();
  const scene = useScene(sceneId!);
  const shots = useShots(sceneId!);
  const project = useProject(projectId!);
  const { setActiveScene } = useEditorStore();

  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [showAddShot, setShowAddShot] = useState(false);
  const [deleteShotId, setDeleteShotId] = useState<string | null>(null);

  useEffect(() => {
    if (sceneId) setActiveScene(sceneId);
    return () => setActiveScene(null);
  }, [sceneId, setActiveScene]);

  const handleCreateShot = async () => {
    if (!sceneId) return;
    const shot = await createShot({
      sceneId: sceneId!,
      shotType: 'medium',
      cameraMovement: 'static',
      cameraAngle: 'eye-level',
      transition: 'cut',
      duration: 5,
      description: '',
      notes: '',
      status: 'pending',
    });
    setCurrentShotIndex(shots.length);
    setShowAddShot(false);
  };

  if (!scene) {
    return <div className="h-full flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  const currentShot = shots[currentShotIndex];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 border-b border-border-primary bg-bg-secondary flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/script/${projectId}`)}
            className="p-1 rounded hover:bg-bg-hover text-text-tertiary hover:text-text-primary"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">{scene.title}</h2>
            <span className="text-xs text-text-tertiary">{project?.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-disabled">{shots.length} 个镜头</span>
          <Button size="sm" onClick={handleCreateShot} icon={<Plus size={14} />}>
            添加镜头
          </Button>
        </div>
      </div>

      {/* Storyboard strip */}
      <div className="h-24 border-b border-border-primary bg-bg-secondary overflow-x-auto flex-shrink-0">
        <div className="flex gap-2 p-3 h-full items-center">
          {shots.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-text-disabled">暂无镜头 — 点击"添加镜头"创建第一个分镜</p>
            </div>
          ) : (
            shots.map((shot, idx) => (
              <motion.button
                key={shot.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentShotIndex(idx)}
                className={cn(
                  'flex-shrink-0 w-32 h-16 rounded-lg border-2 transition-all duration-200 overflow-hidden relative',
                  idx === currentShotIndex
                    ? 'border-accent-primary shadow-lg shadow-accent-glow/30'
                    : 'border-border-primary hover:border-border-accent'
                )}
              >
                <div className="absolute inset-0 bg-bg-tertiary flex items-center justify-center">
                  {shot.sketch ? (
                    <img src={shot.sketch} alt={`镜头 ${idx + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={20} className="text-text-disabled" />
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-bg-elevated/85 backdrop-blur-sm px-1.5 py-0.5 flex items-center justify-between">
                  <span className="text-[10px] text-text-primary font-mono">{idx + 1}</span>
                  <span className="text-[10px] text-text-secondary truncate ml-1">
                    {SHOT_TYPE_LABELS[shot.shotType]}
                  </span>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        {shots.length === 0 ? (
          <EmptyState
            icon={<Camera size={48} />}
            title="开始设计分镜"
            description="为这个场景添加第一个镜头，设计景别、机位和画面内容"
            action={{ label: '添加第一个镜头', onClick: handleCreateShot }}
          />
        ) : currentShot ? (
          <ShotDetailCard
            shot={currentShot}
            index={currentShotIndex}
            total={shots.length}
            onPrev={() => setCurrentShotIndex(Math.max(0, currentShotIndex - 1))}
            onNext={() => setCurrentShotIndex(Math.min(shots.length - 1, currentShotIndex + 1))}
          />
        ) : (
          <EmptyState icon={<Camera size={48} />} title="选择或添加一个镜头" description="从上方时间线点击镜头或创建新镜头" />
        )}
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteShotId}
        onClose={() => setDeleteShotId(null)}
        onConfirm={async () => {
          if (deleteShotId) {
            await deleteShot(deleteShotId);
            if (currentShotIndex >= shots.length - 1) {
              setCurrentShotIndex(Math.max(0, shots.length - 2));
            }
            setDeleteShotId(null);
          }
        }}
        title="删除镜头"
        message="确认删除这个镜头？"
        confirmLabel="删除"
        variant="danger"
      />
    </div>
  );
}
