import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

interface ShortcutHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutHelpDialog({ open, onOpenChange }: ShortcutHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>キーボードショートカット</DialogTitle>
          <DialogDescription>
            エディタで使用できるキーボードショートカットの一覧です。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm text-muted-foreground">
              元に戻す
            </div>
            <div className="text-sm">
              <kbd className="px-2 py-1 bg-muted rounded">Ctrl/⌘</kbd> + <kbd className="px-2 py-1 bg-muted rounded">Z</kbd>
            </div>
            <div className="text-sm text-muted-foreground">
              やり直す
            </div>
            <div className="text-sm">
              <kbd className="px-2 py-1 bg-muted rounded">Ctrl/⌘</kbd> + <kbd className="px-2 py-1 bg-muted rounded">Shift</kbd> + <kbd className="px-2 py-1 bg-muted rounded">Z</kbd>
            </div>
            <div className="text-sm text-muted-foreground">
              台詞を追加
            </div>
            <div className="text-sm">
              <kbd className="px-2 py-1 bg-muted rounded">Ctrl/⌘</kbd> + <kbd className="px-2 py-1 bg-muted rounded">Enter</kbd>
            </div>
            <div className="text-sm text-muted-foreground">
              見出しを追加
            </div>
            <div className="text-sm">
              <kbd className="px-2 py-1 bg-muted rounded">Ctrl/⌘</kbd> + <kbd className="px-2 py-1 bg-muted rounded">Shift</kbd> + <kbd className="px-2 py-1 bg-muted rounded">H</kbd>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
