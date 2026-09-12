"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Terminal, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";

import VSCodeEditor from "@/components/VSCodeEditor";

interface CodePlaygroundProps {
  initialCode: string;
  title: string;
}

export default function CodePlayground({ initialCode, title }: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

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

  return (
    <Card className="bg-card border-border overflow-hidden shadow-2xl font-normal">
      {/* Playground Header */}
      <div className="px-5 py-4 bg-secondary/40 border-b border-border flex items-center justify-between font-normal">
        <div className="flex items-center gap-2.5 font-normal">
          <Terminal className="w-5 h-5 text-foreground" />
          <span className="text-sm font-semibold text-foreground uppercase tracking-wider">{title}</span>
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border font-normal">
        {/* Code Input — VS Code Editor (7 cols) */}
        <div className="lg:col-span-7 p-4 bg-background font-normal">
          <VSCodeEditor
            value={code}
            onChange={setCode}
            fileName="example.js"
            onRun={handleRunCode}
            onReset={() => {
              setCode(initialCode);
              setOutput([]);
            }}
            minHeight="320px"
          />
        </div>

        {/* Console Output (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-background text-sm flex flex-col justify-between font-normal">
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
