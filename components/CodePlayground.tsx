"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Terminal, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";

interface CodePlaygroundProps {
  initialCode: string;
  title: string;
}

export default function CodePlayground({ initialCode, title }: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCode(initialCode);
    setOutput([]);
    setIsError(false);
    setExecutionTime(null);
  }, [initialCode]);

  const handleRunCode = () => {
    const logs: string[] = [];
    setIsError(false);

    const customConsole = {
      log: (...args: unknown[]) => {
        logs.push(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg))).join(" "));
      },
      error: (...args: unknown[]) => {
        logs.push("[ERROR] " + args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg))).join(" "));
      },
      warn: (...args: unknown[]) => {
        logs.push("[WARN] " + args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg))).join(" "));
      },
    };

    const startTime = performance.now();

    try {
      const runFn = new Function("console", "setTimeout", "queueMicrotask", code);
      
      const mockSetTimeout = (fn: Function, delay: number) => {
        return setTimeout(() => {
          try {
            fn();
            setOutput([...logs]);
          } catch (err: any) {
            logs.push("[ASYNC ERROR] " + err.message);
            setOutput([...logs]);
          }
        }, delay);
      };

      runFn(customConsole, mockSetTimeout, queueMicrotask);

      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));

      if (logs.length === 0) {
        logs.push("// Code executed with zero console log statements.");
      }
      setOutput(logs);
    } catch (err: any) {
      setIsError(true);
      logs.push(`Runtime Error: ${err.message}`);
      setOutput(logs);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-card border-border overflow-hidden shadow-2xl font-normal">
      {/* Playground Header */}
      <div className="px-5 py-4 bg-secondary/40 border-b border-border flex items-center justify-between font-normal">
        <div className="flex items-center gap-2.5 font-normal">
          <Terminal className="w-5 h-5 text-foreground" />
          <span className="text-sm font-semibold text-foreground uppercase tracking-wider">{title}</span>
        </div>

        <div className="flex items-center gap-3 font-normal">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCode(initialCode);
              setOutput([]);
            }}
            className="text-xs text-muted-foreground hover:text-foreground font-medium"
            title="Reset Code"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyCode}
            className="text-xs text-muted-foreground hover:text-foreground font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-foreground mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleRunCode}
            className="font-medium text-xs sm:text-sm shadow"
          >
            <Play className="w-4 h-4 fill-current mr-1.5" />
            <span>Run Snippet</span>
          </Button>
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border font-normal">
        {/* Code Input */}
        <div className="p-5 bg-background text-sm sm:text-base font-normal">
          <label className="block text-xs text-muted-foreground uppercase font-semibold tracking-widest mb-3">
            JavaScript Source
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={12}
            className="w-full bg-secondary/30 p-4 rounded-2xl border border-input text-foreground leading-relaxed text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-ring resize-y font-normal"
          />
        </div>

        {/* Console Output */}
        <div className="p-5 bg-background text-sm flex flex-col justify-between font-normal">
          <div>
            <div className="flex items-center justify-between mb-3 font-normal">
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-widest">
                Execution Log
              </span>
              {executionTime !== null && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-normal">
                  {isError ? (
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-foreground" />
                  )}
                  {executionTime}ms
                </span>
              )}
            </div>

            <div className="w-full min-h-[240px] max-h-[340px] overflow-y-auto bg-secondary/30 p-4 rounded-2xl border border-input text-foreground text-sm sm:text-base space-y-2 custom-scrollbar font-normal">
              {output.length === 0 ? (
                <p className="text-muted-foreground italic font-normal">Click "Run Snippet" to view console output here...</p>
              ) : (
                output.map((line, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed whitespace-pre-wrap font-normal ${
                      line.startsWith("[ERROR]") || line.startsWith("Runtime Error")
                        ? "text-muted-foreground underline font-normal"
                        : line.startsWith("//")
                        ? "text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
