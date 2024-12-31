import { Button } from "@/components/ui/button";
import {
  Download,
  Upload,
  Plus,
  Undo2,
  Redo2,
  Eye,
  FilePlus,
  AlignLeft,
  Wand2,
  HelpCircle,
  Settings,
  Heading2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Script } from '@/types/script';
import { ShortcutHelpDialog } from "./ShortcutHelpDialog";
import { GeminiSettings } from "./GeminiSettings";
import { AIAssistDialog } from "./AIAssistDialog";
import { useGemini } from "@/hooks/useGemini";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

interface ActionBarProps {
  script: Script;
  onImport: (script: Script) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onAddLine: () => void;
  onNewScript: () => void;
  onFormat: () => void;
  onAddHeading: () => void;
  onAddHeading: () => void;
}

export function ActionBar({
  script,
  onImport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onAddLine,
  onNewScript,
  onFormat,
  onAddHeading,
}: ActionBarProps) {
  const { toast } = useToast();

  const handleExport = () => {
    const exportData = {
      title: script.title,
      blocks: script.blocks.map(block => ({
        type: block.type,
        content: block.content,
        ...(block.type === 'line' ? { role: block.role } : {})
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${script.title || "台本"}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "エクスポート完了",
      description: "台本をJSONファイルとしてダウンロードしました",
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string) as {
            title: string;
            blocks: Array<{ type: 'line' | 'heading'; content: string; role?: 'boke' | 'tsukkomi' }>;
          };
          
          if (!importData.title || !Array.isArray(importData.blocks)) {
            throw new Error("Invalid file format");
          }

        const currentTime = new Date().toISOString();
        const newScript: Script = {
          id: crypto.randomUUID(),
          title: importData.title,
          blocks: importData.blocks.map(block => ({
            id: crypto.randomUUID(),
            type: block.type,
            content: block.content,
            ...(block.type === 'line' ? { role: block.role! } : {})
          })),
          createdAt: currentTime,
          updatedAt: currentTime
        };

        onImport(newScript);
        toast({
          title: "インポート完了",
          description: "台本を読み込みました",
        });
      } catch (error) {
        toast({
          title: "エラー",
          description: "ファイルの形式が正しくありません",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const [, setLocation] = useLocation();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [geminiSettingsOpen, setGeminiSettingsOpen] = useState(false);
  const { isReady: isGeminiReady } = useGemini();

  const TooltipButton = ({ icon: Icon, label, ...props }: { icon: any, label: string } & React.ComponentProps<typeof Button>) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" {...props}>
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="flex items-center gap-1 p-1 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <AlertDialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>新規台本の作成</AlertDialogTitle>
            <AlertDialogDescription>
              現在の台本は保存されていますが、新しい台本を作成すると編集中の内容は失われます。
              続行しますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onNewScript();
                setShowNewDialog(false);
              }}
            >
              新規作成
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TooltipButton
        icon={FilePlus}
        label="新規作成"
        onClick={() => setShowNewDialog(true)}
      />

      <TooltipButton
        icon={Undo2}
        label="元に戻す"
        onClick={() => onUndo()}
        disabled={!canUndo}
      />
      
      <TooltipButton
        icon={Redo2}
        label="やり直す"
        onClick={() => onRedo()}
        disabled={!canRedo}
      />

      <div className="flex-1" />

      <div className="flex gap-1">
        <TooltipButton
          icon={Plus}
          label="台詞を追加"
          onClick={() => onAddLine()}
        />
        <TooltipButton
          icon={Heading2}
          label="見出しを追加"
          onClick={onAddHeading}
        />
      </div>

      <TooltipButton
        icon={Download}
        label="エクスポート"
        onClick={handleExport}
      />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" asChild>
              <label>
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>インポート</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipButton
        icon={Eye}
        label="プレビュー"
        onClick={() => setLocation("/preview")}
      />

      <div className="border-l mx-1 h-4" />

      <TooltipButton
        icon={AlignLeft}
        label="フォーマット"
        onClick={onFormat}
      />

      <TooltipButton
        icon={HelpCircle}
        label="ショートカット"
        onClick={() => setHelpDialogOpen(true)}
      />

      <ShortcutHelpDialog
        open={helpDialogOpen}
        onOpenChange={setHelpDialogOpen}
      />

      <div className="border-l mx-1 h-4" />

      <TooltipButton
        icon={Settings}
        label="Gemini設定"
        onClick={() => setGeminiSettingsOpen(true)}
      />

      <GeminiSettings
        open={geminiSettingsOpen}
        onOpenChange={setGeminiSettingsOpen}
      />

      {isGeminiReady && (
        <>
          <TooltipButton
            icon={Wand2}
            label="AIアシスト"
            onClick={() => setShowAIDialog(true)}
          />
          <AIAssistDialog
            script={script}
            open={showAIDialog}
            onOpenChange={setShowAIDialog}
          />
        </>
      )}
    </div>
  );
}