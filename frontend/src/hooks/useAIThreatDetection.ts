"use client";

import { useState, useRef, useCallback } from "react";

interface ThreatResult {
  sentiment: { label: string; score: number };
  triggers: string[];
  urgencyScore: number;
  fearScore: number;
  authorityScore: number;
  totalScore: number;
  threatLevel: "safe" | "caution" | "danger";
}

export function useAIThreatDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ThreatResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const analyze = useCallback(async (text: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      if (!workerRef.current) {
        workerRef.current = new Worker(
          new URL("../lib/ai/worker.js", import.meta.url),
          { type: "module" }
        );
      }

      const worker = workerRef.current;

      const response = await new Promise<ThreatResult>((resolve, reject) => {
        const id = Date.now().toString();

        const handler = (event: MessageEvent) => {
          if (event.data.id === id) {
            worker.removeEventListener("message", handler);
            if (event.data.error) {
              reject(new Error(event.data.error));
            } else {
              resolve(event.data.result);
            }
          }
        };

        worker.addEventListener("message", handler);
        worker.postMessage({ id, text });

        setTimeout(() => {
          worker.removeEventListener("message", handler);
          reject(new Error("Analysis timeout"));
        }, 30000);
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { analyze, isAnalyzing, result, error, reset };
}
