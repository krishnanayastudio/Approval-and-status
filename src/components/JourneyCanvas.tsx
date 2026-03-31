import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Image, FileText, Palette, Box, PenTool,
  MoreHorizontal, ChevronUp, ChevronDown, Heart, RefreshCw, Share2, MessageCircle,
} from 'lucide-react';
import type { JourneyItem, Block, BlockGroup } from '../types';
import { BlockToolbar } from './BlockToolbar';
import { ApprovalChip } from './ApprovalChip';

interface JourneyCanvasProps {
  items: JourneyItem[];
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  currentUserId: number;
}

const blockTypeIcons: Record<string, React.ReactNode> = {
  sketch: <PenTool size={14} />,
  board: <Palette size={14} />,
  doc: <FileText size={14} />,
  cad: <Box size={14} />,
  image: <Image size={14} />,
};

const thumbnailGradients: Record<string, string> = {
  sketch: 'from-purple-50 via-purple-100 to-purple-50',
  board: 'from-red-50 via-orange-50 to-red-50',
  doc: 'from-gray-50 via-gray-25 to-gray-75',
  cad: 'from-green-50 via-cyan-50 to-green-100',
  image: 'from-orange-50 via-yellow-50 to-orange-100',
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'to-do': { label: 'To Do', color: '#A0A0A0' },
  'in-progress': { label: 'In Progress', color: '#2563EB' },
  'on-hold': { label: 'On Hold', color: '#DC2626' },
  'done': { label: 'Done', color: '#4F00C1' },
};

function StatusIcon({ id, color, size = 14 }: { id: string; color: string; size?: number }) {
  if (id === 'to-do') return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.6" strokeDasharray="2.6 2.2" strokeLinecap="round" />
    </svg>
  );
  if (id === 'in-progress') return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.6" opacity="0.2" />
      <path d="M7 1.5 A5.5 5.5 0 1 1 2.2 10.3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
  if (id === 'on-hold') return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.6" />
      <line x1="4.2" y1="7" x2="9.8" y2="7" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
  if (id === 'done') return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="6.5" fill={color} />
      <path d="M4.5 7L6.2 8.8L9.5 5.2" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return null;
}

function CardIconButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-[36px] h-[36px] rounded-full bg-white shadow-[0px_2px_6px_rgba(0,0,0,0.08),0px_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-center shrink-0 ${className}`}>
      {children}
    </div>
  );
}

function BlockCard({ block, showToolbar, onToggleToolbar, onUpdate, currentUserId }: { block: Block; showToolbar: boolean; onToggleToolbar: () => void; onUpdate: (blockId: string, updates: Partial<Block>) => void; currentUserId: number }) {
  const approvalRequestExists = block.approval?.status === 'pending' || block.approval?.status === 'approved';
  const [activityTrigger, setActivityTrigger] = useState(0);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [statusContextMenu, setStatusContextMenu] = useState<{ x: number; y: number } | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const statusContextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (statusContextRef.current && !statusContextRef.current.contains(e.target as Node)) {
        setStatusContextMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleRequestChange = (exists: boolean) => {
    onUpdate(block.id, {
      approval: exists
        ? { status: 'pending', assignees: block.approval?.assignees || [] }
        : { status: 'none', assignees: [] },
    });
  };
  const grad = thumbnailGradients[block.type] || 'from-gray-50 to-gray-150';

  return (
    <div className="relative shrink-0">
    <div
      className={`relative w-[288px] h-[230px] rounded-3xl border bg-white transition-all cursor-pointer
        ${showToolbar
          ? 'border-purple-700 ring-2 ring-purple-700/20 shadow-lg'
          : 'border-gray-100 shadow-[0px_1px_2px_rgba(0,0,0,0.07),0px_2px_6px_rgba(0,0,0,0.04)] hover:shadow-lg'
        }
      `}
    >
      {/* Color strip */}
      {block.color && (
        <div className="absolute top-0 left-0 right-0 h-1 z-10 rounded-t-3xl" style={{ backgroundColor: block.color }} />
      )}

      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${grad} flex items-center justify-center rounded-3xl overflow-hidden`}>
        <div className="text-gray-400/20 scale-[5]">
          {blockTypeIcons[block.type]}
        </div>
      </div>

      {/* Top row: name chip + action icons */}
      <div className="absolute top-[10px] left-[10px] right-[10px] flex items-center gap-1.5">
        {/* Name chip */}
        <div className="flex items-center bg-white rounded-full shadow-[0px_2px_6px_rgba(0,0,0,0.08),0px_1px_3px_rgba(0,0,0,0.06)] overflow-hidden shrink min-w-0">
          <div className="w-[36px] h-[36px] flex items-center justify-center text-gray-700 shrink-0">
            {blockTypeIcons[block.type]}
          </div>
          <span className="text-xs font-semibold text-gray-900 pr-3 whitespace-nowrap truncate">{block.name}</span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {/* Sync icon */}
          <CardIconButton>
            <RefreshCw size={15} className="text-gray-800" strokeWidth={2.5} />
          </CardIconButton>

          {/* Heart / Favorite */}
          <CardIconButton>
            {block.favorite ? (
              <Heart size={16} className="text-red-500 fill-red-500" />
            ) : (
              <Heart size={16} className="text-gray-300" />
            )}
          </CardIconButton>

          {/* Chevron up */}
          <CardIconButton>
            <ChevronUp size={16} className="text-gray-800" strokeWidth={2.5} />
          </CardIconButton>
        </div>
      </div>

      {/* Approval chip (below top bar) */}
      <div className="absolute top-[52px] left-[8px] right-[8px] z-20">
        <ApprovalChip currentUserId={currentUserId} requestExists={approvalRequestExists} onRequestChange={handleRequestChange} openActivityTrigger={activityTrigger} />
      </div>

      {/* Middle-left: assignee pill + status chip */}
      {(block.assignee || block.status) && (
        <div className={`absolute left-[10px] flex items-center gap-1.5 ${approvalRequestExists ? 'top-[55%] -translate-y-1/2' : 'top-[52px]'}`}>
          {block.assignee && (
            <div className="flex items-center bg-white rounded-full shadow-[0px_2px_6px_rgba(0,0,0,0.08),0px_1px_3px_rgba(0,0,0,0.06)] pl-1 pr-1.5 h-[36px] gap-0.5">
              <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-purple-300 to-purple-500 flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{block.assignee.initials}</span>
              </div>
              <ChevronDown size={12} className="text-gray-400" />
            </div>
          )}
          {block.status && STATUS_CONFIG[block.status] && (
            <div className="relative" ref={statusDropdownRef}>
              <div
                className="flex items-center bg-white rounded-full shadow-[0px_2px_6px_rgba(0,0,0,0.08),0px_1px_3px_rgba(0,0,0,0.06)] px-3 h-[36px] gap-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={(e) => { e.stopPropagation(); setShowStatusDropdown(prev => !prev); }}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setShowStatusDropdown(false); setStatusContextMenu({ x: e.clientX, y: e.clientY }); }}
              >
                <StatusIcon id={block.status} color={STATUS_CONFIG[block.status].color} size={15} />
                <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">{STATUS_CONFIG[block.status].label}</span>
                <ChevronDown size={12} className="text-gray-400" />
              </div>
              {showStatusDropdown && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-100 rounded-2xl shadow-lg py-1.5 z-50 w-[180px]" onClick={(e) => e.stopPropagation()}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-1.5">Set Status</p>
                  {Object.entries(STATUS_CONFIG).map(([id, config]) => (
                    <button
                      key={id}
                      onClick={() => { onUpdate(block.id, { status: id as Block['status'] }); setShowStatusDropdown(false); }}
                      className={`flex items-center gap-2.5 w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${block.status === id ? 'bg-gray-50' : ''}`}
                    >
                      <StatusIcon id={id} color={config.color} />
                      <span className="text-gray-900 font-medium">{config.label}</span>
                      {block.status === id && <span className="ml-auto text-xs text-gray-400">&#10003;</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom row: date range + action icons */}
      <div className="absolute bottom-[10px] left-[10px] right-[10px] flex items-center gap-1.5">
        {/* Date range pill */}
        {block.dateRange && (
          <div className="flex items-center bg-white rounded-full shadow-[0px_2px_6px_rgba(0,0,0,0.08),0px_1px_3px_rgba(0,0,0,0.06)] px-3.5 h-[36px]">
            <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">
              {block.dateRange.start} - {block.dateRange.end}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {/* Metadata trigger (stamp/seal icon) */}
          <div onClick={(e) => { e.stopPropagation(); onToggleToolbar(); }} className="cursor-pointer">
            <CardIconButton>
              <svg width="16" height="16" viewBox="12 10 24 24" fill="none">
                <path d="M17.5833 33.1248H30.4167M17.0859 24.3626L21.0763 23.7925C21.081 23.7918 21.0857 23.7915 21.0904 23.7915H26.9096C26.9143 23.7915 26.919 23.7918 26.9237 23.7925L30.9141 24.3626C30.9634 24.3696 31 24.4118 31 24.4616V28.9415C31 28.9967 30.9552 29.0415 30.9 29.0415H17.1C17.0448 29.0415 17 28.9967 17 28.9415V24.4616C17 24.4118 17.0366 24.3696 17.0859 24.3626Z" stroke="#393939" strokeWidth="1.5"/>
                <path d="M21 24L21.6549 20.1525C21.6619 20.1113 21.6425 20.0702 21.6066 20.0487C20.2449 19.2337 19.3333 17.7441 19.3333 16.0417C19.3333 13.4643 21.4226 11.375 23.9999 11.375C26.5772 11.375 28.6666 13.4643 28.6666 16.0417C28.6666 17.7441 27.7549 19.2337 26.3932 20.0487C26.3573 20.0702 26.3379 20.1113 26.3449 20.1526L27 24" stroke="#393939" strokeWidth="1.5"/>
              </svg>
            </CardIconButton>
          </div>

          {/* Share icon */}
          <CardIconButton>
            <Share2 size={15} className="text-gray-800" strokeWidth={2} />
          </CardIconButton>

          {/* Comments icon with badge */}
          <div className="relative">
            <CardIconButton>
              <MessageCircle size={15} className="text-gray-800" strokeWidth={2} />
            </CardIconButton>
            <div className="absolute -top-1 -right-1 w-[16px] h-[16px] rounded-full bg-gray-800 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">1</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Toolbar — absolutely positioned below the card */}
    {showToolbar && (
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50" onClick={(e) => e.stopPropagation()}>
        <BlockToolbar block={block} onUpdate={onUpdate} onOpenActivity={() => setActivityTrigger(n => n + 1)} />
      </div>
    )}

    {/* Status right-click context menu */}
    {statusContextMenu && (
      <div
        ref={statusContextRef}
        className="fixed bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px] z-[999]"
        style={{ top: statusContextMenu.y, left: statusContextMenu.x }}
      >
        <button
          onClick={() => { onUpdate(block.id, { status: undefined }); setStatusContextMenu(null); }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 2L11 11M11 2L2 11" stroke="#DC2626" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <span className="font-medium">Remove status</span>
        </button>
      </div>
    )}
    </div>
  );
}

function BlockGroupCard({
  group,
  toolbarBlockId,
  onToggleToolbar,
  onUpdateBlock,
  currentUserId,
}: {
  group: BlockGroup;
  toolbarBlockId: string | null;
  onToggleToolbar: (blockId: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  currentUserId: number;
}) {
  const [collapsed, setCollapsed] = useState(group.collapsed ?? false);

  return (
    <div className="bg-gray-50 rounded-3xl overflow-visible shrink-0 w-[304px]">
      <div className="flex items-center justify-between px-2 pt-2 pb-0">
        <button className="flex items-center h-8 px-2 rounded-lg hover:bg-white/60 transition-colors">
          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{group.name}</span>
        </button>
        <div className="flex items-center gap-0.5 pr-1">
          <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/60 transition-colors">
            <MoreHorizontal size={14} className="text-gray-700" />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/60 transition-colors"
          >
            <ChevronUp size={14} className={`text-gray-700 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="flex flex-col items-center gap-2 p-2">
          {group.blocks.map((block, i) => {
            const showToolbar = block.id === toolbarBlockId;
            return (
              <div key={block.id} className="flex flex-col items-center gap-2 relative">
                <BlockCard block={block} showToolbar={showToolbar} onToggleToolbar={() => onToggleToolbar(block.id)} onUpdate={onUpdateBlock} currentUserId={currentUserId} />
                {i < group.blocks.length - 1 && (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ItemDot() {
  return <div className="w-2 h-2 rounded-full bg-gray-300 shrink-0 self-center" />;
}

export function JourneyCanvas({ items, onUpdateBlock, onReorder, currentUserId }: JourneyCanvasProps) {
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [toolbarBlockId, setToolbarBlockId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleToggleToolbar = useCallback((blockId: string) => {
    setToolbarBlockId(prev => prev === blockId ? null : blockId);
  }, []);

  // Close toolbar when clicking canvas background
  const handleCanvasClick = useCallback(() => {
    setToolbarBlockId(null);
  }, []);

  return (
    <div ref={canvasRef} className="flex-1 overflow-x-auto overflow-y-auto" onClick={handleCanvasClick}>
      <div className="flex items-center gap-2 p-8 min-w-max">
        {items.map((item, i) => (
          <div
            key={item.kind === 'block' ? item.block.id : item.group.id}
            className={`flex items-center gap-2 transition-all ${dragOverIdx === i ? 'scale-[1.03]' : ''}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(i));
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setDragOverIdx(i);
            }}
            onDragLeave={() => setDragOverIdx(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverIdx(null);
              const fromIndex = Number(e.dataTransfer.getData('text/plain'));
              if (fromIndex !== i) onReorder(fromIndex, i);
            }}
          >
            {item.kind === 'block' && (
              <BlockCard
                block={item.block}
                showToolbar={item.block.id === toolbarBlockId}
                onToggleToolbar={() => handleToggleToolbar(item.block.id)}
                onUpdate={onUpdateBlock}
                currentUserId={currentUserId}
              />
            )}
            {item.kind === 'group' && (
              <BlockGroupCard
                group={item.group}
                toolbarBlockId={toolbarBlockId}
                onToggleToolbar={handleToggleToolbar}
                onUpdateBlock={onUpdateBlock}
                currentUserId={currentUserId}
              />
            )}
            {i < items.length - 1 && <ItemDot />}
          </div>
        ))}
      </div>
    </div>
  );
}
