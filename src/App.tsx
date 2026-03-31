import { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { JourneyCanvas } from './components/JourneyCanvas';
import { Toolbar } from './components/Toolbar';
import { initialProject } from './data';
import type { Project, Block } from './types';

function App() {
  const [project, setProject] = useState<Project>(initialProject);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setProject(prev => {
      const items = [...prev.items];
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      return { ...prev, items };
    });
  }, []);

  const handleUpdateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    setProject(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.kind === 'block' && item.block.id === blockId) {
          return { ...item, block: { ...item.block, ...updates } };
        }
        if (item.kind === 'group') {
          return {
            ...item,
            group: {
              ...item.group,
              blocks: item.group.blocks.map(b =>
                b.id === blockId ? { ...b, ...updates } : b
              ),
            },
          };
        }
        return item;
      }),
    }));
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <Navbar projectName={project.name} />

      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        <JourneyCanvas
          items={project.items}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onUpdateBlock={handleUpdateBlock}
          onReorder={handleReorder}
        />
      </div>

      <Toolbar />
    </div>
  );
}

export default App;
