import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
} from '@xyflow/react';
import type { NodeProps, Connection, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import {
  Trash2,
  Download,
  X,
  Lightbulb,
  ZoomIn,
  ZoomOut,
  User,
  MapPin,
  Zap,
  Palette,
  Star,
  Maximize2,
} from 'lucide-react';

import { useIdeas, createIdea, updateIdea, deleteIdea } from '../../../hooks/useIdeas';
import { useProject } from '../../../hooks/useProjects';
import { cn } from '../../../lib/utils';
import {
  IDEA_NODE_LABELS,
  IDEA_NODE_COLORS,
} from '../../../types/idea';
import type { IdeaNode as IdeaNodeType, IdeaNodeType as NodeTypeEnum } from '../../../types/idea';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import { EmptyState } from '../../../components/ui/empty-state';
import { Spinner } from '../../../components/ui/spinner';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

type FlowNodeData = {
  ideaId: string;
  type: NodeTypeEnum;
  title: string;
  content: string;
  tags: string[];
  onUpdate: (id: string, data: Partial<IdeaNodeType>) => void;
};

const NODE_TYPE_ICONS: Record<NodeTypeEnum, typeof Lightbulb> = {
  core: Lightbulb,
  character: User,
  scene: MapPin,
  conflict: Zap,
  visual: Palette,
  free: Star,
};

const nodeTypeOptions = Object.entries(IDEA_NODE_LABELS).map(([value, label]) => ({ value, label }));

function IdeaNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as FlowNodeData;
  const Icon = NODE_TYPE_ICONS[d.type] || Lightbulb;
  const color = IDEA_NODE_COLORS[d.type];

  return (
    <div
      className={cn(
        'rounded-lg border-2 min-w-[180px] max-w-[240px] bg-bg-elevated shadow-lg',
        selected ? 'border-accent-primary' : 'border-border-primary'
      )}
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <Handle type="target" position={Position.Top} className="!bg-text-tertiary" />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Icon size={14} style={{ color }} />
          <span className="text-sm font-medium text-text-primary truncate">{d.title || '未命名'}</span>
        </div>
        {d.content && (
          <p className="text-xs text-text-tertiary line-clamp-2">{d.content}</p>
        )}
        {d.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {d.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-tertiary">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-text-tertiary" />
    </div>
  );
}

const nodeTypes = { ideaNode: IdeaNodeComponent };

function BrainstormCanvas({ projectId }: { projectId: string }) {
  const ideas = useIdeas(projectId);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarData, setSidebarData] = useState({ title: '', content: '', type: 'core' as NodeTypeEnum, tags: '' });
  const reactFlowInstance = useReactFlow();

  // Sync ideas to ReactFlow nodes
  useEffect(() => {
    const flowNodes: Node[] = ideas.map((idea) => ({
      id: idea.id,
      type: 'ideaNode',
      position: idea.position || { x: Math.random() * 400, y: Math.random() * 300 },
      data: {
        ideaId: idea.id,
        type: idea.type,
        title: idea.title,
        content: idea.content,
        tags: idea.tags,
        onUpdate: handleIdeaUpdate,
      } satisfies FlowNodeData,
    }));

    const flowEdges: Edge[] = [];
    ideas.forEach((idea) => {
      if (idea.parentId) {
        flowEdges.push({
          id: `${idea.parentId}-${idea.id}`,
          source: idea.parentId,
          target: idea.id,
          sourceHandle: null,
          targetHandle: null,
        });
      }
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [ideas]);

  const handleIdeaUpdate = useCallback(async (id: string, data: Partial<IdeaNodeType>) => {
    await updateIdea(id, data);
  }, []);

  const handleConnect = useCallback(
    (connection: Connection) => {
      const edge = { ...connection, id: `${connection.source}-${connection.target}` };
      setEdges((eds) => addEdge(edge, eds));
      // Update parentId
      if (connection.target) {
        updateIdea(connection.target, { parentId: connection.source! });
      }
    },
    [setEdges]
  );

  const handlePaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newIdea = {
        projectId,
        type: 'core' as NodeTypeEnum,
        title: '新想法',
        content: '',
        position,
        tags: [],
        expanded: true,
      };
      createIdea(newIdea);
    },
    [projectId, reactFlowInstance]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const data = node.data as unknown as FlowNodeData;
      setSelectedIdeaId(data.ideaId);
      setSidebarData({
        title: data.title,
        content: data.content,
        type: data.type,
        tags: data.tags.join(', '),
      });
      setSidebarOpen(true);
    },
    []
  );

  const handleSaveSidebar = async () => {
    if (!selectedIdeaId) return;
    await updateIdea(selectedIdeaId, {
      title: sidebarData.title,
      content: sidebarData.content,
      type: sidebarData.type,
      tags: sidebarData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setSidebarOpen(false);
  };

  const handleDeleteSelected = async () => {
    if (selectedIdeaId) setDeleteId(selectedIdeaId);
  };

  const handleExportPNG = async () => {
    try {
      const { toPng } = await import(/* @vite-ignore */ 'html-to-image') as { toPng: (el: HTMLElement, opts?: Record<string, unknown>) => Promise<string> };
      const element = document.querySelector('.react-flow') as HTMLElement;
      if (element) {
        const dataUrl = await toPng(element, { backgroundColor: '#0a0a0f' });
        const link = document.createElement('a');
        link.download = 'brainstorm.png';
        link.href = dataUrl;
        link.click();
      }
    } catch {
      alert('导出失败');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-12 border-b border-border-primary bg-bg-secondary flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Select
            value="core"
            options={nodeTypeOptions}
            onChange={() => {}}
          />
          <span className="text-xs text-text-tertiary">双击画布添加节点</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => reactFlowInstance.zoomIn()} className="p-1.5 rounded hover:bg-bg-hover text-text-tertiary" title="放大">
            <ZoomIn size={16} />
          </button>
          <button onClick={() => reactFlowInstance.zoomOut()} className="p-1.5 rounded hover:bg-bg-hover text-text-tertiary" title="缩小">
            <ZoomOut size={16} />
          </button>
          <button onClick={() => reactFlowInstance.fitView()} className="p-1.5 rounded hover:bg-bg-hover text-text-tertiary" title="适应视图">
            <Maximize2 size={16} />
          </button>
          <Button size="sm" variant="ghost" onClick={handleExportPNG} icon={Download}>
            导出
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {ideas.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <EmptyState
              icon={<Lightbulb size={48} />}
              title="开始脑暴"
              description="双击画布创建第一个灵感节点"
            />
          </div>
        ) : null}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onNodeClick={handleNodeClick}
          onDoubleClick={handlePaneDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-bg-primary"
          deleteKeyCode={['Backspace', 'Delete']}
          onNodesDelete={(deletedNodes) => {
            deletedNodes.forEach((n) => {
              const data = n.data as unknown as FlowNodeData;
              deleteIdea(data.ideaId);
            });
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a3d" />
          <Controls className="!bg-bg-elevated !border-border-primary !text-text-primary" />
          <MiniMap
            className="!bg-bg-secondary !border-border-primary"
            nodeColor={(n) => {
              const d = n.data as unknown as FlowNodeData;
              return IDEA_NODE_COLORS[d.type] || '#6c5ce7';
            }}
          />
        </ReactFlow>
      </div>

      {/* Edit Sidebar */}
      {sidebarOpen && selectedIdeaId && (
        <motion.div
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          className="fixed right-0 top-0 bottom-0 w-80 bg-bg-elevated border-l border-border-primary shadow-2xl z-40 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-border-primary">
            <h3 className="text-sm font-semibold text-text-primary">编辑节点</h3>
            <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-bg-hover text-text-tertiary">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Input
              label="标题"
              value={sidebarData.title}
              onChange={(e) => setSidebarData({ ...sidebarData, title: e.target.value })}
            />
            <Select
              label="类型"
              value={sidebarData.type}
              onChange={(e) => setSidebarData({ ...sidebarData, type: e.target.value as NodeTypeEnum })}
              options={nodeTypeOptions}
            />
            <Textarea
              label="内容"
              value={sidebarData.content}
              onChange={(e) => setSidebarData({ ...sidebarData, content: e.target.value })}
              placeholder="展开你的想法..."
              rows={5}
            />
            <Input
              label="标签 (逗号分隔)"
              value={sidebarData.tags}
              onChange={(e) => setSidebarData({ ...sidebarData, tags: e.target.value })}
              placeholder="例如：人物, 冲突"
            />
          </div>
          <div className="p-4 border-t border-border-primary flex gap-2">
            <Button variant="danger" size="sm" className="flex-1" onClick={handleDeleteSelected} icon={Trash2}>
              删除
            </Button>
            <Button size="sm" className="flex-1" onClick={handleSaveSidebar}>
              保存
            </Button>
          </div>
        </motion.div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await deleteIdea(deleteId);
            setDeleteId(null);
            setSidebarOpen(false);
          }
        }}
        title="删除节点"
        message="确认删除这个脑暴节点？子节点也会被删除。"
        confirmLabel="删除"
        variant="danger"
      />
    </div>
  );
}

export default function BrainstormPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useProject(projectId);

  if (!projectId) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          icon={<Lightbulb size={48} />}
          title="未选择项目"
          description="请先在仪表盘选择一个项目"
        />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <BrainstormCanvas projectId={projectId} />
    </ReactFlowProvider>
  );
}
