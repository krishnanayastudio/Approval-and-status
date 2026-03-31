import { useState, useRef, useEffect } from 'react';
import { Search, Cloud, ArrowUpFromLine } from 'lucide-react';
import { ALL_PEOPLE } from './ApprovalChip';

interface NavbarProps {
  projectName: string;
  currentUserId: number;
  onSwitchUser: (id: number) => void;
}

export function Navbar({ projectName, currentUserId, onSwitchUser }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentUser = ALL_PEOPLE.find(p => p.id === currentUserId) || ALL_PEOPLE[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-gray-100 bg-white shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-purple-700 rounded-lg flex items-center justify-center">
          <svg width="26" height="16" viewBox="0 0 26 16" fill="none">
            <path d="M2 14L8 2L14 14M18 2V14M22 2C24 2 25 4 25 6C25 8 24 10 22 10H20V2H22Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <button className="flex items-center gap-1 px-2 h-8 rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-sm font-medium text-gray-900">{projectName}</span>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="ml-1">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="#393939" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Center - Search */}
      <div className="flex items-center w-[600px] max-w-[600px] min-w-[240px] h-10 border border-gray-300 rounded-full px-4 gap-2">
        <Search size={18} className="text-gray-400 shrink-0" />
        <span className="text-sm text-gray-400 truncate">Search for assets, links, 3D files, integrations</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button className="flex items-center gap-1 h-10 pl-2 pr-1 rounded-2xl hover:bg-gray-50 transition-colors">
          <span className="text-sm font-medium text-purple-700">Tasks</span>
          <span className="flex items-center justify-center h-8 w-10 rounded-2xl bg-purple-150 text-sm font-medium text-purple-700">12</span>
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded-2xl hover:bg-gray-50 transition-colors">
          <Cloud size={16} className="text-gray-800" />
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded-2xl hover:bg-gray-50 transition-colors">
          <ArrowUpFromLine size={15} className="text-gray-800" />
        </button>
        <button className="flex items-center justify-center h-10 px-4 bg-purple-700 text-white text-sm font-medium rounded-full hover:bg-purple-700/90 transition-colors">
          Share
        </button>

        {/* Profile switcher */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(o => !o)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 transition-shadow hover:shadow-md"
            style={{ background: currentUser.color }}
          >
            {currentUser.initials}
          </button>

          {profileOpen && (
            <div
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 9999,
                background: '#fff', borderRadius: 14,
                boxShadow: '0 4px 8px rgba(0,0,0,0.08), 0 16px 32px rgba(0,0,0,0.10)',
                border: '1px solid #EAEAEA', padding: '8px', minWidth: 230,
                animation: 'drop 0.15s ease',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9F9F9F', letterSpacing: '0.06em', padding: '2px 8px 8px' }}>
                SWITCH PERSPECTIVE
              </div>
              {ALL_PEOPLE.map(p => {
                const isMe = p.id === currentUserId;
                return (
                  <div key={p.id}
                    onClick={() => { onSwitchUser(p.id); setProfileOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '7px 8px', borderRadius: 8,
                      cursor: isMe ? 'default' : 'pointer',
                      background: isMe ? '#F5F0FF' : 'transparent',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => { if (!isMe) (e.currentTarget as HTMLElement).style.background = '#F5F5F5'; }}
                    onMouseLeave={e => { if (!isMe) (e.currentTarget as HTMLElement).style.background = isMe ? '#F5F0FF' : 'transparent'; }}
                  >
                    <div
                      style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: p.color,
                        border: isMe ? '2.5px solid ' + p.color : '2px solid white',
                        outline: isMe ? '2.5px solid white' : 'none',
                        outlineOffset: '1px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: 'white',
                        flexShrink: 0, boxSizing: 'border-box',
                      }}
                    >
                      {p.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: isMe ? 700 : 500, color: isMe ? p.color : '#161616' }}>
                        {p.name}
                        {isMe && <span style={{ fontSize: 10, color: '#9B5DE5', marginLeft: 5, fontWeight: 600 }}>you</span>}
                      </div>
                      <div style={{ fontSize: 10, color: '#A0A0A0', marginTop: 1 }}>
                        {p.canEdit ? 'Editor' : 'Viewer'}
                      </div>
                    </div>
                    {isMe && <div style={{ width: 6, height: 6, borderRadius: 99, background: p.color, flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
