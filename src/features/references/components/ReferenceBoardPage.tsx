import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
  Move,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useReferenceBoard,
  useReferenceItems,
  addItemToBoard,
  removeItemFromBoard,
  updateReferenceItem,
  updateBoard,
} from '../../../hooks/useReferences';
import { useEditorStore } from '../../../stores/useEditorStore';
import { Button } from '../../../components/ui/button';
import { Modal } from '../../../components/ui/modal';
import { EmptyState } from '../../../components/ui/empty-state';
import { Spinner } from '../../../components/ui/spinner';
import { cn } from '../../../lib/utils';
import type { ReferenceItem } from '../../../types/reference';

interface BoardItemPosition {
  item: ReferenceItem;
  x: number;
  y: number;
}

export default function ReferenceBoardPage() {
  const { projectId, boardId } = useParams<{ projectId: string; boardId: string }>();
  const navigate = useNavigate();
  const board = useReferenceBoard(boardId!);
  const allItems = useReferenceItems(projectId!);
  const { setActiveBoard } = useEditorStore();

  const [boardItems, setBoardItems] = useState<BoardItemPosition[]>([]);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [selectedItem, setSelectedItem] = useState<BoardItemPosition | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (board && allItems.length > 0) {
      const boardItemIds = board.items;
      const filtered = allItems.filter((item) => boardItemIds.includes(item.id));
      const positions = filtered.map((item, i) => ({
        item,
        x: item.position?.x ?? (i % 4) * 240 + 40,
        y: item.position?.y ?? Math.floor(i / 4) * 200 + 40,
      }));
      setBoardItems(positions);
    }
  }, [board, allItems]);

  useEffect(() => {
    if (boardId) setActiveBoard(boardId);
    return () => setActiveBoard(null);
  }, [boardId, setActiveBoard]);

  const handleDragStart = useCallback((e: React.MouseEvent, id: string, x: number, y: number) => {
    e.preventDefault();
    setDragging({ id, startX: e.clientX, startY: e.clientY, origX: x, origY: y });
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - dragging.startX;
      const dy = e.clientY - dragging.startY;
      setBoardItems((prev) =>
        prev.map((bi) =>
          bi.item.id === dragging.id
            ? { ...bi, x: dragging.origX + dx, y: dragging.origY + dy }
            : bi
        )
      );
    };
    const handleUp = async () => {
      if (dragging) {
        const item = boardItems.find((bi) => bi.item.id === dragging.id);
        if (item) {
          await updateReferenceItem(item.item.id, {
            position: { x: item.x, y: item.y },
          });
        }
      }
      setDragging(null);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, boardItems]);

  const handleAddToBoard = async (itemId: string) => {
    await addItemToBoard(boardId!, itemId);
    const item = allItems.find((i) => i.id === itemId);
    if (item) {
      setBoardItems((prev) => [
        ...prev,
        { item, x: Math.random() * 300 + 40, y: Math.random() * 200 + 40 },
      ]);
    }
  };

  const handleRemoveFromBoard = async (itemId: string) => {
    await removeItemFromBoard(boardId!, itemId);
    setBoardItems((prev) => prev.filter((bi) => bi.item.id !== itemId));
    if (selectedItem?.item.id === itemId) setSelectedItem(null);
  };

  const itemsNotOnBoard = allItems.filter(
    (item) => !boardItems.find((bi) => bi.item.id === item.id)
  );

  if (!board) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 border-b border-border-primary bg-bg-secondary flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/references/${projectId}`)}
            className="p-1 rounded hover:bg-bg-hover text-text-tertiary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          {editingTitle ? (
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={async () => {
                if (titleDraft.trim() && titleDraft !== board.title) {
                  await updateBoard(board.id, { title: titleDraft });
                }
                setEditingTitle(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              className="bg-bg-tertiary border border-border-accent rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              autoFocus
            />
          ) : (
            <h2
              className="text-sm font-semibold text-text-primary cursor-pointer hover:text-accent-primary transition-colors"
              onClick={() => { setTitleDraft(board.title); setEditingTitle(true); }}
            >
              {board.title}
            </h2>
          )}
          <span className="text-xs text-text-disabled">{boardItems.length} 个素材</span>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)} icon={Plus}>
          添加素材
        </Button>
      </div>

      {/* Canvas */}
      <div ref={canvasRef} className="flex-1 relative overflow-auto bg-bg-primary" style={{ backgroundColor: board.backgroundColor }}>
        {boardItems.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <EmptyState
              icon={<ImageIcon size={48} />}
              title="空白情绪版"
              description="点击右上角「添加素材」开始"
              action={{ label: '添加素材', onClick: () => setShowAddModal(true) }}
            />
          </div>
        ) : (
          boardItems.map((bi) => (
            <motion.div
              key={bi.item.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                'absolute cursor-move group rounded-lg overflow-hidden shadow-lg border-2 transition-colors',
                selectedItem?.item.id === bi.item.id
                  ? 'border-accent-primary'
                  : 'border-transparent hover:border-border-accent'
              )}
              style={{ left: bi.x, top: bi.y, width: 220 }}
              onMouseDown={(e) => handleDragStart(e, bi.item.id, bi.x, bi.y)}
              onClick={() => setSelectedItem(bi)}
            >
              {bi.item.thumbnailUrl || bi.item.dataUrl ? (
                <img src={bi.item.thumbnailUrl || bi.item.dataUrl} alt={bi.item.title} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-bg-tertiary flex items-center justify-center">
                  <ImageIcon size={32} className="text-text-disabled" />
                </div>
              )}
              <div className="bg-bg-elevated p-2 flex items-center justify-between">
                <span className="text-xs text-text-primary truncate flex-1">{bi.item.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveFromBoard(bi.item.id); }}
                  className="p-0.5 rounded hover:bg-error/10 text-text-disabled hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
              {/* Drag handle */}
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-0.5">
                <Move size={12} className="text-white" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Selected item detail */}
      {selectedItem && (
        <motion.div
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          exit={{ x: 320 }}
          className="fixed right-0 top-0 bottom-0 w-80 bg-bg-elevated border-l border-border-primary shadow-2xl z-40 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-border-primary">
            <h3 className="text-sm font-semibold text-text-primary">素材详情</h3>
            <button onClick={() => setSelectedItem(null)} className="p-1 rounded hover:bg-bg-hover text-text-tertiary">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedItem.item.thumbnailUrl || selectedItem.item.dataUrl ? (
              <img
                src={selectedItem.item.dataUrl || selectedItem.item.thumbnailUrl}
                alt={selectedItem.item.title}
                className="w-full rounded-lg"
              />
            ) : (
              <div className="w-full h-40 bg-bg-tertiary rounded-lg flex items-center justify-center">
                <ImageIcon size={48} className="text-text-disabled" />
              </div>
            )}
            <h3 className="font-semibold text-text-primary">{selectedItem.item.title}</h3>
            <p className="text-sm text-text-secondary">{selectedItem.item.description || '无描述'}</p>
            {selectedItem.item.url && (
              <a href={selectedItem.item.url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-accent-primary hover:text-accent-secondary break-all block">
                {selectedItem.item.url}
              </a>
            )}
            {selectedItem.item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedItem.item.tags.map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary">{t}</span>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-border-primary">
            <Button
              variant="danger"
              size="sm"
              className="w-full"
              onClick={() => {
                handleRemoveFromBoard(selectedItem.item.id);
                setSelectedItem(null);
              }}
              icon={Trash2}
            >
              从情绪版移除
            </Button>
          </div>
        </motion.div>
      )}

      {/* Add Items Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="添加素材到情绪版" size="lg">
        {itemsNotOnBoard.length === 0 ? (
          <div className="py-8 text-center text-text-tertiary text-sm">所有素材已添加到情绪版</div>
        ) : (
          <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto mt-4">
            {itemsNotOnBoard.map((item) => (
              <div
                key={item.id}
                onClick={() => handleAddToBoard(item.id)}
                className="cursor-pointer rounded-lg border border-border-primary hover:border-accent-primary p-2 transition-colors"
              >
                <div className="h-20 bg-bg-tertiary rounded flex items-center justify-center mb-2">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover rounded" />
                  ) : (
                    <ImageIcon size={24} className="text-text-disabled" />
                  )}
                </div>
                <p className="text-xs text-text-primary truncate">{item.title}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
