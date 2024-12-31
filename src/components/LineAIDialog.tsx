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
import { type Line } from "@/types/script";
import { Loader2 } from "lucide-react";

interface LineAIDialogProps {
  line: Line;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (content: string) => void;
}

const ASSIST_TYPES = {
  improve: {
    label: "台詞の改善",
    prompt: (line: Line) => `
以下の漫才の台詞を、より面白く、より効果的な表現に改善してください：

役割：${line.role === 'boke' ? 'ボケ' : 'ツッコミ'}
台詞：${line.content}

以下の観点から3つの改善案を提案してください：
1. より鋭いボケや切れのあるツッコミに
2. リズムやテンポを考慮
3. キャラクター性を活かした表現
4. 観客の反応を意識した言い回し

それぞれの案について、なぜその改善が効果的かも説明してください。
`,
  },
  variations: {
    label: "バリエーション提案",
    prompt: (line: Line) => `
以下の漫才の台詞の別バージョンを3つ提案してください：

役割：${line.role === 'boke' ? 'ボケ' : 'ツッコミ'}
台詞：${line.content}

以下の点を考慮して、異なるアプローチの台詞を提案してください：
1. 異なる言い回し
2. 異なるニュアンス
3. 異なる強さや表現方法

それぞれの案について、どのような効果が期待できるかも説明してください。
`,
  },
  timing: {
    label: "間とテンポ",
    prompt: (line: Line) => `
以下の漫才の台詞の間の取り方やテンポについてアドバイスしてください：

役割：${line.role === 'boke' ? 'ボケ' : 'ツッコミ'}
台詞：${line.content}

以下の観点から分析・提案してください：
1. 効果的な間の取り方
2. テンポの調整方法
3. 強調すべき部分
4. 観客の反応を引き出すタイミング

具体的な例を示しながら説明してください。
`,
  },
  character: {
    label: "キャラクター強化",
    prompt: (line: Line) => `
以下の漫才の台詞を、キャラクター性をより強く出す形に改善してください：

役割：${line.role === 'boke' ? 'ボケ' : 'ツッコミ'}
台詞：${line.content}

以下の観点から3つの改善案を提案してください：
1. 個性的な言い回し
2. 特徴的な語尾や口癖
3. 役割（ボケ/ツッコミ）の特性を活かした表現
4. 印象に残る独自の表現方法

それぞれの案について、キャラクター性がどう強化されるかも説明してください。
`,
  },
  punchline: {
    label: "オチの強化",
    prompt: (line: Line) => `
以下の漫才の台詞を、よりインパクトのあるオチとして改善してください：

役割：${line.role === 'boke' ? 'ボケ' : 'ツッコミ'}
台詞：${line.content}

以下の観点から3つの改善案を提案してください：
1. サプライズ要素
2. 期待を裏切る展開
3. 印象に残る表現
4. 笑いを引き出すポイント

それぞれの案について、なぜその改善が効果的なオチになるのか説明してください。
`,
  },
  wordplay: {
    label: "言葉遊びの提案",
    prompt: (line: Line) => `
以下の漫才の台詞に、言葉遊びを取り入れた表現を提案してください：

役割：${line.role === 'boke' ? 'ボケ' : 'ツッコミ'}
台詞：${line.content}

以下の観点から3つの改善案を提案してください：
1. 掛け言葉
2. ダジャレ
3. 語呂合わせ
4. 音の響きを活かした表現

それぞれの案について、どのような言葉遊びを使用し、どんな効果が期待できるか説明してください。
`,
  },
  reaction: {
    label: "リアクション強化",
    prompt: (line: Line) => `
以下の漫才の台詞のリアクションやリアクションの仕方を改善してください：

役割：${line.role === 'boke' ? 'ボケ' : 'ツッコミ'}
台詞：${line.content}

以下の観点から3つの改善案を提案してください：
1. 表情や動きの描写
2. 声の強弱やトーン
3. オーバーリアクション vs 控えめなリアクション
4. 感情表現の多様化

それぞれの案について、なぜそのリアクションが効果的かを説明してください。
`,
  },
};

export function LineAIDialog({
  line,
  open,
  onOpenChange,
  onUpdate,
}: LineAIDialogProps) {
  const [assistType, setAssistType] = useState<keyof typeof ASSIST_TYPES>("improve");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { generateText } = useGemini();
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const prompt = ASSIST_TYPES[assistType].prompt(line);
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
          <DialogTitle>AI台詞アシスト</DialogTitle>
          <DialogDescription>
            選択した台詞の改善案を提案します
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
              <div className="text-sm font-medium mb-2">選択中の台詞：</div>
              <div className="text-sm">
                {line.role === 'boke' ? 'ボケ' : 'ツッコミ'}：{line.content}
              </div>
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
                    const matches = result.match(/「([^」]+)」/g);
                    if (matches && matches.length > 0) {
                      const firstSuggestion = matches[0].slice(1, -1);
                      onUpdate(firstSuggestion);
                      toast({
                        title: "台詞を更新しました",
                        description: "最初の提案を適用しました",
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
