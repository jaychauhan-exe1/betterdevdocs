"use client";

import React, { useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Play, Send, RotateCcw, Copy, Check, Terminal, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VSCodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  fileName?: string;
  language?: string;
  onRun?: () => void;
  onSubmit?: () => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
  onReset?: () => void;
  readOnly?: boolean;
  minHeight?: string;
}

export default function VSCodeEditor({
  value,
  onChange,
  fileName = "solution.js",
  language,
  onRun,
  onSubmit,
  isRunning = false,
  isSubmitting = false,
  onReset,
  readOnly = false,
  minHeight = "360px",
}: VSCodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const effectiveLanguage =
    language ||
    (fileName.endsWith(".html") ? "html" : fileName.endsWith(".css") ? "css" : "javascript");

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Define custom dark theme matching the website palette
    monaco.editor.defineTheme("devdocs-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "569cd6", fontStyle: "bold" },
        { token: "string", foreground: "ce9178" },
        { token: "number", foreground: "b5cea8" },
        { token: "comment", foreground: "6a9955", fontStyle: "italic" },
        { token: "function", foreground: "dcdcaa" },
        { token: "tag", foreground: "569cd6" },
        { token: "attribute.name", foreground: "9cdcfe" },
        { token: "attribute.value", foreground: "ce9178" },
      ],
      colors: {
        "editor.background": "#0a0a0a",
        "editor.foreground": "#e4e4e7",
        "editor.lineHighlightBackground": "#18181b",
        "editorLineNumber.foreground": "#52525b",
        "editorLineNumber.activeForeground": "#f4f4f5",
        "editorIndentGuide.background": "#27272a",
        "editorIndentGuide.activeBackground": "#52525b",
        "editorCursor.foreground": "#ffffff",
      },
    });

    monaco.editor.setTheme("devdocs-dark");

    // Register Ctrl+Enter / Cmd+Enter shortcut for Run
    if (onRun) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        onRun();
      });
    }

    // Register Ctrl+Shift+Enter / Cmd+Shift+Enter shortcut for Submit
    if (onSubmit) {
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
        () => {
          onSubmit();
        }
      );
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card overflow-hidden flex flex-col shadow-lg">
      {/* Sleek Header Controls matching Website Design */}
      <div className="px-2.5 sm:px-4 py-2 bg-secondary/40 border-b border-border/80 flex items-center justify-between gap-2 select-none min-w-0">
        {/* File Name Label */}
        <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs text-foreground font-semibold min-w-0 shrink">
          <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
          <span className="truncate max-w-[90px] xs:max-w-[130px] sm:max-w-none">{fileName}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-muted-foreground hover:text-foreground h-7 px-1.5 sm:px-2 gap-1 font-medium"
              title="Reset Code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-xs text-muted-foreground hover:text-foreground h-7 px-1.5 sm:px-2 gap-1 font-medium"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>

          {onRun && (
            <Button
              onClick={onRun}
              disabled={isRunning || isSubmitting}
              className="bg-secondary hover:bg-secondary/80 text-foreground border border-border/80 font-semibold text-xs h-7 px-2 sm:px-3 gap-1 sm:gap-1.5 rounded-lg shadow-sm"
              title="Run Code (Ctrl + Enter)"
            >
              {isRunning ? (
                <div className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current text-foreground" />
              )}
              <span className="hidden xs:inline">Run</span>
            </Button>
          )}

          {onSubmit && (
            <Button
              onClick={onSubmit}
              disabled={isRunning || isSubmitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs h-7 px-2.5 sm:px-3.5 gap-1 sm:gap-1.5 rounded-lg shadow-sm"
              title="Submit Solution (Ctrl + Shift + Enter)"
            >
              {isSubmitting ? (
                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Submit</span>
            </Button>
          )}
        </div>
      </div>

      {/* Monaco Editor Canvas */}
      <div className="w-full relative bg-[#0a0a0a]" style={{ height: minHeight }}>
        <Editor
          height={minHeight}
          language={effectiveLanguage}
          theme="vs-dark"
          value={value}
          onChange={(val) => onChange(val || "")}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            fontSize: 13,
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            cursorBlinking: "smooth",
            lineNumbers: "on",
            padding: { top: 12, bottom: 12 },
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            folding: true,
            bracketPairColorization: { enabled: true },
            formatOnType: true,
          }}
        />
      </div>

      {/* Subtle Bottom Status Bar matching Website Palette */}
      <div className="px-4 py-1 bg-secondary/30 border-t border-border/60 text-muted-foreground text-[11px] font-mono flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
          <span>JavaScript</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          {onRun && <span className="hidden sm:inline">Ctrl + Enter: Run</span>}
          {onSubmit && <span className="hidden sm:inline">Ctrl + Shift + Enter: Submit</span>}
        </div>
      </div>
    </div>
  );
}
