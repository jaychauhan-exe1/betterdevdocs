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
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const isHtml = (str: string) => {
    const t = str.trim();
    return (
      t.startsWith("<!DOCTYPE") ||
      t.startsWith("<html") ||
      t.startsWith("<div") ||
      t.startsWith("<form") ||
      t.startsWith("<header") ||
      t.startsWith("<main") ||
      t.startsWith("<section") ||
      t.startsWith("<article") ||
      t.startsWith("<nav") ||
      t.startsWith("<style") ||
      (t.startsWith("<") && t.includes(">") && !t.startsWith("<?"))
    );
  };

  const isCss = (str: string) => {
    const t = str.trim();
    return (
      (t.startsWith("*") || t.startsWith(".") || t.startsWith("#") || t.startsWith(":root") || t.startsWith("@media")) &&
      t.includes("{") &&
      t.includes("}") &&
      !t.includes("function") &&
      !t.includes("const ") &&
      !t.includes("let ")
    );
  };

  const codeLang = isHtml(code) ? "html" : isCss(code) ? "css" : "javascript";
  const fileName = codeLang === "html" ? "index.html" : codeLang === "css" ? "styles.css" : "example.js";

  useEffect(() => {
    setCode(initialCode);
    setOutput([]);
    setPreviewHtml(null);
    setIsError(false);
    setExecutionTime(null);
  }, [initialCode]);

  const handleRunCode = () => {
    const logs: string[] = [];
    setIsError(false);
    const startTime = performance.now();

    if (codeLang === "html") {
      const fullDoc = code.includes("<!DOCTYPE") || code.includes("<html")
        ? code
        : `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body { font-family: system-ui, sans-serif; padding: 1rem; color: #111; background: #fff; }</style></head><body>${code}</body></html>`;
      setPreviewHtml(fullDoc);
      logs.push("// HTML rendered successfully in Live Web Preview.");
      logs.push("Document ready.");
      setExecutionTime(Math.round(performance.now() - startTime));
      setOutput(logs);
      return;
    }

    if (codeLang === "css") {
      const fullDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${code}</style></head><body><div class="card" style="padding:1.5rem; font-family:system-ui, sans-serif;"><h2>CSS Preview Sandbox</h2><p>Sample element styled by your CSS code.</p></div></body></html>`;
      setPreviewHtml(fullDoc);
      logs.push("// CSS styles applied successfully in Live Web Preview.");
      setExecutionTime(Math.round(performance.now() - startTime));
      setOutput(logs);
      return;
    }

    setPreviewHtml(null);
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
        <span className="text-xs text-muted-foreground font-mono uppercase px-2 py-0.5 rounded bg-secondary border border-border">
          {codeLang}
        </span>
      </div>

      {/* Editor & Console Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border font-normal">
        {/* Code Input — VS Code Editor (7 cols) */}
        <div className="lg:col-span-7 p-4 bg-background font-normal">
          <VSCodeEditor
            value={code}
            onChange={setCode}
            fileName={fileName}
            language={codeLang}
            onRun={handleRunCode}
            onReset={() => {
              setCode(initialCode);
              setOutput([]);
              setPreviewHtml(null);
            }}
            minHeight="320px"
          />
        </div>

        {/* Console / Web Preview Output (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-background text-sm flex flex-col justify-between font-normal">
          <div className="space-y-3">
            <div className="flex items-center justify-between font-normal">
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-widest">
                {previewHtml ? "Live Web Preview & Log" : "Execution Log"}
              </span>
              {executionTime !== null && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-normal">
                  {isError ? (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {executionTime}ms
                </span>
              )}
            </div>

            {previewHtml && (
              <div className="w-full rounded-2xl overflow-hidden border border-border bg-white">
                <iframe
                  title="Web Preview"
                  srcDoc={previewHtml}
                  className="w-full h-[180px] bg-white border-none"
                />
              </div>
            )}

            <div className="w-full min-h-[140px] max-h-[280px] overflow-y-auto bg-secondary/30 p-4 rounded-2xl border border-input text-foreground text-sm sm:text-base space-y-2 custom-scrollbar font-normal font-mono">
              {output.length === 0 ? (
                <p className="text-muted-foreground italic font-normal text-xs">
                  Click "Run" to {codeLang === "html" || codeLang === "css" ? "render visual preview" : "view console output"} here...
                </p>
              ) : (
                output.map((line, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed whitespace-pre-wrap font-normal text-xs sm:text-sm ${
                      line.startsWith("[ERROR]") || line.startsWith("Runtime Error")
                        ? "text-rose-400 font-semibold"
                        : line.startsWith("//")
                        ? "text-emerald-400 font-medium"
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
