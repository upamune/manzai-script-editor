export type Role = 'boke' | 'tsukkomi';
export type BlockType = 'line' | 'heading';

export interface BaseBlock {
  id: string;
  type: BlockType;
  content: string;
}

export interface LineBlock extends BaseBlock {
  type: 'line';
  role: Role;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
}

export type Block = LineBlock | HeadingBlock;
export type Line = LineBlock;

export interface Script {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

export const STORAGE_KEY = 'manzai-script';

export const createNewScript = (): Script => ({
  id: crypto.randomUUID(),
  title: '無題の台本',
  blocks: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const createNewLine = (role: Role): LineBlock => ({
  id: crypto.randomUUID(),
  type: 'line',
  role,
  content: '',
});

export const createNewHeading = (): HeadingBlock => ({
  id: crypto.randomUUID(),
  type: 'heading',
  content: '',
});
