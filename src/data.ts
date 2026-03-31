import type { Project } from './types';

export const initialProject: Project = {
  name: 'Ceramic Grinder',
  items: [
    {
      kind: 'block',
      block: {
        id: 'b1', name: 'Market Research', type: 'doc', thumbnail: '',
        favorite: true,
        dateRange: { start: 'Mar, 31', end: 'Apr, 01' },
        assignee: { name: 'Sarah K.', initials: 'SK' },
        approval: { status: 'pending', assignees: ['Sarah K.'] },
      },
    },
    {
      kind: 'block',
      block: {
        id: 'b2', name: 'User Interviews', type: 'doc', thumbnail: '',
        completed: true,
        assignee: { name: 'James L.', initials: 'JL' },
        approval: { status: 'approved', assignees: ['James L.'] },
      },
    },
    {
      kind: 'group',
      group: {
        id: 'g1',
        name: 'Cork concepts',
        blocks: [
          { id: 'b3', name: 'Cork sketches', type: 'sketch', thumbnail: '' },
          {
            id: 'b4', name: 'Sketches R2', type: 'sketch', thumbnail: '',
            dateRange: { start: 'Apr, 02', end: 'Apr, 03' },
          },
        ],
      },
    },
    {
      kind: 'block',
      block: {
        id: 'b5', name: 'Pattern board', type: 'board', thumbnail: '',
        dateRange: { start: 'Mar, 31', end: 'Apr, 01' },
        assignee: { name: 'Alex M.', initials: 'AM' },
      },
    },
    {
      kind: 'block',
      block: { id: 'b6', name: 'Material board', type: 'board', thumbnail: '' },
    },
  ],
};
