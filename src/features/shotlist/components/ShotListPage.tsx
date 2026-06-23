import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Download,
  Printer,
  RefreshCw,
  ListChecks,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useShotListItems,
  generateShotList,
  updateShotListItem,
} from '../../../hooks/useShotList';
import { useProject } from '../../../hooks/useProjects';
import { Button } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import { Spinner } from '../../../components/ui/spinner';
import { cn, formatDuration, downloadJson } from '../../../lib/utils';
import {
  SHOT_TYPE_LABELS,
  CAMERA_MOVEMENT_LABELS,
} from '../../../types/script';
import {
  SHOT_STATUS_LABELS,
  SHOT_STATUS_COLORS,
} from '../../../types/shotlist';
import type { ShotStatus, ShotListItem } from '../../../types/shotlist';

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待拍' },
  { value: 'ready', label: '就绪' },
  { value: 'shot', label: '已拍' },
  { value: 'reshoot', label: '补拍' },
];

const STATUS_ENTRIES = Object.entries(SHOT_STATUS_LABELS) as [ShotStatus, string][];

function ShotRow({
  item,
  index,
}: {
  item: ShotListItem;
  index: number;
}) {
  const handleStatusChange = async (status: ShotStatus) => {
    await updateShotListItem(item.id, { status });
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="border-b border-border-primary hover:bg-bg-hover/50 transition-colors"
    >
      <td className="py-3 px-4">
        <span className="text-xs text-text-disabled font-mono">{index + 1}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-text-primary">{item.sceneTitle}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-text-secondary line-clamp-1 max-w-xs">
          {item.description || '—'}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs text-text-tertiary">{SHOT_TYPE_LABELS[item.shotType]}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs text-text-tertiary">{CAMERA_MOVEMENT_LABELS[item.cameraMovement]}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs text-text-tertiary">{formatDuration(item.duration)}</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-1">
          {STATUS_ENTRIES.map(([status, label]) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={cn(
                'text-[10px] px-2 py-1 rounded-full transition-all',
                item.status === status
                  ? 'bg-opacity-20 text-white font-medium'
                  : 'text-text-disabled hover:text-text-secondary',
              )}
              style={{
                backgroundColor: item.status === status ? SHOT_STATUS_COLORS[status] + '30' : 'transparent',
                color: item.status === status ? SHOT_STATUS_COLORS[status] : undefined,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs text-text-tertiary truncate block max-w-[120px]">
          {item.location || '—'}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs text-text-tertiary truncate block max-w-[100px]">
          {item.equipment.join(', ') || '—'}
        </span>
      </td>
    </motion.tr>
  );
}

export default function ShotListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useProject(projectId!);
  const items = useShotListItems(projectId!);
  const [statusFilter, setStatusFilter] = useState('all');
  const [generating, setGenerating] = useState(false);

  const filteredItems = items.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const statusCounts = {
    pending: items.filter((i) => i.status === 'pending').length,
    ready: items.filter((i) => i.status === 'ready').length,
    shot: items.filter((i) => i.status === 'shot').length,
    reshoot: items.filter((i) => i.status === 'reshoot').length,
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateShotList(projectId!);
    } catch (e) {
      console.error('Failed to generate shot list:', e);
    }
    setGenerating(false);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `
      <html>
      <head><title>拍摄清单 - ${project?.title || ''}</title>
      <style>
        body { font-family: "PingFang SC", sans-serif; margin: 20px; color: #333; }
        h1 { font-size: 20px; margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #f5f5f5; font-weight: 600; }
      </style></head>
      <body>
        <h1>🎬 ${project?.title || '拍摄清单'}</h1>
        <p>共 ${filteredItems.length} 个镜头</p>
        <table>
          <thead><tr><th>#</th><th>场景</th><th>描述</th><th>景别</th><th>机位</th><th>时长</th><th>状态</th></tr></thead>
          <tbody>
            ${filteredItems.map((item, idx) => `
              <tr>
                <td>${idx + 1}</td><td>${item.sceneTitle}</td><td>${item.description}</td>
                <td>${SHOT_TYPE_LABELS[item.shotType]}</td><td>${CAMERA_MOVEMENT_LABELS[item.cameraMovement]}</td>
                <td>${formatDuration(item.duration)}</td><td>${SHOT_STATUS_LABELS[item.status]}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body></html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportJSON = () => {
    downloadJson(
      {
        project: project?.title,
        generatedAt: new Date().toISOString(),
        shots: filteredItems,
      },
      `shotlist-${project?.title || 'export'}.json`
    );
  };

  if (!projectId || !project) {
    return <div className="h-full flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">拍摄清单</h1>
          <p className="text-sm text-text-tertiary mt-1">{project.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGenerate}
            loading={generating}
            icon={<RefreshCw size={14} />}
          >
            从分镜生成
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportPDF} icon={<Printer size={14} />}>
            打印
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportJSON} icon={<Download size={14} />}>
            导出
          </Button>
        </div>
      </div>

      {/* Status summary */}
      {items.length > 0 && (
        <div className="grid grid-cols-4 gap-3 flex-shrink-0">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="bg-bg-elevated border border-border-primary rounded-lg p-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SHOT_STATUS_COLORS[status as ShotStatus] }} />
              <div>
                <p className="text-lg font-bold text-text-primary">{count}</p>
                <p className="text-xs text-text-tertiary">{SHOT_STATUS_LABELS[status as ShotStatus]}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex gap-1.5">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'px-3 py-1 rounded-full text-xs transition-colors',
                statusFilter === opt.value
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-text-disabled ml-auto">
          {filteredItems.length} / {items.length} 个镜头
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-lg border border-border-primary">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon={<ListChecks size={48} />}
              title="还没有拍摄清单"
              description="从分镜设计自动生成拍摄清单"
              action={{ label: '生成拍摄清单', onClick: handleGenerate }}
            />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-primary bg-bg-secondary sticky top-0 z-10">
                <th className="py-3 px-4 text-left text-xs font-medium text-text-tertiary w-12">#</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-text-tertiary">场景</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-text-tertiary">描述</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-text-tertiary">景别</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-text-tertiary">机位</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-text-tertiary">时长</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-text-tertiary">状态</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-text-tertiary">地点</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-text-tertiary">设备</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => (
                <ShotRow key={item.id} item={item} index={idx} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
