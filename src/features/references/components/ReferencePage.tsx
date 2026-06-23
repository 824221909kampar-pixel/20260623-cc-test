import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Upload,
  Link,
  Image,
  Video,
  File,
  Music,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  FolderOpen,
  LayoutGrid,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useReferenceItems,
  useReferenceBoards,
  createReferenceItem,
  createBoard,
  deleteReferenceItem,
} from '../../../hooks/useReferences';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Tabs } from '../../../components/ui/tabs';
import { Modal } from '../../../components/ui/modal';
import { EmptyState } from '../../../components/ui/empty-state';
import { SearchInput } from '../../../components/common/SearchInput';
import { cn, formatDate, generateThumbnail } from '../../../lib/utils';
import type { ReferenceItem, ReferenceType } from '../../../types/reference';
import { REFERENCE_TYPE_LABELS } from '../../../types/reference';

const REF_TYPES: ReferenceType[] = ['image', 'video', 'link', 'audio', 'file'];

const TYPE_ICONS: Record<ReferenceType, React.FC<{ size?: number; className?: string }>> = {
  image: Image,
  video: Video,
  link: Link,
  audio: Music,
  file: File,
};

function ReferenceCard({
  item,
  onDelete,
}: {
  item: ReferenceItem;
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const TypeIcon = TYPE_ICONS[item.type];

  return (
    <Card className="group cursor-pointer hover:border-border-accent transition-all duration-200 overflow-hidden">
      <div className="h-36 bg-bg-tertiary flex items-center justify-center relative overflow-hidden">
        {item.thumbnailUrl || item.dataUrl ? (
          <img
            src={item.thumbnailUrl || item.dataUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <TypeIcon size={36} className="text-text-disabled" />
        )}
        {item.type === 'video' && item.thumbnailUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Video size={18} className="text-white" />
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1 rounded bg-black/50 text-white hover:bg-black/70"
            >
              <MoreHorizontal size={14} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-7 z-20 bg-bg-elevated border border-border-primary rounded-lg py-1 shadow-xl min-w-[100px]">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-error hover:bg-error/10 flex items-center gap-2"
                  >
                    <Trash2 size={12} /> 删除
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <Badge variant="default" size="sm" className="absolute bottom-2 left-2 bg-bg-elevated/90 text-text-primary border border-border-primary text-[10px]">
          {REFERENCE_TYPE_LABELS[item.type]}
        </Badge>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-medium text-text-primary truncate">{item.title}</h4>
        <p className="text-xs text-text-tertiary mt-0.5 line-clamp-1">{item.description || '无描述'}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-text-disabled">{formatDate(item.createdAt)}</span>
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:text-accent-secondary">
              <ExternalLink size={12} />
            </a>
          )}
        </div>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 3).map(t => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-tertiary">{t}</span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function ReferencePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const items = useReferenceItems(projectId!);
  const boards = useReferenceBoards(projectId!);
  const [, setActiveTab] = useState('materials');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReferenceType | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);

  // Filter
  const filteredItems = items.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (search && !item.title.includes(search) && !item.description.includes(search)) return false;
    return true;
  });

  const handleAddLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const url = form.get('url') as string;
    const title = form.get('title') as string;
    if (!url || !title) return;
    await createReferenceItem({
      projectId: projectId!,
      type: 'link',
      title,
      description: form.get('description') as string || '',
      url,
      tags: [],
      annotations: [],
    });
    setShowAddModal(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        let thumbnailUrl: string | undefined;
        if (file.type.startsWith('image/')) {
          try { thumbnailUrl = await generateThumbnail(dataUrl); } catch {}
        }
        await createReferenceItem({
          projectId: projectId!,
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file',
          title: file.name,
          description: '',
          dataUrl,
          thumbnailUrl,
          url: undefined,
          tags: [],
          annotations: [],
        });
      };
      reader.readAsDataURL(file);
    }
    setShowAddModal(false);
  };

  const handleCreateBoard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = form.get('title') as string;
    if (!title) return;
    const board = await createBoard({
      projectId: projectId!,
      title,
      description: form.get('description') as string || '',
      backgroundColor: '#12121a',
    });
    setShowBoardModal(false);
    navigate(`/references/${projectId}/board/${board.id}`);
  };

  if (!projectId) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState icon={<FolderOpen size={48} />} title="未选择项目" description="请先在仪表盘选择一个项目" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">参考搜集</h1>
          <p className="text-sm text-text-tertiary mt-1">收集和管理视觉参考素材</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowBoardModal(true)} icon={LayoutGrid}>
            新建情绪版
          </Button>
          <Button onClick={() => setShowAddModal(true)} icon={Plus}>
            添加素材
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="materials" onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="materials">素材库 ({items.length})</Tabs.Tab>
          <Tabs.Tab value="boards">情绪版 ({boards.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panels>
          <Tabs.Panel value="materials">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-4 mt-2">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="搜索素材..."
                className="w-64"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs transition-colors',
                    typeFilter === 'all' ? 'bg-accent-primary text-white' : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                  )}
                >
                  全部
                </button>
                {REF_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs transition-colors',
                      typeFilter === t ? 'bg-accent-primary text-white' : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {REFERENCE_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {items.length === 0 ? (
              <EmptyState icon={<Image size={48} />} title="还没有素材" description="添加图片、视频、链接作为创作参考" action={{ label: '添加素材', onClick: () => setShowAddModal(true) }} />
            ) : filteredItems.length === 0 ? (
              <EmptyState icon={<Image size={48} />} title="筛选无结果" description="尝试调整搜索或筛选条件" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <ReferenceCard item={item} onDelete={(id: string) => deleteReferenceItem(id)} />
                  </motion.div>
                ))}
              </div>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="boards">
            {boards.length === 0 ? (
              <EmptyState icon={<LayoutGrid size={48} />} title="还没有情绪版" description="创建情绪版来组织你的视觉参考" action={{ label: '新建情绪版', onClick: () => setShowBoardModal(true) }} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {boards.map((board, i) => (
                  <motion.div key={board.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card
                      className="cursor-pointer hover:border-border-accent transition-all group"
                      onClick={() => navigate(`/references/${projectId}/board/${board.id}`)}
                    >
                      <div
                        className="h-40 rounded-t-xl flex items-center justify-center"
                        style={{ backgroundColor: board.backgroundColor }}
                      >
                        <LayoutGrid size={40} className="text-text-disabled group-hover:text-text-tertiary transition-colors" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-text-primary">{board.title}</h3>
                        <p className="text-xs text-text-tertiary mt-1">{board.description || '无描述'} · {board.items.length} 个素材</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </Tabs.Panel>
        </Tabs.Panels>
      </Tabs>

      {/* Add Material Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="添加素材" size="md">
        <Tabs defaultValue="upload">
          <Tabs.List>
            <Tabs.Tab value="upload">上传文件</Tabs.Tab>
            <Tabs.Tab value="link">添加链接</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panels>
            <Tabs.Panel value="upload">
              <label className="mt-4 block border-2 border-dashed border-border-accent rounded-xl p-12 text-center cursor-pointer hover:border-accent-primary transition-colors">
                <Upload size={40} className="text-text-disabled mx-auto mb-3" />
                <p className="text-sm text-text-secondary">拖拽文件到此处或点击上传</p>
                <p className="text-xs text-text-disabled mt-1">支持图片、视频、音频文件</p>
                <input type="file" className="hidden" multiple accept="image/*,video/*,audio/*" onChange={handleFileUpload} />
              </label>
            </Tabs.Panel>
            <Tabs.Panel value="link">
              <form onSubmit={handleAddLink} className="mt-4 space-y-4">
                <Input name="url" label="URL 地址" placeholder="https://..." required />
                <Input name="title" label="标题" placeholder="给这个参考起个名字" required />
                <Textarea name="description" label="描述（可选）" placeholder="简短的描述..." />
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>取消</Button>
                  <Button type="submit">添加</Button>
                </div>
              </form>
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      </Modal>

      {/* New Board Modal */}
      <Modal open={showBoardModal} onClose={() => setShowBoardModal(false)} title="新建情绪版" size="sm">
        <form onSubmit={handleCreateBoard} className="space-y-4">
          <Input name="title" label="版名" placeholder="例如：色彩参考、构图参考" required autoFocus />
          <Textarea name="description" label="描述" placeholder="这个情绪版的用途..." />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowBoardModal(false)}>取消</Button>
            <Button type="submit">创建</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
