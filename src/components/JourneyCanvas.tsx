import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Image, FileText, Palette, Box, PenTool,
  MoreHorizontal, ChevronUp, Heart, Calendar, User,
} from 'lucide-react';
import type { JourneyItem, Block, BlockGroup } from '../types';
import { BlockToolbar } from './BlockToolbar';

interface JourneyCanvasProps {
  items: JourneyItem[];
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
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

function BlockCard({ block, isSelected, onSelect }: { block: Block; isSelected: boolean; onSelect: () => void }) {
  const grad = thumbnailGradients[block.type] || 'from-gray-50 to-gray-150';

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={`relative w-[288px] h-[230px] rounded-3xl border overflow-hidden bg-white shrink-0 transition-all cursor-pointer
        ${isSelected
          ? 'border-purple-700 ring-2 ring-purple-700/20 shadow-lg'
          : 'border-gray-100 shadow-[0px_1px_2px_rgba(0,0,0,0.07),0px_2px_6px_rgba(0,0,0,0.04)] hover:shadow-lg'
        }
      `}
    >
      {/* Color strip */}
      {block.color && (
        <div className="absolute top-0 left-0 right-0 h-1 z-10" style={{ backgroundColor: block.color }} />
      )}

      <div className={`absolute inset-0 bg-gradient-to-br ${grad} flex items-center justify-center`}>
        <div className="text-gray-400/20 scale-[5]">
          {blockTypeIcons[block.type]}
        </div>
      </div>

      {/* Block info chip */}
      <div className="absolute top-[9px] left-[10px] flex items-center bg-white rounded-lg shadow-[0px_4px_8px_3px_rgba(0,0,0,0.04),0px_1px_3px_rgba(0,0,0,0.07)] overflow-hidden">
        <div className="w-8 h-8 flex items-center justify-center text-gray-700 shrink-0">
          {blockTypeIcons[block.type]}
        </div>
        <span className="text-xs font-medium text-gray-900 pr-3 whitespace-nowrap">{block.name}</span>
      </div>

      {/* Collapse button (top right) */}
      <div className="absolute top-[9px] right-[10px] flex items-center gap-1">
        {block.favorite && (
          <Heart size={14} className="text-red-500 fill-red-500" />
        )}
      </div>

      {/* Completed badge */}
      {block.completed && (
        <div className="absolute top-[9px] right-[10px] w-5 h-5 rounded bg-purple-700 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Bottom metadata row */}
      {(block.dateRange || block.assignee) && (
        <div className="absolute bottom-[10px] left-[10px] right-[10px]">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-[0px_1px_3px_rgba(0,0,0,0.1)] px-2.5 py-1.5">
            {block.dateRange && (
              <div className="flex items-center gap-1">
                <Calendar size={11} className="text-gray-400" />
                <span className="text-[10px] font-medium text-gray-600 whitespace-nowrap">
                  {block.dateRange.start} - {block.dateRange.end}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto">
              {block.assignee && (
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 border-2 border-white flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">{block.assignee.initials}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BlockGroupCard({
  group,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
}: {
  group: BlockGroup;
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
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
            const isSelected = block.id === selectedBlockId;
            return (
              <div key={block.id} className="flex flex-col items-center gap-2 relative">
                <BlockCard block={block} isSelected={isSelected} onSelect={() => onSelectBlock(isSelected ? null : block.id)} />
                {isSelected && (
                  <div className="z-50">
                    <BlockToolbar block={block} onUpdate={onUpdateBlock} />
                  </div>
                )}
                {i < group.blocks.length - 1 && !isSelected && (
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

export function JourneyCanvas({ items, selectedBlockId, onSelectBlock, onUpdateBlock, onReorder }: JourneyCanvasProps) {
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Deselect when clicking canvas background
  const handleCanvasClick = useCallback(() => {
    onSelectBlock(null);
  }, [onSelectBlock]);

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
            {item.kind === 'block' && (() => {
              const isSelected = item.block.id === selectedBlockId;
              return (
                <div className="flex flex-col items-center gap-2 relative">
                  <BlockCard
                    block={item.block}
                    isSelected={isSelected}
                    onSelect={() => onSelectBlock(isSelected ? null : item.block.id)}
                  />
                  {isSelected && (
                    <div className="z-50">
                      <BlockToolbar block={item.block} onUpdate={onUpdateBlock} />
                    </div>
                  )}
                </div>
              );
            })()}
            {item.kind === 'group' && (
              <BlockGroupCard
                group={item.group}
                selectedBlockId={selectedBlockId}
                onSelectBlock={onSelectBlock}
                onUpdateBlock={onUpdateBlock}
              />
            )}
            {i < items.length - 1 && <ItemDot />}
          </div>
        ))}
      </div>
    </div>
  );
}
