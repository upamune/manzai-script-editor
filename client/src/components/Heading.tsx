import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, X, Wand2 } from 'lucide-react';
import type { HeadingBlock } from '@/types/script';
import { useState } from 'react';
import { HeadingAIDialog } from './HeadingAIDialog';
import { useGemini } from '@/hooks/useGemini';

interface HeadingProps {
  heading: HeadingBlock;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}

export function Heading({ heading, onUpdate, onDelete }: HeadingProps) {
  const [showAIDialog, setShowAIDialog] = useState(false);
  const { isReady: isGeminiReady } = useGemini();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: heading.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 mb-2 group"
    >
      <div
        {...attributes}
        {...listeners}
        className="mt-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        value={heading.content}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="見出しを入力..."
        className="flex-1 font-bold text-lg"
      />
      {isGeminiReady && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAIDialog(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Wand2 className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </Button>
      {showAIDialog && (
        <HeadingAIDialog
          heading={heading}
          open={showAIDialog}
          onOpenChange={setShowAIDialog}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
