import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Eye, ArrowLeft, Printer } from "lucide-react";
import type { Script } from '@/types/script';
import { STORAGE_KEY } from '@/types/script';

export function Preview() {
  const [, setLocation] = useLocation();
  const savedScript = localStorage.getItem(STORAGE_KEY);
  const script: Script = savedScript ? JSON.parse(savedScript) : null;

  if (!script) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">台本が見つかりません</p>
          <Button onClick={() => setLocation("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            エディタに戻る
          </Button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen">
      {/* ヘッダー（印刷時は非表示） */}
      <div className="border-b p-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            エディタに戻る
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            印刷
          </Button>
        </div>
      </div>

      {/* 本文 */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8 print:mb-12">
          <h1 className="text-3xl font-bold mb-2">{script.title}</h1>
          <div className="text-sm text-muted-foreground">
            作成日: {new Date(script.createdAt).toLocaleDateString()}
            {script.updatedAt !== script.createdAt && 
              ` / 更新日: ${new Date(script.updatedAt).toLocaleDateString()}`
            }
          </div>
        </div>

        <div className="space-y-6">
          {script.blocks.map((block) => (
            block.type === 'heading' ? (
              <h2 key={block.id} className="text-xl font-bold mt-8 mb-4 print:break-inside-avoid">
                {block.content}
              </h2>
            ) : (
              <div key={block.id} className="flex gap-4 print:break-inside-avoid">
                <div className={`w-24 flex-shrink-0 font-medium ${
                  block.role === 'boke' ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {block.role === 'boke' ? 'ボケ' : 'ツッコミ'}
                </div>
                <div className="flex-1">{block.content}</div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}