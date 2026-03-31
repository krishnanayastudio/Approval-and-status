import { HelpCircle, Rocket, Square, Upload, FileText, Image, Presentation, Table2, Wrench, MessageCircle, Layers, BarChart3, ZoomIn } from 'lucide-react';

export function Toolbar() {
  const mainTools = [
    { icon: <Square size={18} />, label: 'Block' },
    { icon: <Upload size={18} />, label: 'Upload' },
    { icon: <FileText size={18} />, label: 'Doc' },
    { icon: <Image size={18} />, label: 'Image' },
    { icon: <Presentation size={18} />, label: 'Slides' },
    { icon: <Table2 size={18} />, label: 'Sheet' },
    { icon: <Wrench size={18} />, label: 'CAD' },
  ];

  return (
    <div className="h-[108px] relative shrink-0 w-full">
      {/* Left island */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 h-14 px-2 bg-white border border-gray-150 rounded-full shadow-[0px_8px_12px_6px_rgba(0,0,0,0.04),0px_4px_4px_rgba(0,0,0,0.07)]">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors">
          <HelpCircle size={20} className="text-gray-700" />
        </button>
        <div className="w-px h-6 bg-gray-150" />
        <button className="flex items-center gap-1.5 h-10 pl-2 pr-3 bg-purple-200 rounded-full hover:bg-purple-300 transition-colors">
          <Rocket size={18} className="text-purple-700" />
          <span className="text-sm font-medium text-purple-700">Quick start</span>
        </button>
      </div>

      {/* Center toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1 h-14 px-3 py-2 bg-white border border-gray-150 rounded-full shadow-[0px_4px_8px_rgba(0,0,0,0.04),0px_1px_3px_rgba(0,0,0,0.07)]">
        {mainTools.map((tool) => (
          <button
            key={tool.label}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors text-gray-800"
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
        <div className="w-px h-8 bg-gray-150 mx-1 self-center" />
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors text-gray-800">
          <MessageCircle size={18} />
        </button>
      </div>

      {/* Right island */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 h-14 px-2 bg-white border border-gray-150 rounded-full shadow-[0px_8px_12px_rgba(0,0,0,0.04),0px_4px_4px_rgba(0,0,0,0.07)]">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors">
          <Layers size={18} className="text-gray-700" />
        </button>
        <div className="w-px h-6 bg-gray-150" />
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors">
          <BarChart3 size={18} className="text-gray-700" />
        </button>
        <div className="w-px h-6 bg-gray-150" />
        <button className="flex items-center gap-1.5 h-10 px-3 rounded-full hover:bg-gray-50 transition-colors">
          <ZoomIn size={18} className="text-gray-700" />
          <span className="text-sm font-medium text-gray-800">100%</span>
        </button>
      </div>
    </div>
  );
}
