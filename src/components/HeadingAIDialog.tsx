import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGemini } from "@/hooks/useGemini";
import { useToast } from "@/hooks/use-toast";
import { type HeadingBlock } from "@/types/script";
import { Loader2 } from "lucide-react";

interface HeadingAIDialogProps {
  heading: HeadingBlock;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (content: string) => void;
}

const ASSIST_TYPES = {
  structure: {
    label: "展開の整理",
    prompt: (heading: HeadingBlock) => `
現在の見出し「${heading.content}」から、この場面の展開を整理してください。

以下の観点から分析・提案してください：
1. この場面で扱うべき要素
2. 展開の順序
3. 盛り上がりのポイント
4. 場面転換のタイミング

具体的な展開プランを提案してください。
`,
  },
  theme: {
    label: "テーマ展開",
    prompt: (heading: HeadingBlock) => `
見出し「${heading.content}」のテーマをより魅力的に展開する方法を提案してください。

以下の観点から3つの提案をしてください：
1. テーマの掘り下げ方
2. 観客の興味を引く切り口
3. 予想外の展開
4. 印象に残るエピソード

それぞれの提案について、なぜ効果的かも説明してください。
`,
  },
  transition: {
    label: "場面転換",
    prompt: (heading: HeadingBlock) => `
見出し「${heading.content}」への場面転換をスムーズにする方法を提案してください。

以下の観点から分析・提案してください：
1. 前の場面からの繋ぎ方
2. 新しい場面の導入方法
3. テンポの変化
4. 観客の注目の集め方

具体的な台詞の例も含めて提案してください。
`,
  },
  climax: {
    label: "クライマックス作り",
    prompt: (heading: HeadingBlock) => `
見出し「${heading.content}」をクライマックスとして盛り上げる方法を提案してください。

以下の観点から分析・提案してください：
1. 盛り上がりのポイント
2. 伏線の回収
3. サプライズ要素
4. 印象的な締め方

具体的な展開プランを提示してください。
`,
  },
};

export function HeadingAIDialog({
  heading,
  open,
  onOpenChange,
  onUpdate,
}: HeadingAIDialogProps) {
  const [assistType, setAssistType] = useState<keyof typeof ASSIST_TYPES>("structure");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { generateText } = useGemini();
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const prompt = ASSIST_TYPES[assistType].prompt(heading);
      const response = await generateText(prompt);
      setResult(response);
    } catch (error) {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "AIアシストの生成に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>AI見出しアシスト</DialogTitle>
          <DialogDescription>
            選択した見出しの展開案を提案します
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 flex-shrink-0 border-b">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">アシストの種類</label>
              <Select
                value={assistType}
                onValueChange={(value) => setAssistType(value as keyof typeof ASSIST_TYPES)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSIST_TYPES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-2">選択中の見出し：</div>
              <div className="text-sm">{heading.content}</div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                "提案を生成"
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">AI分析を実行中...</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md shadow-sm">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{result}</pre>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    const firstLine = result.split('\n')[0].trim();
                    if (firstLine) {
                      onUpdate(firstLine);
                      toast({
                        title: "見出しを更新しました",
                        description: "最初の行を適用しました",
                      });
                    }
                  }}
                >
                  最初の提案を適用
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
