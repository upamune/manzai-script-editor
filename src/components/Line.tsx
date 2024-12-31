import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GripVertical, X, Wand2 } from 'lucide-react';
import type { Line as LineType } from '@/types/script';
import { useState } from 'react';
import { LineAIDialog } from './LineAIDialog';
import { useGemini } from '@/hooks/useGemini';

interface LineProps {
  line: LineType;
  index: number;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onToggleRole: () => void;
}

export function Line({ line, index, onUpdate, onDelete, onToggleRole }: LineProps) {
  const [showAIDialog, setShowAIDialog] = useState(false);
  const { isReady: isGeminiReady } = useGemini();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: line.id });

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
        className="mt-3 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={`w-24 ${
          line.role === 'boke' ? 'bg-blue-100' : 'bg-red-100'
        }`}
        onClick={onToggleRole}
      >
        {line.role === 'boke' ? 'ボケ' : 'ツッコミ'}
      </Button>
      <Textarea
        value={line.content}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="台詞を入力..."
        className="flex-1 resize-none"
        rows={1}
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
        <LineAIDialog
          line={line}
          open={showAIDialog}
          onOpenChange={setShowAIDialog}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
