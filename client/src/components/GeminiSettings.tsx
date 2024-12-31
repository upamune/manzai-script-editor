import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";

const GEMINI_API_KEY_STORAGE_KEY = "gemini-api-key";
const GEMINI_MODEL_STORAGE_KEY = "gemini-model";
const DEFAULT_MODEL = "gemini-1.5-flash";

interface GeminiSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GeminiSettings({ open, onOpenChange }: GeminiSettingsProps) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);

  useEffect(() => {
    const savedApiKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY) || "";
    const savedModel = localStorage.getItem(GEMINI_MODEL_STORAGE_KEY) || DEFAULT_MODEL;
    setApiKey(savedApiKey);
    setModel(savedModel);
  }, []);

  const handleSave = () => {
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, apiKey);
    localStorage.setItem(GEMINI_MODEL_STORAGE_KEY, model);
    // storage イベントは他のウィンドウでのみ発火するため、手動でイベントを発火
    window.dispatchEvent(new StorageEvent('storage', {
      key: GEMINI_API_KEY_STORAGE_KEY,
    }));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Google Gemini APIの設定</DialogTitle>
          <DialogDescription>
            Google GeminiのAPIキーとモデルを設定します。
            設定はブラウザのローカルストレージに保存されます。
            <div className="mt-2">
              <a
                href="https://aistudio.google.com/app/apikey?hl=ja"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                APIキーを作成する →
              </a>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">APIキー</label>
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              placeholder="Google Gemini APIキー"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">モデル</label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gemini-1.5-flash"
            />
            <p className="text-xs text-muted-foreground">
              デフォルト: gemini-1.5-flash
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
