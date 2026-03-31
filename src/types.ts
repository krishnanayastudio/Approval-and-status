export interface Block {
  id: string;
  name: string;
  type: 'sketch' | 'board' | 'doc' | 'cad' | 'image';
  thumbnail: string;
  color?: string;
  favorite?: boolean;
  notes?: string;
  dateRange?: { start: string; end: string };
  assignee?: { name: string; initials: string };
  completed?: boolean;
}

export interface BlockGroup {
  id: string;
  name: string;
  blocks: Block[];
  collapsed?: boolean;
}

export type JourneyItem =
  | { kind: 'block'; block: Block }
  | { kind: 'group'; group: BlockGroup };

export interface Project {
  name: string;
  items: JourneyItem[];
}
