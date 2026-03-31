import { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import type { Block } from '../types';

interface BlockToolbarProps {
  block: Block;
  onUpdate: (blockId: string, updates: Partial<Block>) => void;
}

const PRESET_COLORS = [
  '#4F00C1', '#E34033', '#FFA35E', '#F9DB60', '#9ED36D',
  '#02CBEF', '#FF6B9D', '#393939',
];

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

const STATUS_OPTIONS: { value: Block['status']; label: string; id: string; color: string }[] = [
  { value: 'to-do', label: 'To Do', id: 'to-do', color: '#A0A0A0' },
  { value: 'in-progress', label: 'In Progress', id: 'in-progress', color: '#2563EB' },
  { value: 'on-hold', label: 'On Hold', id: 'on-hold', color: '#DC2626' },
  { value: 'done', label: 'Done', id: 'done', color: '#4F00C1' },
];

const MOCK_ASSIGNEES = [
  { name: 'Sarah K.', initials: 'SK' },
  { name: 'James L.', initials: 'JL' },
  { name: 'Alex M.', initials: 'AM' },
  { name: 'Priya S.', initials: 'PS' },
];

// ─── Inline SVG icons matching the Figma toolbar exactly ───

function ColorWheelIcon({ hasColor, color }: { hasColor: boolean; color?: string }) {
  if (hasColor && color) {
    return (
      <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
    );
  }
  return (
    <div
      className="w-5 h-5 rounded-full"
      style={{
        background: 'conic-gradient(from 0deg, #E34033, #FFA35E, #F9DB60, #9ED36D, #02CBEF, #4F00C1, #FF6B9D, #E34033)',
      }}
    />
  );
}

function ImageIcon() {
  return (
    <svg width="21" height="18" viewBox="0 0 21 18" fill="none">
      <path d="M18.577 0H2.423C1.78 0.001 1.165 0.26 0.71 0.72C0.256 1.18 0.001 1.804 0 2.455V15.545C0.001 16.196 0.256 16.82 0.71 17.28C1.165 17.74 1.78 17.999 2.423 18H18.577C19.22 17.999 19.835 17.74 20.29 17.28C20.744 16.82 20.999 16.196 21 15.545V2.455C20.999 1.804 20.744 1.18 20.29 0.72C19.835 0.26 19.22 0.001 18.577 0ZM19.385 15.545C19.384 15.762 19.299 15.97 19.148 16.124C18.996 16.277 18.791 16.364 18.577 16.364H2.423C2.209 16.364 2.004 16.277 1.852 16.124C1.701 15.97 1.616 15.762 1.615 15.545V2.455C1.616 2.238 1.701 2.03 1.852 1.876C2.004 1.723 2.209 1.637 2.423 1.636H18.577C18.791 1.637 18.996 1.723 19.148 1.876C19.299 2.03 19.384 2.238 19.385 2.455V15.545Z" fill="#393939"/>
      <path d="M15.026 7.038C14.902 6.786 14.716 6.572 14.486 6.415C14.256 6.258 13.989 6.164 13.713 6.142C13.436 6.12 13.159 6.17 12.907 6.289C12.655 6.408 12.439 6.59 12.277 6.819L9.602 10.626L8.486 9.495C8.329 9.334 8.14 9.209 7.931 9.127C7.722 9.045 7.499 9.008 7.275 9.02C7.052 9.031 6.833 9.088 6.633 9.189C6.433 9.289 6.256 9.431 6.112 9.605L3.761 12.462C3.566 12.701 3.441 12.99 3.402 13.298C3.363 13.605 3.411 13.917 3.541 14.198C3.67 14.478 3.876 14.716 4.134 14.882C4.393 15.048 4.692 15.137 4.998 15.136H16.42C16.694 15.136 16.964 15.065 17.203 14.93C17.443 14.795 17.645 14.6 17.789 14.363C17.933 14.127 18.015 13.857 18.028 13.579C18.04 13.302 17.982 13.026 17.859 12.777L15.026 7.038ZM5.002 13.51L7.345 10.653L8.46 11.783C8.625 11.95 8.825 12.079 9.044 12.161C9.264 12.242 9.498 12.274 9.731 12.254C9.964 12.235 10.19 12.164 10.393 12.047C10.596 11.93 10.772 11.77 10.907 11.577L13.581 7.77L16.423 13.5L5.002 13.51Z" fill="#393939"/>
      <path d="M6.461 7.364C7.353 7.364 8.077 6.631 8.077 5.727C8.077 4.824 7.353 4.091 6.461 4.091C5.569 4.091 4.846 4.824 4.846 5.727C4.846 6.631 5.569 7.364 6.461 7.364Z" fill="#393939"/>
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="19" viewBox="0 0 20 19" fill="none">
      <path
        d="M10.62 18.137C10.28 18.262 9.72 18.262 9.38 18.137C6.48 17.111 0 12.827 0 5.567C0 2.362 2.49 -0.231 5.56 -0.231C7.38 -0.231 8.99 0.682 10 2.092C11.01 0.682 12.63 -0.231 14.44 -0.231C17.51 -0.231 20 2.362 20 5.567C20 12.827 13.52 17.111 10.62 18.137Z"
        fill={filled ? '#E34033' : '#C0C0C0'}
        stroke={filled ? '#E34033' : '#EAEAEA'}
        strokeWidth="0.833"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NotesIcon() {
  return (
    <div className="relative w-[24px] h-[24px] flex items-center justify-center">
      <div className="relative">
        {/* Back square (yellow) */}
        <div
          className="absolute w-4 h-4"
          style={{
            backgroundColor: '#FFDB41',
            borderRadius: '1px 4px 4px 1px',
            top: 0,
            left: '8.23px',
          }}
        />
        {/* Front square (green) */}
        <div
          className="w-4 h-4 shadow-[0px_1px_2px_rgba(0,0,0,0.07),0px_1px_3px_rgba(0,0,0,0.04)]"
          style={{
            backgroundColor: '#9ED36D',
            borderRadius: '1px 4px 4px 1px',
          }}
        />
      </div>
    </div>
  );
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg width="16" height="16" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="7" cy="7" r="6.5" fill="#4F00C1" />
        <path d="M4.5 7L6.2 8.8L9.5 5.2" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="5.5" stroke="#393939" strokeWidth="1.5" />
    </svg>
  );
}

function ApprovalIcon({ active }: { active?: boolean }) {
  const color = active ? '#4F00C1' : '#393939';
  return (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
      <path d="M0 18C0 16.46 0.444 14.953 1.279 13.66C2.115 12.366 3.305 11.342 4.709 10.708C6.112 10.075 7.668 9.86 9.191 10.089C10.713 10.318 12.137 10.981 13.292 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 10C10.761 10 13 7.761 13 5C13 2.239 10.761 0 8 0C5.239 0 3 2.239 3 5C3 7.761 5.239 10 8 10Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 16L16 18L20 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Divider() {
  return (
    <div className="w-px h-10 bg-gray-100 mx-0.5 shrink-0" />
  );
}

// ─── Toolbar Item Button ───

function ToolbarItem({
  children,
  onClick,
  title,
  className = '',
  width,
  bgColor,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  className?: string;
  width?: string;
  bgColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-10 flex items-center justify-center rounded-3xl transition-colors shrink-0
        ${bgColor || 'bg-white/80 hover:bg-gray-50'}
        ${width || 'w-10'}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// ─── Main Toolbar ───

export function BlockToolbar({ block, onUpdate, onOpenActivity }: BlockToolbarProps & { onOpenActivity?: () => void }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAssignee, setShowAssignee] = useState(false);
  const [showApprovalMenu, setShowApprovalMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);
  const approvalRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setShowColorPicker(false);
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDatePicker(false);
      if (assigneeRef.current && !assigneeRef.current.contains(e.target as Node)) setShowAssignee(false);
      if (approvalRef.current && !approvalRef.current.contains(e.target as Node)) setShowApprovalMenu(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatusMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const closeAll = () => {
    setShowColorPicker(false);
    setShowDatePicker(false);
    setShowAssignee(false);
    setShowApprovalMenu(false);
    setShowStatusMenu(false);
  };

  return (
    <div
      className="flex items-center gap-1 h-[56px] pl-3 pr-2 py-2 bg-white border border-gray-150 rounded-full shadow-[0px_4px_8px_rgba(0,0,0,0.04),0px_1px_3px_rgba(0,0,0,0.07)]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Color */}
      <div className="relative" ref={colorRef}>
        <ToolbarItem
          onClick={() => { closeAll(); setShowColorPicker(!showColorPicker); }}
          title="Color"
        >
          <ColorWheelIcon hasColor={!!block.color} color={block.color} />
        </ToolbarItem>
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
      <ToolbarItem title="Thumbnail">
        <ImageIcon />
      </ToolbarItem>

      <Divider />

      {/* Favorite */}
      <ToolbarItem
        onClick={() => onUpdate(block.id, { favorite: !block.favorite })}
        title="Favorite"
      >
        <HeartIcon filled={!!block.favorite} />
      </ToolbarItem>

      {/* Notes */}
      <ToolbarItem title="Notes">
        <NotesIcon />
      </ToolbarItem>

      {/* Date */}
      <div className="relative" ref={dateRef}>
        <ToolbarItem
          onClick={() => { closeAll(); setShowDatePicker(!showDatePicker); }}
          title="Date"
          width={block.dateRange ? 'w-16' : 'w-10'}
        >
          {block.dateRange ? (
            <span className="text-xs font-medium text-gray-950 whitespace-nowrap leading-[1.5]">
              {block.dateRange.start}
            </span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="3" width="14" height="13" rx="2" stroke="#393939" strokeWidth="1.5"/>
              <path d="M2 7H16" stroke="#393939" strokeWidth="1.5"/>
              <path d="M6 1V4" stroke="#393939" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 1V4" stroke="#393939" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </ToolbarItem>
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
        <ToolbarItem
          onClick={() => { closeAll(); setShowAssignee(!showAssignee); }}
          title="Assignee"
          width="w-14"
        >
          <div className="flex items-center">
            {block.assignee ? (
              <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-purple-300 to-purple-500 border border-white flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{block.assignee.initials}</span>
              </div>
            ) : (
              <div className="w-[26px] h-[26px] rounded-full bg-gray-200 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 7C8.933 7 10.5 5.433 10.5 3.5C10.5 1.567 8.933 0 7 0C5.067 0 3.5 1.567 3.5 3.5C3.5 5.433 5.067 7 7 7Z" fill="#9F9F9F"/>
                  <path d="M7 8.5C3.685 8.5 1 10.685 1 13.5H13C13 10.685 10.315 8.5 7 8.5Z" fill="#9F9F9F"/>
                </svg>
              </div>
            )}
            <ChevronDown size={14} className="text-gray-400 ml-0.5" />
          </div>
        </ToolbarItem>
        {showAssignee && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-2xl shadow-lg py-1 z-50 w-[180px]">
            {MOCK_ASSIGNEES.map((a) => (
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

      {/* Status */}
      <div className="relative" ref={statusRef}>
        <ToolbarItem
          onClick={() => {
            if (block.status) {
              closeAll();
              setShowStatusMenu(!showStatusMenu);
            } else {
              onUpdate(block.id, { status: 'to-do' });
            }
          }}
          title={block.status ? 'Change status' : 'Add status'}
          bgColor={block.status ? 'bg-[#F5F5F5] hover:bg-gray-100' : 'bg-white/80 hover:bg-gray-50'}
        >
          <CheckboxIcon checked={!!block.status} />
        </ToolbarItem>
        {showStatusMenu && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-2xl shadow-lg py-1.5 z-50 w-[180px]">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onUpdate(block.id, { status: opt.value });
                  setShowStatusMenu(false);
                }}
                className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${block.status === opt.value ? 'bg-gray-50' : ''}`}
              >
                <StatusIcon id={opt.id} color={opt.color} />
                <span className="text-gray-900 font-medium">{opt.label}</span>
                {block.status === opt.value && <Check size={14} className="text-purple-700 ml-auto" />}
              </button>
            ))}
            <div className="mx-3 border-t border-gray-100 my-1" />
            <button
              onClick={() => {
                onUpdate(block.id, { status: undefined });
                setShowStatusMenu(false);
              }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <X size={14} />
              <span>Remove status</span>
            </button>
          </div>
        )}
      </div>

      <Divider />

      {/* Approval */}
      <div className="relative" ref={approvalRef}>
        <ToolbarItem
          onClick={() => {
            const hasRequest = block.approval?.status === 'pending' || block.approval?.status === 'approved';
            if (hasRequest) {
              closeAll();
              setShowApprovalMenu(!showApprovalMenu);
            } else {
              onUpdate(block.id, {
                approval: { status: 'pending', assignees: [] },
              });
            }
          }}
          title={block.approval?.status === 'pending' || block.approval?.status === 'approved' ? 'Approval options' : 'Add approval request'}
          bgColor={block.approval?.status === 'pending' || block.approval?.status === 'approved' ? 'bg-[#F8F5FD] hover:bg-purple-100' : 'bg-white/80 hover:bg-gray-50'}
        >
          <ApprovalIcon active={block.approval?.status === 'pending' || block.approval?.status === 'approved'} />
        </ToolbarItem>
        {showApprovalMenu && (
          <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-100 rounded-2xl shadow-lg py-1.5 z-50 w-[240px]">
            <button
              onClick={() => {
                setShowApprovalMenu(false);
                onOpenActivity?.();
              }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-900 font-medium">Check approval activity</span>
            </button>
            <div className="mx-3 border-t border-gray-100" />
            <button
              onClick={() => {
                onUpdate(block.id, {
                  approval: { status: 'none', assignees: [] },
                });
                setShowApprovalMenu(false);
              }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-900 font-medium">Remove approval request</span>
            </button>
          </div>
        )}
      </div>

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
