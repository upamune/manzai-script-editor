import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Line as LineComponent } from './Line';
import { Heading } from './Heading';
import type { Script, Block } from '@/types/script';

interface EditorProps {
  script: Script;
  onUpdateBlock: (blockId: string, content: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onToggleRole: (blockId: string) => void;
  onReorderBlocks: (blocks: Block[]) => void;
}

export function Editor({
  script,
  onUpdateBlock,
  onDeleteBlock,
  onToggleRole,
  onReorderBlocks,
}: EditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = script.blocks.findIndex((block) => block.id === active.id);
      const newIndex = script.blocks.findIndex((block) => block.id === over.id);
      onReorderBlocks(arrayMove(script.blocks, oldIndex, newIndex));
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={script.blocks.map(block => block.id)}
          strategy={verticalListSortingStrategy}
        >
          {script.blocks.map((block, index) => 
            block.type === 'line' ? (
              <LineComponent
                key={block.id}
                line={block}
                index={index}
                onUpdate={(content) => onUpdateBlock(block.id, content)}
                onDelete={() => onDeleteBlock(block.id)}
                onToggleRole={() => onToggleRole(block.id)}
              />
            ) : (
              <Heading
                key={block.id}
                heading={block}
                onUpdate={(content) => onUpdateBlock(block.id, content)}
                onDelete={() => onDeleteBlock(block.id)}
              />
            )
          )}
        </SortableContext>
      </DndContext>
      {script.blocks.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          台詞または見出しを追加してください
        </div>
      )}
    </div>
  );
}
