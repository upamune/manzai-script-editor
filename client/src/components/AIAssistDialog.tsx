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
import { type Script } from "@/types/script";
import { Loader2 } from "lucide-react";

interface AIAssistDialogProps {
  script: Script;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ASSIST_TYPES = {
  analyze: {
    label: "台本の分析",
    prompt: (script: Script) => `
以下の漫才台本を分析して、改善点やアドバイスを提案してください：

タイトル：${script.title}

${script.blocks
  .filter(block => block.type === 'line')
  .map(block => `${block.role === 'boke' ? 'ボケ' : 'ツッコミ'}: ${block.content}`)
  .join('\n')}

以下の観点から分析してください：
1. ボケとツッコミのバランス
2. 話の展開とテンポ
3. 笑いのポイント
4. 改善できる点
`,
  },
  character: {
    label: "キャラクター分析",
    prompt: (script: Script) => `
以下の漫才台本からボケとツッコミのキャラクター性を分析し、より魅力的なキャラクター作りのアドバイスをしてください：

タイトル：${script.title}

${script.blocks
  .filter(block => block.type === 'line')
  .map(block => `${block.role === 'boke' ? 'ボケ' : 'ツッコミ'}: ${block.content}`)
  .join('\n')}

以下の観点から分析・提案してください：
1. 現在のボケ役の特徴と個性
2. 現在のツッコミ役の特徴と個性
3. キャラクター性を活かした台詞の例
4. より魅力的なキャラクター作りのアドバイス
5. 掛け合いの相性を高める方法
`,
  },
  timing: {
    label: "笑いのタイミング",
    prompt: (script: Script) => `
以下の漫才台本の笑いのタイミングを分析し、より効果的な間の取り方やテンポの改善案を提案してください：

タイトル：${script.title}

${script.blocks
  .filter(block => block.type === 'line')
  .map(block => `${block.role === 'boke' ? 'ボケ' : 'ツッコミ'}: ${block.content}`)
  .join('\n')}

以下の観点から分析・提案してください：
1. 現在の笑いのタイミング
2. 間の取り方の改善点
3. テンポの調整が必要な箇所
4. 効果的な間の作り方の具体例
5. 観客の反応を意識したタイミング調整
`,
  },
  rhythm: {
    label: "台詞のリズム改善",
    prompt: (script: Script) => `
以下の漫才台本の台詞のリズムを分析し、より心地よい掛け合いになるよう改善案を提案してください：

タイトル：${script.title}

${script.blocks
  .filter(block => block.type === 'line')
  .map(block => `${block.role === 'boke' ? 'ボケ' : 'ツッコミ'}: ${block.content}`)
  .join('\n')}

以下の観点から分析・提案してください：
1. 現在の台詞の長さとリズム
2. 語尾やフレーズの使い方
3. リズムの良い掛け合いの例
4. 音の響きやリズムの改善点
5. テンポ感を意識した台詞の組み立て方
`,
  },
  similar: {
    label: "類似ネタの提案",
    prompt: (script: Script) => `
以下の漫才台本の内容や特徴を活かした、新しいネタのアイデアを3つ提案してください：

タイトル：${script.title}

${script.blocks
  .filter(block => block.type === 'line')
  .map(block => `${block.role === 'boke' ? 'ボケ' : 'ツッコミ'}: ${block.content}`)
  .join('\n')}

各提案について：
1. ネタの概要
2. 現在の台本との共通点
3. 展開のポイント
4. 具体的な台詞例
5. 予想される笑いのポイント
を含めて説明してください。
`,
  },
  improve: {
    label: "台詞の改善案",
    prompt: (script: Script) => `
以下の漫才台本の台詞をより面白くするための具体的な改善案を提案してください：

タイトル：${script.title}

${script.blocks
  .filter(block => block.type === 'line')
  .map(block => `${block.role === 'boke' ? 'ボケ' : 'ツッコミ'}: ${block.content}`)
  .join('\n')}

以下の点に注意して改善案を提示してください：
1. オリジナルの雰囲気を保ちながら
2. より鋭いボケや切れのあるツッコミに
3. 具体的な台詞の例を含めて
4. 言葉選びやフレーズの工夫
5. インパクトのある表現方法
`,
  },
  boke: {
    label: "ボケの強化",
    prompt: (script: Script) => `
以下の漫才台本のボケをより面白くするための具体的な強化案を提案してください：

タイトル：${script.title}

${script.blocks
  .filter(block => block.type === 'line')
  .map(block => `${block.role === 'boke' ? 'ボケ' : 'ツッコミ'}: ${block.content}`)
  .join('\n')}

以下の観点から提案してください：
1. 現在のボケの特徴と効果
2. ボケの種類（言葉遊び、例え、ズレ等）の分析
3. より強いインパクトを与えるボケの例
4. 意外性を高める工夫
5. ツッコミを引き出しやすいボケの作り方
`,
  },
  suggest: {
    label: "展開の提案",
    prompt: (script: Script) => `
以下の漫才台本の続きとして、面白い展開を3つ提案してください：

タイトル：${script.title}

${script.blocks
  .filter(block => block.type === 'line')
  .map(block => `${block.role === 'boke' ? 'ボケ' : 'ツッコミ'}: ${block.content}`)
  .join('\n')}

それぞれの提案について：
1. どのように展開するか
2. なぜその展開が面白いと考えられるか
3. 具体的な台詞の例
4. 予想される観客の反応
5. クライマックスの作り方
を含めて説明してください。
`,
  },
};

export function AIAssistDialog({ script, open, onOpenChange }: AIAssistDialogProps) {
  const [assistType, setAssistType] = useState<keyof typeof ASSIST_TYPES>("analyze");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { generateText } = useGemini();
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const prompt = ASSIST_TYPES[assistType].prompt(script);
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
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>AIアシスト</DialogTitle>
          <DialogDescription>
            Google Gemini AIを使って台本の改善をサポートします
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 flex-shrink-0 border-b">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">アシストの種類</label>
              <Select value={assistType} onValueChange={(value) => setAssistType(value as keyof typeof ASSIST_TYPES)}>
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
                "生成"
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
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
