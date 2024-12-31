import { useState, useEffect, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY_STORAGE_KEY = "gemini-api-key";
const GEMINI_MODEL_STORAGE_KEY = "gemini-model";
const DEFAULT_MODEL = "gemini-1.5-flash";

export function useGemini() {
  const [client, setClient] = useState<GoogleGenerativeAI | null>(null);
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const [error, setError] = useState<string | null>(null);

  const initializeClient = useCallback(() => {
    const apiKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
    const savedModel = localStorage.getItem(GEMINI_MODEL_STORAGE_KEY) || DEFAULT_MODEL;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        setClient(genAI);
        setModel(savedModel);
        setError(null);
      } catch (e) {
        setError("APIクライアントの初期化に失敗しました");
        setClient(null);
      }
    } else {
      setError("APIキーが設定されていません");
      setClient(null);
    }
  }, []);

  // 初期化時に実行
  useEffect(() => {
    initializeClient();
  }, [initializeClient]);

  // ストレージの変更を監視
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === GEMINI_API_KEY_STORAGE_KEY || e.key === GEMINI_MODEL_STORAGE_KEY) {
        initializeClient();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [initializeClient]);

  const generateText = async (prompt: string): Promise<string> => {
    if (!client) {
      throw new Error("APIクライアントが初期化されていません");
    }

    try {
      const genModel = client.getGenerativeModel({ model });
      const result = await genModel.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`テキスト生成に失敗しました: ${e.message}`);
      }
      throw new Error("テキスト生成に失敗しました");
    }
  };

  return {
    client,
    model,
    error,
    generateText,
    isReady: !!client && !error,
    reloadClient: initializeClient,
  };
}
