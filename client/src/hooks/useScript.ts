import { useState, useCallback } from 'react';
import type { Script, Block, Role } from '@/types/script';
import { createNewLine, createNewHeading, STORAGE_KEY } from '@/types/script';

export function useScript(initialScript: Script) {
  const [script, setScript] = useState<Script>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.blocks && Array.isArray(parsed.blocks)) {
          return parsed;
        }
      } catch (error) {
        console.error('Failed to load saved script:', error);
      }
    }
    return initialScript;
  });
  const [history, setHistory] = useState<Script[]>([script]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = useCallback((newScript: Script) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newScript]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const updateScript = useCallback((updates: Partial<Script>) => {
    const newScript = {
      ...script,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setScript(newScript);
    addToHistory(newScript);
  }, [script, addToHistory]);

  const addLine = useCallback(() => {
    const lastLineBlock = script.blocks
      .filter(block => block.type === 'line')
      .pop();
    const role: Role = !lastLineBlock || lastLineBlock.role === 'tsukkomi'
      ? 'boke'
      : 'tsukkomi';
    const newLine = createNewLine(role);
    updateScript({ blocks: [...script.blocks, newLine] });
  }, [script, updateScript]);

  const addHeading = useCallback(() => {
    const newHeading = createNewHeading();
    updateScript({ blocks: [...script.blocks, newHeading] });
  }, [script, updateScript]);

  const updateBlock = useCallback((blockId: string, content: string) => {
    const newBlocks = script.blocks.map(block =>
      block.id === blockId ? { ...block, content } : block
    );
    updateScript({ blocks: newBlocks });
  }, [script, updateScript]);

  const deleteBlock = useCallback((blockId: string) => {
    const newBlocks = script.blocks.filter(block => block.id !== blockId);
    updateScript({ blocks: newBlocks });
  }, [script, updateScript]);

  const toggleRole = useCallback((blockId: string) => {
    const newBlocks = script.blocks.map(block =>
      block.id === blockId && block.type === 'line'
        ? { ...block, role: block.role === 'boke' ? 'tsukkomi' as const : 'boke' as const }
        : block
    );
    updateScript({ blocks: newBlocks });
  }, [script, updateScript]);

  const updateTitle = useCallback((title: string) => {
    updateScript({ title });
  }, [updateScript]);

  const reorderBlocks = useCallback((newBlocks: Block[]) => {
    updateScript({ blocks: newBlocks });
  }, [updateScript]);

  const formatScript = useCallback(() => {
    const formattedBlocks = script.blocks.map(block => ({
      ...block,
      content: block.content.trim()
    }));
    updateScript({ blocks: formattedBlocks });
  }, [script, updateScript]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setScript(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setScript(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  return {
    script,
    setScript,
    addLine,
    addHeading,
    updateBlock,
    deleteBlock,
    toggleRole,
    updateTitle,
    reorderBlocks,
    undo,
    redo,
    formatScript,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}
