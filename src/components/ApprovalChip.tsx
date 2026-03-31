import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

// ─── Portal Dropdown ─────────────────────────────────────────────────────────
// Renders children in a portal positioned below the trigger ref element
function PortalDropdown({
  triggerRef,
  children,
  align = 'left',
}: {
  triggerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8 + window.scrollY,
      left: align === 'right' ? rect.right + window.scrollX : rect.left + window.scrollX,
    });
  }, [triggerRef, align]);

  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        zIndex: 9999,
        ...(align === 'right' ? { transform: 'translateX(-100%)' } : {}),
      }}
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────
export const ALL_PEOPLE = [
  { id: 0, name: 'Krishna', initials: 'KP', color: '#6B7280', email: 'krishna@naya.studio', canEdit: true },
  { id: 1, name: 'Alice', initials: 'A', color: '#7C3AED', email: 'alice@naya.studio', canEdit: true },
  { id: 2, name: 'Ben', initials: 'B', color: '#0369A1', email: 'ben@naya.studio', canEdit: true },
  { id: 3, name: 'Carol', initials: 'C', color: '#0D7A4E', email: 'carol@naya.studio', canEdit: false },
  { id: 4, name: 'David', initials: 'D', color: '#B45309', email: 'david@naya.studio', canEdit: false },
  { id: 5, name: 'Eva', initials: 'E', color: '#BE185D', email: 'eva@naya.studio', canEdit: false },
];

interface Person {
  id: number;
  name: string;
  initials: string;
  color: string;
  email: string;
  canEdit: boolean;
}

function getPerson(id: number): Person | undefined {
  return ALL_PEOPLE.find(p => p.id === id);
}

let _id = 0;
interface LogEntry {
  id: number;
  actor: Person;
  type: string;
  message: string;
  ts: number;
  tag: string;
}

function makeEntry(actor: Person, type: string, message: string, tag: string): LogEntry {
  return { id: ++_id, actor, type, message, ts: Date.now(), tag };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Avatar({ person, size = 24, ring = false }: { person: Person; size?: number; ring?: boolean }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: person.color,
      border: ring ? '2.5px solid ' + person.color : '2px solid white',
      outline: ring ? '2.5px solid white' : 'none',
      outlineOffset: '1px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: 'white',
      fontFamily: 'system-ui, sans-serif', flexShrink: 0,
      boxSizing: 'border-box',
    }}>
      {person.initials}
    </div>
  );
}

function TimeAgo({ ts }: { ts: number }) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return <span>just now</span>;
  if (diff < 60) return <span>{diff}s ago</span>;
  return <span>{Math.floor(diff / 60)}m ago</span>;
}

