import { Search, Cloud, ArrowUpFromLine } from 'lucide-react';

interface NavbarProps {
  projectName: string;
}

export function Navbar({ projectName }: NavbarProps) {
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
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-300 overflow-hidden ml-1">
          <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-800">KP</div>
        </div>
      </div>
    </header>
  );
}
