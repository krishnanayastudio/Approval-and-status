import { useState, useRef, useEffect } from 'react';
import {
  Heart, Image, Calendar, ChevronDown, Check, X, User,
} from 'lucide-react';
import type { Block } from '../types';

interface BlockToolbarProps {
  block: Block;
  onUpdate: (blockId: string, updates: Partial<Block>) => void;
}

const PRESET_COLORS = [
  '#4F00C1', '#E34033', '#FFA35E', '#F9DB60', '#9ED36D',
  '#02CBEF', '#FF6B9D', '#393939',
];

export function BlockToolbar({ block, onUpdate }: BlockToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAssignee, setShowAssignee] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);

  // Close popups on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setShowColorPicker(false);
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDatePicker(false);
      if (assigneeRef.current && !assigneeRef.current.contains(e.target as Node)) setShowAssignee(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const mockAssignees = [
    { name: 'Sarah K.', initials: 'SK' },
    { name: 'James L.', initials: 'JL' },
    { name: 'Alex M.', initials: 'AM' },
    { name: 'Priya S.', initials: 'PS' },
  ];

  return (
    <div
      className="flex items-center gap-1 h-[56px] pl-3 pr-2 py-2 bg-white border border-gray-150 rounded-full shadow-[0px_4px_8px_rgba(0,0,0,0.04),0px_1px_3px_rgba(0,0,0,0.07)]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Color */}
      <div className="relative" ref={colorRef}>
        <button
          onClick={() => { setShowColorPicker(!showColorPicker); setShowDatePicker(false); setShowAssignee(false); }}
          className="w-10 h-10 flex items-center justify-center rounded-3xl hover:bg-gray-50 transition-colors"
          title="Color"
        >
          {block.color ? (
            <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: block.color }} />
          ) : (
            <div className="w-5 h-5 rounded-full" style={{
              background: 'conic-gradient(#E34033, #FFA35E, #F9DB60, #9ED36D, #02CBEF, #4F00C1, #FF6B9D, #E34033)',
            }} />
          )}
        </button>
        {showColorPicker && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-2xl shadow-lg p-3 z-50">
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => { onUpdate(block.id, { color: c }); setShowColorPicker(false); }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${block.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            {block.color && (
              <button
                onClick={() => { onUpdate(block.id, { color: undefined }); setShowColorPicker(false); }}
                className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Remove color
              </button>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail */}
      <button
        className="w-10 h-10 flex items-center justify-center rounded-3xl hover:bg-gray-50 transition-colors"
        title="Thumbnail"
      >
        <Image size={18} className="text-gray-700" />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-150 mx-0.5" />

      {/* Favorite */}
      <button
        onClick={() => onUpdate(block.id, { favorite: !block.favorite })}
        className="w-10 h-10 flex items-center justify-center rounded-3xl hover:bg-gray-50 transition-colors"
        title="Favorite"
      >
        <Heart
          size={18}
          className={block.favorite ? 'text-red-500 fill-red-500' : 'text-gray-700'}
        />
      </button>

      {/* Notes */}
      <button
        className="w-10 h-10 flex items-center justify-center rounded-3xl hover:bg-gray-50 transition-colors"
        title="Notes"
      >
        <div className="relative">
          <div className="w-4 h-4 rounded-sm bg-yellow-400 absolute -left-0.5 -top-0.5" />
          <div className="w-4 h-4 rounded-sm bg-green-300 relative shadow-sm" />
        </div>
      </button>

      {/* Date */}
      <div className="relative" ref={dateRef}>
        <button
          onClick={() => { setShowDatePicker(!showDatePicker); setShowColorPicker(false); setShowAssignee(false); }}
          className={`h-10 flex items-center justify-center rounded-3xl hover:bg-gray-50 transition-colors ${block.dateRange ? 'px-2' : 'w-10'}`}
          title="Date"
        >
          {block.dateRange ? (
            <span className="text-xs font-medium text-gray-900 whitespace-nowrap">
              {block.dateRange.start}
            </span>
          ) : (
            <Calendar size={18} className="text-gray-700" />
          )}
        </button>
        {showDatePicker && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-2xl shadow-lg p-3 z-50 w-[200px]">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Date range</p>
            <DateInput
              label="Start"
              value={block.dateRange?.start || ''}
              onChange={(v) => onUpdate(block.id, {
                dateRange: { start: v, end: block.dateRange?.end || v },
              })}
            />
            <DateInput
              label="End"
              value={block.dateRange?.end || ''}
              onChange={(v) => onUpdate(block.id, {
                dateRange: { start: block.dateRange?.start || v, end: v },
              })}
            />
            {block.dateRange && (
              <button
                onClick={() => { onUpdate(block.id, { dateRange: undefined }); setShowDatePicker(false); }}
                className="w-full mt-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Remove date
              </button>
            )}
          </div>
        )}
      </div>

      {/* Assignee */}
      <div className="relative" ref={assigneeRef}>
        <button
          onClick={() => { setShowAssignee(!showAssignee); setShowColorPicker(false); setShowDatePicker(false); }}
          className="h-10 flex items-center gap-0.5 rounded-3xl hover:bg-gray-50 transition-colors px-1"
          title="Assignee"
        >
          {block.assignee ? (
            <>
              <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-purple-300 to-purple-500 border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{block.assignee.initials}</span>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </>
          ) : (
            <>
              <User size={18} className="text-gray-700" />
              <ChevronDown size={14} className="text-gray-400" />
            </>
          )}
        </button>
        {showAssignee && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-2xl shadow-lg py-1 z-50 w-[180px]">
            {mockAssignees.map((a) => (
              <button
                key={a.name}
                onClick={() => { onUpdate(block.id, { assignee: a }); setShowAssignee(false); }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${block.assignee?.name === a.name ? 'bg-purple-50' : ''}`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">{a.initials}</span>
                </div>
                <span className="text-gray-900 font-medium">{a.name}</span>
                {block.assignee?.name === a.name && <Check size={14} className="text-purple-700 ml-auto" />}
              </button>
            ))}
            {block.assignee && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { onUpdate(block.id, { assignee: undefined }); setShowAssignee(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <X size={14} />
                  Remove assignee
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Checkbox — Mark complete */}
      <button
        onClick={() => onUpdate(block.id, { completed: !block.completed })}
        className="w-10 h-10 flex items-center justify-center rounded-3xl hover:bg-gray-50 transition-colors"
        title="Mark complete"
      >
        {block.completed ? (
          <div className="w-4 h-4 rounded bg-purple-700 flex items-center justify-center">
            <Check size={12} className="text-white" strokeWidth={3} />
          </div>
        ) : (
          <div className="w-4 h-4 rounded border-[1.5px] border-gray-800" />
        )}
      </button>
    </div>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-xs text-gray-400 w-8">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Mon, DD"
        className="flex-1 h-7 px-2 text-xs font-medium text-gray-900 border border-gray-100 rounded-lg focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700/20"
      />
    </div>
  );
}
