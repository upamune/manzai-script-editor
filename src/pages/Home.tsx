import { useEffect } from 'react';
import { TitleEditor } from '@/components/TitleEditor';
import { Editor } from '@/components/Editor';
import { ActionBar } from '@/components/ActionBar';
import { Analytics } from '@/components/Analytics';
import { useScript } from '@/hooks/useScript';
import { useAutoSave } from '@/hooks/useAutoSave';
import { createNewScript, STORAGE_KEY } from '@/types/script';
import { useToast } from '@/hooks/use-toast';
import type { Script } from '@/types/script';

export function Home() {
  const { toast } = useToast();
  const {
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
    canUndo,
    canRedo,
    formatScript,
  } = useScript({
    id: crypto.randomUUID(),
    title: '無題の台本',
    blocks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  useAutoSave(script);

  // useScriptフックで初期データのロードを行うため、このeffectは不要になりました

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          addLine();
        } else if (e.key === 'h' || e.key === 'H') {
          if (e.shiftKey) {
            e.preventDefault();
            addHeading();
          }
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, addLine, addHeading]);

  return (
    <div className="flex flex-col h-screen">
      <div className="p-2 sm:p-4 border-b">
        <TitleEditor title={script.title} onUpdate={updateTitle} />
      </div>
      <ActionBar
        script={script}
        onImport={setScript}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onAddLine={addLine}
        onAddHeading={addHeading}
        onNewScript={() => setScript(createNewScript())}
        onFormat={() => {
          formatScript();
          toast({
            title: "フォーマット完了",
            description: "各台詞の不要な空白を削除しました",
          });
        }}
      />
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <div className="flex-1 min-w-0 relative">
          <Editor
            script={script}
            onUpdateBlock={updateBlock}
            onDeleteBlock={deleteBlock}
            onToggleRole={toggleRole}
            onReorderBlocks={reorderBlocks}
          />
        </div>
        <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l overflow-hidden">
          <Analytics script={script} />
        </div>
      </div>
    </div>
  );
}