function ActivityEntry({ entry }: { entry: LogEntry }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'flex-start',
      padding: '8px 14px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(-6px)',
      transition: 'opacity 0.2s ease, transform 0.2s ease',
    }}>
      <Avatar person={entry.actor} size={22} />
      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        <div style={{ fontSize: 12.5, color: '#161616', lineHeight: 1.4 }}>
          <span style={{ fontWeight: 600, color: entry.actor.color }}>{entry.actor.name}</span>
          {' '}{entry.message}
        </div>
        <div style={{ fontSize: 11, color: '#C0C0C0', marginTop: 2 }}>
          <TimeAgo ts={entry.ts} />
        </div>
      </div>
    </div>
  );
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ value, onSelect }: { value: string; onSelect: (iso: string) => void }) {
  const parsed = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onSelect(value); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const isSelected = (d: number | null) => d !== null && selectedDate && selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === d;
  const today = new Date();
  const isToday = (d: number | null) => d !== null && today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;

  const pick = (d: number) => {
    const iso = viewYear + '-' + String(viewMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    onSelect(iso);
  };
  const prevMonth = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

  return (
    <div ref={ref} data-approval-portal onClick={e => e.stopPropagation()} style={{
      background: '#fff', borderRadius: 14, padding: '12px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.08), 0 16px 32px rgba(0,0,0,0.10)',
      border: '1px solid #EAEAEA', width: 230, animation: 'drop 0.15s ease',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#888', padding: '0 4px' }}>‹</button>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#161616' }}>{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#888', padding: '0 4px' }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#BABABA', padding: '2px 0' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((d, i) => (
          <div key={i} onClick={() => d && pick(d)} style={{
            textAlign: 'center', fontSize: 12, padding: '5px 0', borderRadius: 6,
            cursor: d ? 'pointer' : 'default',
            background: isSelected(d) ? '#6D28D9' : isToday(d) ? '#F3F0FF' : 'transparent',
            color: isSelected(d) ? '#fff' : isToday(d) ? '#6D28D9' : d ? '#161616' : 'transparent',
            fontWeight: isSelected(d) || isToday(d) ? 600 : 400,
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => { if (d && !isSelected(d)) (e.currentTarget as HTMLElement).style.background = '#F5F5F5'; }}
          onMouseLeave={e => { if (d && !isSelected(d)) (e.currentTarget as HTMLElement).style.background = isToday(d) ? '#F3F0FF' : 'transparent'; }}
          >{d || ''}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Unified Approval Panel ───────────────────────────────────────────────────
function UnifiedApprovalPanel({
  requestExists, assigned, allPeople, assignedIds, approvedIds,
  currentUser, count, total, canManageRequest,
  openToSearch, onSearchOpened,
  onApprove, onUnapprove, onToggleAssignee,
}: {
  requestExists: boolean;
  assigned: Person[];
  allPeople: Person[];
  assignedIds: Set<number>;
  approvedIds: Map<number, number>;
  currentUser: Person;
  count: number;
  total: number;
  canManageRequest: boolean;
  openToSearch: boolean;
  onSearchOpened?: () => void;
  onApprove: (p: Person) => void;
  onUnapprove: (p: Person) => void;

  onToggleAssignee: (id: number) => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (openToSearch) { setSearchOpen(true); onSearchOpened?.(); }
  }, [openToSearch]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else setSearch('');
  }, [searchOpen]);

  const filtered = allPeople.filter(p =>
    !assignedIds.has(p.id) &&
    (search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()))
  );

  const pct = total > 0 ? (count / total) * 100 : 0;
  const allApproved = total > 0 && count === total;
  const ROW: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px' };
  const LABEL: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#161616' };
  const SUB: React.CSSProperties = { fontSize: 11, marginTop: 2 };

  return (
    <div
      data-approval-portal
      onClick={e => e.stopPropagation()}
      style={{
        background: '#fff', borderRadius: 16,
        boxShadow: '0 4px 8px rgba(0,0,0,0.06), 0 20px 40px rgba(0,0,0,0.10)',
        border: '1px solid #EBEBEB',
        width: 300, animation: 'drop 0.15s ease',
        overflow: 'hidden', fontFamily: 'system-ui, sans-serif',
      }}
    >
      {requestExists && (
        <>
          {/* Progress header */}
          <div style={{ padding: '14px 16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#161616' }}>
                {total === 0 ? 'No approvers yet' : allApproved ? 'All approved' : count + ' of ' + total + ' approved'}
              </span>
              {total > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 600, borderRadius: 99, padding: '2px 8px',
                  color: allApproved ? '#059669' : '#6D28D9',
                  background: allApproved ? '#D1FAE5' : '#EDE9FE',
                }}>{Math.round(pct)}%</span>
              )}
            </div>
            <div style={{ height: 3, background: '#F0F0F0', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: allApproved ? '#059669' : '#6D28D9',
                width: total === 0 ? '0%' : pct + '%',
                transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1), background 0.3s',
              }} />
            </div>
          </div>

          <div style={{ height: 1, background: '#F2F2F2' }} />

          {/* Approver rows */}
          {assigned.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: '#BABABA' }}>No approvers added yet</span>
            </div>
          ) : (
            <div style={{ padding: '4px 0' }}>
              {assigned.map(p => {
                const done = approvedIds.has(p.id);
                const approvedAt = approvedIds.get(p.id);
                const isMyRow = currentUser.id === p.id;
                const approvedDate = approvedAt
                  ? new Date(approvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : null;

                return (
                  <div key={p.id}
                    style={{ ...ROW, position: 'relative' }}
                    onMouseEnter={e => { const b = e.currentTarget.querySelector('.row-remove') as HTMLElement; if (b && !(isMyRow && done)) b.style.opacity = '1'; }}
                    onMouseLeave={e => { const b = e.currentTarget.querySelector('.row-remove') as HTMLElement; if (b && !(isMyRow && done)) b.style.opacity = '0'; }}
                  >
                    <Avatar person={p} size={30} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={LABEL}>
                        {p.name}
                        {isMyRow && <span style={{ fontSize: 10, color: '#9B5DE5', marginLeft: 5, fontWeight: 600 }}>you</span>}
                      </div>
                      <div style={{ ...SUB, color: '#A0A0A0' }}>{done ? approvedDate : ' '}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {done ? (
                        <span style={{
                          fontSize: 12, fontWeight: 600, color: '#6D28D9',
                          background: '#EDE9FE', borderRadius: 99, padding: '3px 10px', whiteSpace: 'nowrap',
                        }}>Approved</span>
                      ) : isMyRow ? (
                        <button onClick={() => onApprove(p)} style={{
                          fontSize: 12, fontWeight: 700, color: '#5B21B6',
                          background: '#F1EBFA', border: '1.5px solid #DDD0F8',
                          borderRadius: 99, padding: '4px 12px', cursor: 'pointer',
                          fontFamily: 'system-ui, sans-serif', transition: 'all 0.15s', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E2D4F8'; (e.currentTarget as HTMLElement).style.borderColor = '#C4B5FD'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F1EBFA'; (e.currentTarget as HTMLElement).style.borderColor = '#DDD0F8'; }}
                        >Approve</button>
                      ) : (
                        <span style={{ fontSize: 11, color: '#C8A84B', fontWeight: 500 }}>Pending</span>
                      )}

                      {((isMyRow && done) || (!done && canManageRequest)) && (
                        <button
                          className="row-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (done) onUnapprove(p);
                            else onToggleAssignee(p.id);
                          }}
                          style={{
                            opacity: (isMyRow && done) ? 1 : 0,
                            fontSize: 13, color: '#C0C0C0', background: 'none',
                            border: 'none', padding: '2px 4px', cursor: 'pointer',
                            fontFamily: 'system-ui, sans-serif', borderRadius: 4,
                            transition: 'opacity 0.15s, color 0.12s', flexShrink: 0,
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#DC2626'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#C0C0C0'}
                          title={done ? 'Undo approval' : 'Remove'}
                        >✕</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add approver — editors only */}
          {canManageRequest && (
            <>
              <div style={{ height: 1, background: '#F2F2F2' }} />
              {!searchOpen ? (
                <div
                  onClick={() => setSearchOpen(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px', cursor: 'pointer', transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="#C8C8C8" strokeWidth="1.2"/>
                    <path d="M6.5 4V9M4 6.5H9" stroke="#C8C8C8" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 13, color: '#C0C0C0', fontWeight: 500 }}>Add approver</span>
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px', background: '#FAFAFA',
                    borderBottom: '1px solid #F2F2F2',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
                      <circle cx="5.5" cy="5.5" r="4.5" stroke="#161616" strokeWidth="1.4"/>
                      <path d="M9.5 9.5L12 12" stroke="#161616" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <input
                      ref={inputRef}
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by name or email…"
                      style={{
                        flex: 1, border: 'none', outline: 'none',
                        fontSize: 13, color: '#161616', background: 'transparent',
                        fontFamily: 'system-ui, sans-serif',
                      }}
                    />
                    <button onClick={() => setSearchOpen(false)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#BABABA', fontSize: 15, padding: '0 2px', lineHeight: 1,
                    }}>✕</button>
                  </div>
                  <div style={{ maxHeight: 180, overflowY: 'auto', padding: '4px 0' }}>
                    {filtered.length === 0 ? (
                      <p style={{ fontSize: 12, color: '#C0C0C0', textAlign: 'center', padding: '14px 0', margin: 0 }}>
                        {search ? 'No users found' : "Everyone's already added"}
                      </p>
                    ) : filtered.map(p => (
                      <div key={p.id}
                        onClick={() => { onToggleAssignee(p.id); setSearch(''); }}
                        style={{ ...ROW, cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F5F5F5'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        <Avatar person={p} size={30} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={LABEL}>{p.name}</div>
                          <div style={{ ...SUB, color: '#B0B0B0' }}>{p.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main ApprovalChip Component ─────────────────────────────────────────────
export function ApprovalChip({
  currentUserId = 0,
  requestExists,
  onRequestChange,
  openActivityTrigger = 0,
}: {
  currentUserId?: number;
  requestExists: boolean;
  onRequestChange: (exists: boolean) => void;
  openActivityTrigger?: number;
}) {
  const currentUser = ALL_PEOPLE.find(p => p.id === currentUserId) || ALL_PEOPLE[0];
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [approvedIds, setApprovedIds] = useState<Map<number, number>>(new Map());
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [chipPlusClicked, setChipPlusClicked] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [requester] = useState(ALL_PEOPLE[0]);
  const [dueDate, setDueDate] = useState('2025-08-03');
  const logRef = useRef<HTMLDivElement>(null);
  const approvalTriggerRef = useRef<HTMLDivElement>(null);
  const dateTriggerRef = useRef<HTMLDivElement>(null);
  const activityTriggerRef = useRef<HTMLDivElement>(null);

  // Close all dropdowns when clicking anywhere outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsidePortal = (target as HTMLElement).closest?.('[data-approval-portal]');
      if (clickedInsidePortal) return;
      if (approvalTriggerRef.current?.contains(target)) return;
      if (dateTriggerRef.current?.contains(target)) return;
      if (activityTriggerRef.current?.contains(target)) return;
      closeAll();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Open activity panel when triggered externally (from toolbar)
  useEffect(() => {
    if (openActivityTrigger > 0) {
      setApprovalOpen(false);
      setDateOpen(false);
      setActivityOpen(true);
    }
  }, [openActivityTrigger]);

  const dueDateDisplay = dueDate
    ? new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Set date';

  const [log, setLog] = useState<LogEntry[]>(() => [
    makeEntry(ALL_PEOPLE[0], 'request_added', 'added an approval request', 'Requester'),
    makeEntry(ALL_PEOPLE[0], 'due_date_set', 'set the due date to Aug 3', 'Requester'),
  ]);

  const assigned = ALL_PEOPLE.filter(p => assignedIds.has(p.id));
  const count = approvedIds.size;
  const total = assignedIds.size;
  const full = total > 0 && count === total;
  const partial = count > 0 && !full;

  const canManageRequest = currentUser.canEdit;

  const chipBg = !requestExists ? '#FEF2F2' : full ? '#EDE9FE' : '#fff';
  const chipBord = !requestExists ? '#FECACA' : full ? '#C4B5FD' : '#EAEAEA';
  const labelClr = !requestExists ? '#991B1B' : full ? '#3B0764' : partial ? '#92400E' : '#040404';

  const getLabel = () => {
    if (!requestExists) return 'No request';
    if (full) return 'Approved';
    if (partial) return count + '/' + total + ' approved';
    if (total === 0) return 'Add approvers';
    return 'Approval needed';
  };
  const label = getLabel();

  const addLog = (entry: LogEntry) => setLog(prev => [entry, ...prev]);
  const closeAll = () => {
    setApprovalOpen(false);
    setActivityOpen(false);
    setDateOpen(false);
  };

  const toggleAssignee = (id: number) => {
    if (!canManageRequest) return;
    const person = getPerson(id);
    if (!person) return;
    setAssignedIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id);
        setApprovedIds(ap => { const a = new Map(ap); a.delete(id); return a; });
        addLog(makeEntry(currentUser, 'approver_removed', 'removed ' + person.name + ' as an approver', 'Requester'));
      } else {
        s.add(id);
        addLog(makeEntry(currentUser, 'approver_added', 'added ' + person.name + ' as an approver', 'Requester'));
      }
      return s;
    });
  };

  const handleApprove = (person: Person) => {
    if (currentUser.id !== person.id) return;
    setApprovedIds(prev => new Map([...prev, [person.id, Date.now()]]));
    addLog(makeEntry(person, 'approved', 'approved the request', 'Approver'));
  };

  const handleUnapprove = (person: Person) => {
    setApprovedIds(prev => { const s = new Map(prev); s.delete(person.id); return s; });
    const msg = person.id === currentUser.id ? 'revoked their approval' : 'revoked ' + person.name + "'s approval";
    addLog(makeEntry(currentUser, 'unapproved', msg, 'Approver'));
  };

  const handleDeleteRequest = () => {
    if (!canManageRequest) return;
    onRequestChange(false);
    setApprovedIds(new Map());
    closeAll();
    addLog(makeEntry(currentUser, 'request_deleted', 'deleted the approval request', 'Requester'));
  };



  return (
    <>
      <style>{`
        @keyframes drop {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {requestExists ? (
        <div
          onClick={e => e.stopPropagation()}
          onContextMenu={e => {
            if (!canManageRequest) return;
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY });
            closeAll();
          }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: 4, borderRadius: 99,
            background: chipBg, border: '1px solid ' + chipBord,
            boxShadow: '0 1px 2px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.04)',
            transition: 'background 0.3s, border-color 0.3s',
            maxWidth: '100%',
          }}
        >
          {/* Status pill */}
          <div ref={approvalTriggerRef} style={{ position: 'relative', minWidth: 0, flex: '1 1 auto' }}>
            <div
              onClick={() => {
                setApprovalOpen(o => !o);
                setActivityOpen(false); setDateOpen(false);
                if (assigned.length === 0 && canManageRequest) setChipPlusClicked(true);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, height: 32,
                background: '#fff', border: '1px solid #EAEAEA', borderRadius: 99,
                padding: '0 10px 0 6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.07)',
                cursor: 'pointer',
                userSelect: 'none', transition: 'background 0.15s',
                minWidth: 0, overflow: 'hidden',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F5F5F5'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
            >
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {assigned.slice(0, 1).map((p) => (
                  <div key={p.id} style={{ marginLeft: 0, zIndex: 2 }}>
                    <Avatar person={p} size={22} />
                  </div>
                ))}
                {assigned.length > 1 && (
                  <div style={{
                    marginLeft: -6, zIndex: 1,
                    width: 22, height: 22, borderRadius: '50%',
                    background: '#E5E5E5', border: '2px solid white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700, color: '#555',
                  }}>+{assigned.length - 1}</div>
                )}
                {assigned.length === 0 && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: canManageRequest ? '#EDE9FE' : '#E2E2E2',
                    border: '2px solid white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {canManageRequest
                      ? <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M4.5 1V8M1 4.5H8" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      : <span style={{ fontSize: 11, color: '#9F9F9F' }}>—</span>
                    }
                  </div>
                )}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', color: labelClr, transition: 'color 0.2s', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {label}
              </span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="#C0C0C0" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            {approvalOpen && (
              <PortalDropdown triggerRef={approvalTriggerRef}>
                <UnifiedApprovalPanel
                  requestExists={requestExists}
                  assigned={assigned}
                  allPeople={ALL_PEOPLE}
                  assignedIds={assignedIds}
                  approvedIds={approvedIds}
                  currentUser={currentUser}
                  count={count}
                  total={total}
                  canManageRequest={canManageRequest}
                  openToSearch={chipPlusClicked}
                  onSearchOpened={() => setChipPlusClicked(false)}
                  onApprove={handleApprove}
                  onUnapprove={handleUnapprove}
                  onToggleAssignee={toggleAssignee}
                />
              </PortalDropdown>
            )}
          </div>

          {/* Date pill */}
          {canManageRequest ? (
            <div ref={dateTriggerRef} style={{ position: 'relative', flexShrink: 0 }}>
              <div
                onClick={() => { setDateOpen(o => !o); setApprovalOpen(false); setActivityOpen(false); }}
                style={{
                  height: 32, display: 'flex', alignItems: 'center',
                  background: '#fff', border: '1px solid #EAEAEA', borderRadius: 99,
                  padding: '0 10px', boxShadow: '0 1px 2px rgba(0,0,0,0.07)',
                  cursor: 'pointer', userSelect: 'none', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F5F5F5'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
              >
                <span style={{ fontSize: 12, fontWeight: 500, color: '#040404', whiteSpace: 'nowrap' }}>
                  {dueDateDisplay}
                </span>
              </div>
              {dateOpen && (
                <PortalDropdown triggerRef={dateTriggerRef}>
                  <MiniCalendar
                    value={dueDate}
                    onSelect={(iso) => {
                      setDueDate(iso);
                      setDateOpen(false);
                      const display = new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      addLog(makeEntry(currentUser, 'due_date_set', 'set the due date to ' + display, 'Requester'));
                    }}
                  />
                </PortalDropdown>
              )}
            </div>
          ) : (
            <div style={{
              height: 32, display: 'flex', alignItems: 'center',
              background: '#fff', border: '1px solid #EAEAEA',
              borderRadius: 99, padding: '0 10px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.07)',
            }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#040404' }}>{dueDateDisplay}</span>
            </div>
          )}

          {/* Activity icon pill */}
          <div ref={activityTriggerRef} style={{ position: 'relative', flexShrink: 0 }}>
            <div
              onClick={() => {
                setActivityOpen(o => !o); setApprovalOpen(false);
              }}
              title="Activity log"
              style={{
                height: 32, width: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: activityOpen ? '#EDE9FE' : '#fff',
                border: '1px solid ' + (activityOpen ? '#C4B5FD' : '#EAEAEA'),
                borderRadius: 99,
                boxShadow: '0 1px 2px rgba(0,0,0,0.07)',
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { if (!activityOpen) (e.currentTarget as HTMLElement).style.background = '#F5F5F5'; }}
              onMouseLeave={e => { if (!activityOpen) (e.currentTarget as HTMLElement).style.background = '#fff'; }}
            >
              <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                <rect x="0" y="0" width="14" height="2" rx="1" fill={activityOpen ? '#6D28D9' : '#888'}/>
                <rect x="0" y="5" width="10" height="2" rx="1" fill={activityOpen ? '#6D28D9' : '#888'}/>
                <rect x="0" y="10" width="6" height="2" rx="1" fill={activityOpen ? '#6D28D9' : '#888'}/>
              </svg>
            </div>

            {activityOpen && (
              <PortalDropdown triggerRef={activityTriggerRef} align="right">
              <div data-approval-portal style={{
                background: '#fff', borderRadius: 14,
                boxShadow: '0 4px 8px rgba(0,0,0,0.08), 0 16px 32px rgba(0,0,0,0.10)',
                border: '1px solid #EAEAEA',
                width: 320, animation: 'drop 0.15s ease',
                overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px 10px', borderBottom: '1px solid #F0F0F0',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#161616' }}>Activity</span>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 14px 7px', borderBottom: '1px solid #F0F0F0',
                  background: '#FAFAFA',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Avatar person={requester} size={18} />
                    <span style={{ fontSize: 11, color: '#9F9F9F' }}>
                      Requested by <strong style={{ color: requester.color }}>{requester.name}</strong>
                      {!requestExists && <span style={{ color: '#DC2626', marginLeft: 4 }}>· deleted</span>}
                    </span>
                  </div>
                  {dueDate && (
                    <span style={{ fontSize: 11, color: '#9F9F9F', whiteSpace: 'nowrap' }}>
                      Due <strong style={{ color: '#161616' }}>{dueDateDisplay}</strong>
                    </span>
                  )}
                </div>

                <div ref={logRef} style={{ maxHeight: 300, overflowY: 'auto', padding: '4px 4px' }}>
                  {log.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#C0C0C0', fontSize: 12, padding: '20px 0' }}>No activity yet</p>
                  )}
                  {log.map((entry) => (
                    <ActivityEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
              </PortalDropdown>
            )}
          </div>

        </div>
      ) : null}

      {/* Right-click context menu */}
      {contextMenu && (
        <>
          <div
            onClick={() => setContextMenu(null)}
            onContextMenu={e => { e.preventDefault(); setContextMenu(null); }}
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
          />
          <div style={{
            position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 999,
            background: '#fff', borderRadius: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #EAEAEA', padding: '4px',
            minWidth: 180, animation: 'drop 0.12s ease',
          }}>
            <div
              onClick={() => { handleDeleteRequest(); setContextMenu(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 7,
                cursor: 'pointer', transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FEF2F2'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 2L11 11M11 2L2 11" stroke="#DC2626" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 500 }}>Delete request</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
