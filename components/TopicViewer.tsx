"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOPICS, Topic } from "@/data/topics";
import { useStudyStore } from "@/store/useStudyStore";
import { useUser } from "@clerk/nextjs";
import AuthModal from "./AuthModal";
import CodePlayground from "./CodePlayground";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BookOpen,
  Code,
  Sparkles,
  HelpCircle,
  Clock,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  ArrowLeft,
  StickyNote,
  Trash2,
  Volume2,
  Play,
  Pause,
  Loader2,
  X,
} from "lucide-react";
import { AnimatedCheckmark } from "@/components/AnimatedCheckmark";
import { triggerHaptic } from "@/lib/haptics";

interface TopicViewerProps {
  topic?: Topic;
  allTopics?: Topic[];
  isCompleted?: boolean;
  onToggleComplete?: (topicId: string) => void;
  onSelectTopic?: (topicId: string) => void;
}

// Helper to render **bold** and `code` inline highlights strictly inside explanation text
function renderFormattedText(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-foreground underline decoration-zinc-600 underline-offset-4">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-secondary border border-border text-foreground text-[0.9em] font-normal"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function renderSpeechFormattedText(
  text: string,
  isNarrationActive: boolean,
  activeWordIndex: number | null,
  blockWordStart?: number
) {
  if (!text) return null;

  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  let currentWordIndex = 0;

  return (
    <span>
      {parts.map((part, idx) => {
        const isBold = part.startsWith("**") && part.endsWith("**");
        const isCode = part.startsWith("`") && part.endsWith("`");
        const rawContent = isBold ? part.slice(2, -2) : isCode ? part.slice(1, -1) : part;

        const tokens = rawContent.split(/([\w'-]+)/g);

        const renderedTokens = tokens.map((tok, tokIdx) => {
          if (/[\w'-]+/.test(tok)) {
            const isThisWordActive =
              isNarrationActive &&
              activeWordIndex !== null &&
              blockWordStart !== undefined &&
              currentWordIndex === activeWordIndex - blockWordStart;

            currentWordIndex++;

            if (isThisWordActive) {
              return (
                <span
                  key={tokIdx}
                  ref={(node) => {
                    if (node) {
                      node.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                        inline: "nearest",
                      });
                    }
                  }}
                  className="inline-block bg-transparent text-foreground border border-foreground font-semibold rounded px-1.5 py-0.5 transition-all duration-75 shadow-xs"
                >
                  {tok}
                </span>
              );
            }
            return tok;
          }
          return tok;
        });

        if (isBold) {
          return (
            <strong key={idx} className="font-bold text-foreground underline decoration-zinc-600 underline-offset-4">
              {renderedTokens}
            </strong>
          );
        }

        if (isCode) {
          return (
            <code
              key={idx}
              className="px-1.5 py-0.5 mx-0.5 rounded bg-secondary border border-border text-foreground text-[0.9em] font-normal"
            >
              {renderedTokens}
            </code>
          );
        }

        return <span key={idx}>{renderedTokens}</span>;
      })}
    </span>
  );
}

export default function TopicViewer(props: TopicViewerProps) {
  const storeActiveTopic = useStudyStore((state) => state.getActiveTopic());
  const storeIsCompleted = useStudyStore((state) => state.isTopicCompleted(storeActiveTopic.id));
  const storeMcqAnswers = useStudyStore((state) => state.mcqAnswers[storeActiveTopic.id]);
  const storeSubmittedQuizzes = useStudyStore((state) => state.submittedQuizzes);
  const setTopicMcqAnswers = useStudyStore((state) => state.setTopicMcqAnswers);
  const setQuizSubmittedStore = useStudyStore((state) => state.setQuizSubmitted);
  const toggleTopicComplete = useStudyStore((state) => state.toggleTopicComplete);
  const setActiveTopicId = useStudyStore((state) => state.setActiveTopicId);
  const topicNotes = useStudyStore((state) => state.topicNotes);
  const setTopicNote = useStudyStore((state) => state.setTopicNote);

  const topic = props.topic || storeActiveTopic;
  const allTopics = props.allTopics || TOPICS;
  const isCompleted = props.isCompleted !== undefined ? props.isCompleted : storeIsCompleted;
  const isQuizSubmitted = !!storeSubmittedQuizzes[topic.id];
  const onToggleComplete = props.onToggleComplete || toggleTopicComplete;
  const onSelectTopic = props.onSelectTopic || setActiveTopicId;

  const [activeTab, setActiveTab] = useState<string>("explanation");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // MCQ Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Personal Topic Notes State
  const [noteText, setNoteText] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [copiedNote, setCopiedNote] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Code Sandbox State
  const [sandboxCode, setSandboxCode] = useState<string>(topic.codeExamples?.[0]?.code || "");

  useEffect(() => {
    setUserAnswers(storeMcqAnswers || {});
    setCurrentQuestionIndex(0);
    setSandboxCode(topic.codeExamples?.[0]?.code || "// Write JavaScript code here\nconsole.log('Hello DevDocs');");
  }, [topic.id]);



  const { isSignedIn } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Microsoft Edge Neural TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopCurrentAudio = () => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioRef.current) {
      try {
        audioRef.current.onpause = null;
        audioRef.current.onplay = null;
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {
        // ignore
      }
      audioRef.current = null;
    }
  };

  // Stop speech when topic ID or active tab changes, or component unmounts
  useEffect(() => {
    stopCurrentAudio();
    setIsLoadingAudio(false);
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveWordIndex(null);
  }, [topic.id, activeTab]);

  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, []);

  // Compute speech text payload with word-index tracking & DOM word sequence extraction
  const fullSpeechPayload = useMemo(() => {
    let totalWords = 0;
    const domWords: string[] = [];

    const extractAndCountWords = (txt: string) => {
      const clean = cleanTextForSpeech(txt);
      const matches = clean.match(/[\w'-]+/g) || [];
      matches.forEach((w) => {
        domWords.push(w.toLowerCase().replace(/[^a-z0-9]/g, ""));
      });
      return matches.length;
    };

    const overviewTextWordStart = 0;
    totalWords += extractAndCountWords(topic.explanation.overview);

    const sectionStartIndexes: {
      [key: number]: { headingStart: number; contentStart: number; bulletStarts: number[] };
    } = {};

    topic.explanation.sections.forEach((sec, idx) => {
      const headingStart = totalWords;
      totalWords += extractAndCountWords(sec.heading);

      const contentStart = totalWords;
      totalWords += extractAndCountWords(sec.content);

      const bulletStarts: number[] = [];
      if (sec.bulletPoints) {
        sec.bulletPoints.forEach((bp) => {
          bulletStarts.push(totalWords);
          totalWords += extractAndCountWords(bp);
        });
      }

      sectionStartIndexes[idx] = { headingStart, contentStart, bulletStarts };
    });

    const rawOverview = cleanTextForSpeech(topic.explanation.overview);
    let fullText = `${rawOverview}. `;
    topic.explanation.sections.forEach((sec) => {
      fullText += `${cleanTextForSpeech(sec.heading)}. `;
      fullText += `${cleanTextForSpeech(sec.content)}. `;
      if (sec.bulletPoints) {
        sec.bulletPoints.forEach((bp) => {
          fullText += `${cleanTextForSpeech(bp)}. `;
        });
      }
    });

    return { fullText, overviewTextWordStart, sectionStartIndexes, domWords };
  }, [topic]);

  const handleStartSpeech = async () => {
    if (typeof window === "undefined") return;
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }
    triggerHaptic("medium");

    stopCurrentAudio();
    setIsLoadingAudio(true);
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveWordIndex(null);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fullSpeechPayload.fullText,
          voice: "en-US-GuyNeural",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch MS Edge TTS audio");
      }

      const data = await res.json();
      const { audioBase64, wordBoundaries } = data;

      // Align TTS word boundaries to DOM words sequence to prevent index drift
      const domWords = fullSpeechPayload.domWords;
      let domIdx = 0;
      const alignedBoundaries = (wordBoundaries || []).map(
        (item: { word: string; startMs: number; durationMs: number }) => {
          const rawTtsWord = (item.word || "").toLowerCase().replace(/[^a-z0-9]/g, "");

          if (!rawTtsWord) {
            return { ...item, domIndex: Math.min(domIdx, Math.max(0, domWords.length - 1)) };
          }

          let matchedDomIdx = -1;
          for (let offset = 0; offset <= 4; offset++) {
            if (domIdx + offset < domWords.length) {
              const domW = domWords[domIdx + offset];
              if (domW && (domW === rawTtsWord || domW.includes(rawTtsWord) || rawTtsWord.includes(domW))) {
                matchedDomIdx = domIdx + offset;
                break;
              }
            }
          }

          if (matchedDomIdx !== -1) {
            domIdx = matchedDomIdx + 1;
            return { ...item, domIndex: matchedDomIdx };
          } else {
            return { ...item, domIndex: Math.min(domIdx, Math.max(0, domWords.length - 1)) };
          }
        }
      );

      const audio = new Audio(audioBase64);
      audioRef.current = audio;

      const updateHighlight = () => {
        if (audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
          const currentMs = audioRef.current.currentTime * 1000;
          if (alignedBoundaries && alignedBoundaries.length > 0) {
            let activeIdx = -1;
            for (let i = 0; i < alignedBoundaries.length; i++) {
              if (currentMs >= alignedBoundaries[i].startMs - 20) {
                activeIdx = alignedBoundaries[i].domIndex;
              } else {
                break;
              }
            }
            if (activeIdx >= 0) {
              setActiveWordIndex(activeIdx);
            }
          }
          animFrameRef.current = requestAnimationFrame(updateHighlight);
        }
      };

      audio.onplay = () => {
        setIsLoadingAudio(false);
        setIsSpeaking(true);
        setIsPaused(false);
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
        }
        animFrameRef.current = requestAnimationFrame(updateHighlight);
      };

      audio.onpause = () => {
        setIsSpeaking(false);
        setIsPaused(true);
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
      };

      audio.onended = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveWordIndex(null);
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsLoadingAudio(false);
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveWordIndex(null);
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        audioRef.current = null;
      };

      await audio.play();
      setIsLoadingAudio(false);
      setIsSpeaking(true);
      setIsPaused(false);
    } catch (err) {
      console.error("MS Edge TTS Error:", err);
      setIsLoadingAudio(false);
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveWordIndex(null);
    }
  };

  const handlePauseSpeech = () => {
    triggerHaptic("light");
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsSpeaking(false);
    setIsPaused(true);
  };

  const handleResumeSpeech = () => {
    triggerHaptic("light");
    if (audioRef.current) {
      audioRef.current.play();
      setIsSpeaking(true);
      setIsPaused(false);
    }
  };

  const handleResetSpeech = () => {
    triggerHaptic("medium");
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        setIsSpeaking(true);
        setIsPaused(false);
        setActiveWordIndex(0);
        return;
      } catch (e) {
        // ignore and fallback
      }
    }
    handleStartSpeech();
  };

  const handleStopSpeech = () => {
    triggerHaptic("medium");
    stopCurrentAudio();
    setIsLoadingAudio(false);
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveWordIndex(null);
  };

  useEffect(() => {
    setNoteText(topicNotes[topic.id] || "");
    setIsSaved(true);
    setCopiedNote(false);
    setConfirmClear(false);
  }, [topic.id, topicNotes]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNoteText(value);
    setIsSaved(false);
    setTopicNote(topic.id, value);
    setTimeout(() => setIsSaved(true), 400);
  };

  const handleCopyNote = () => {
    if (!noteText.trim()) return;
    triggerHaptic("light");
    navigator.clipboard.writeText(noteText);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const handleClearNote = () => {
    if (!confirmClear) {
      triggerHaptic("medium");
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    triggerHaptic("medium");
    setNoteText("");
    setTopicNote(topic.id, "");
    setIsSaved(true);
    setConfirmClear(false);
  };

  const currentIndex = allTopics.findIndex((t) => t.id === topic.id);
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSelectOption = (qIdx: number, optionIdx: number) => {
    if (isQuizSubmitted) return;
    triggerHaptic("medium");
    const updated = { ...userAnswers, [qIdx]: optionIdx };
    setUserAnswers(updated);
    setTopicMcqAnswers(topic.id, updated);
  };

  const handleSubmitQuiz = () => {
    triggerHaptic("success");
    setQuizSubmittedStore(topic.id, true);
  };

  const handleRetakeQuiz = () => {
    triggerHaptic("light");
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setQuizSubmittedStore(topic.id, false);
  };

  const calculateScore = () => {
    if (!topic.mcqs) return 0;
    let score = 0;
    topic.mcqs.forEach((mcq, idx) => {
      if (userAnswers[idx] === mcq.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const mcqs = topic.mcqs || [];
  const score = calculateScore();
  const totalQuestions = mcqs.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const answeredCount = Object.keys(userAnswers).length;

  const currentMCQ = mcqs[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <motion.div
      key={topic.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-5xl mx-auto space-y-8 pb-20 font-normal"
    >
      {/* Top Banner Card */}
      <Card className="bg-card border-border shadow-xl relative font-normal">
        <CardHeader className="p-6 sm:p-8 pb-6 font-normal">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 font-normal">
            <div className="space-y-3 font-normal">
              <div className="flex items-center gap-2.5 flex-wrap font-normal">
                <Badge variant="secondary" className="text-xs sm:text-sm py-1 px-3 uppercase tracking-wider font-normal">
                  {topic.category}
                </Badge>
                <Badge variant="outline" className="text-xs sm:text-sm py-1 px-3 font-normal">
                  {topic.difficulty}
                </Badge>
                <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground font-normal">
                  <Clock className="w-4 h-4" />
                  {topic.estimatedTime}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
                {topic.title}
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground max-w-3xl leading-relaxed font-normal">
                {renderFormattedText(topic.summary)}
              </p>
            </div>

            <Button
              variant={isCompleted ? "default" : "secondary"}
              size="lg"
              onClick={() => {
                triggerHaptic(isCompleted ? "light" : "success");
                onToggleComplete(topic.id);
              }}
              className="flex items-center gap-2.5 font-semibold text-sm sm:text-base flex-shrink-0 transition-transform active:scale-95 shadow-sm"
            >
              <AnimatedCheckmark checked={isCompleted} size={20} />
              <span>Topic Mastered</span>
            </Button>
          </div>
        </CardHeader>

        {/* Tabs Container */}
        <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 font-normal">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="relative w-full">
            {/* Audio Control Widget (Inline with TabsList at top-0, ONLY sticks to top-16 when TTS is playing/paused/loading) */}
            {activeTab === "explanation" && (
              <div
                className={
                  (isSpeaking || isPaused || isLoadingAudio)
                    ? "absolute top-0 right-0 bottom-0 pointer-events-none z-30"
                    : "absolute top-0 right-0 h-[52px] pointer-events-none z-30"
                }
              >
                <div
                  className={
                    (isSpeaking || isPaused || isLoadingAudio)
                      ? "sticky top-16 pointer-events-auto h-[52px] flex items-center justify-end"
                      : "relative pointer-events-auto h-[52px] flex items-center justify-end"
                  }
                >
                  <div className="flex items-center gap-2 p-1.5 rounded-full bg-card/95 backdrop-blur-xl border border-border/90 shadow-2xl flex-shrink-0 transition-all duration-300">
                    {isLoadingAudio ? (
                      <Button
                        variant="outline"
                        size="icon"
                        disabled
                        className="w-9 h-9 rounded-full border border-border bg-secondary/60 text-foreground flex items-center justify-center opacity-80"
                        title="Generating Microsoft Edge Neural speech..."
                      >
                        <Loader2 className="w-4 h-4 animate-spin text-foreground" />
                      </Button>
                    ) : !isSpeaking && !isPaused ? (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleStartSpeech}
                        className="w-9 h-9 rounded-full border border-border bg-secondary/80 hover:bg-secondary text-foreground transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm flex items-center justify-center"
                        title="Listen to topic narration (Microsoft Edge Neural)"
                        aria-label="Listen to topic narration"
                      >
                        <Play className="w-4 h-4 text-foreground fill-foreground ml-0.5" />
                      </Button>
                    ) : isSpeaking ? (
                      <div className="flex items-center gap-2">
                        {/* Close on left */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleStopSpeech}
                          className="w-9 h-9 rounded-full border border-border bg-secondary/40 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                          title="Exit narration"
                          aria-label="Exit narration"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        {/* Reset in middle */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleResetSpeech}
                          className="w-9 h-9 rounded-full border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary/90 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                          title="Restart narration from beginning"
                          aria-label="Restart narration"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        {/* Pause on right */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePauseSpeech}
                          className="w-9 h-9 rounded-full border border-border bg-secondary text-foreground hover:bg-secondary/80 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm flex items-center justify-center"
                          title="Pause narration"
                          aria-label="Pause narration"
                        >
                          <Pause className="w-4 h-4 text-foreground fill-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* Close on left */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleStopSpeech}
                          className="w-9 h-9 rounded-full border border-border bg-secondary/40 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                          title="Exit narration"
                          aria-label="Exit narration"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        {/* Reset in middle */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleResetSpeech}
                          className="w-9 h-9 rounded-full border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary/90 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                          title="Restart narration from beginning"
                          aria-label="Restart narration"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        {/* Play on right */}
                        <Button
                          variant="default"
                          size="icon"
                          onClick={handleResumeSpeech}
                          className="w-9 h-9 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm flex items-center justify-center"
                          title="Resume narration"
                          aria-label="Resume narration"
                        >
                          <Play className="w-4 h-4 fill-background text-background ml-0.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Header row: Tabs on left */}
            <div className="flex items-center justify-between gap-4 w-full mb-6 pr-20 sm:pr-28">
              <TabsList className="w-full sm:w-auto font-normal overflow-x-auto">
                <TabsTrigger value="explanation" className="flex items-center gap-2 font-medium focus:outline-none focus-visible:outline-none">
                  <BookOpen className="w-4 h-4" />
                  Concept Overview
                </TabsTrigger>

                <TabsTrigger value="code" className="flex items-center gap-2 font-medium focus:outline-none focus-visible:outline-none">
                  <Code className="w-4 h-4" />
                  Code ({topic.codeExamples.length})
                </TabsTrigger>

                <TabsTrigger value="mcq" className="flex items-center gap-2 font-medium focus:outline-none focus-visible:outline-none">
                  <HelpCircle className="w-4 h-4" />
                  MCQ Quiz Test ({mcqs.length})
                </TabsTrigger>

                <TabsTrigger value="notes" className="flex items-center gap-2 font-medium focus:outline-none focus-visible:outline-none">
                  <StickyNote className="w-4 h-4" />
                  <span>Make Notes</span>
                  {noteText.trim() && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Explanation Content */}
            <TabsContent value="explanation" className="space-y-6 mt-0 font-normal focus:outline-none focus-visible:outline-none relative">
              <div className="space-y-6">

                <Card className="bg-card border-border font-normal">
                  <CardHeader className="p-6 sm:p-8 pb-3">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2.5 uppercase tracking-wide">
                      <Lightbulb className="w-5 h-5 text-foreground" />
                      <span>Core Concept Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
                    {renderSpeechFormattedText(
                      topic.explanation.overview,
                      isSpeaking || isPaused,
                      activeWordIndex,
                      fullSpeechPayload.overviewTextWordStart
                    )}
                  </CardContent>
                </Card>

                {topic.explanation.sections.map((section, idx) => {
                  const secOffsets = fullSpeechPayload.sectionStartIndexes[idx];
                  const isNarrationActive = isSpeaking || isPaused;

                  return (
                    <Card key={idx} className="bg-card border-border font-normal">
                      <CardHeader className="p-6 sm:p-8 pb-3">
                        <CardTitle className="text-base sm:text-xl font-semibold text-foreground uppercase tracking-wider">
                          {renderSpeechFormattedText(
                            section.heading,
                            isNarrationActive,
                            activeWordIndex,
                            secOffsets?.headingStart
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 space-y-4 font-normal">
                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
                          {renderSpeechFormattedText(
                            section.content,
                            isNarrationActive,
                            activeWordIndex,
                            secOffsets?.contentStart
                          )}
                        </p>
                        {section.bulletPoints && (
                          <ul className="space-y-3 pt-2 font-normal">
                            {section.bulletPoints.map((bp, bpIdx) => (
                              <li key={bpIdx} className="flex items-start gap-3 text-base text-muted-foreground leading-relaxed font-normal">
                                <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isNarrationActive ? "bg-white" : "bg-foreground"}`} />
                                <span>
                                  {renderSpeechFormattedText(
                                    bp,
                                    isNarrationActive,
                                    activeWordIndex,
                                    secOffsets?.bulletStarts[bpIdx]
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Key Takeaways Card */}
              <Card className="bg-card border-border font-normal">
                <CardHeader className="p-6 sm:p-8 pb-4">
                  <CardTitle className="text-sm sm:text-base font-semibold text-foreground uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-foreground" />
                    Key Rules & Takeaways
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-normal">
                    {topic.keyTakeaways.map((takeaway, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-secondary/50 border border-border text-base text-foreground flex items-start gap-3 leading-relaxed font-normal"
                      >
                        <span className="text-foreground font-semibold text-lg">{idx + 1}.</span>
                        <span>{renderFormattedText(takeaway)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Unified Code Tab: Interactive Sandbox + Code Examples */}
            <TabsContent value="code" className="space-y-8 mt-6 font-normal focus:outline-none focus-visible:outline-none">
              {/* Interactive Live Sandbox */}
              <div id="sandbox-section">
                <CodePlayground
                  key={sandboxCode}
                  initialCode={sandboxCode || topic.codeExamples[0]?.code || "// Write JavaScript code here\nconsole.log('Hello DevDocs');"}
                  title={`Interactive Sandbox: ${topic.title}`}
                />
              </div>

              {/* Code Examples & Reference */}
              {topic.codeExamples.length > 0 && (
                <div className="space-y-6 pt-2">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Code className="w-5 h-5 text-foreground" />
                    <h3 className="text-xl font-bold text-foreground tracking-tight">Code Examples & References</h3>
                  </div>

                  <div className="space-y-6">
                    {topic.codeExamples.map((example, idx) => (
                      <Card key={idx} className="bg-card border-border overflow-hidden font-normal">
                        <div className="px-6 py-4 bg-secondary/40 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-normal">
                          <div>
                            <h4 className="font-semibold text-base sm:text-lg text-foreground">{example.title}</h4>
                            <p className="text-sm text-muted-foreground font-normal">{example.description}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                triggerHaptic("light");
                                setSandboxCode(example.code);
                                document.getElementById("sandbox-section")?.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium focus:outline-none focus-visible:outline-none"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Run in Sandbox</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyCode(example.code, idx)}
                              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium focus:outline-none focus-visible:outline-none"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-foreground" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Code</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="p-6 bg-background overflow-x-auto text-sm sm:text-base text-foreground leading-relaxed whitespace-pre custom-scrollbar font-normal">
                          {example.code}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Interactive 1-at-a-Time MCQ Quiz Test Tab */}
            <TabsContent value="mcq" className="space-y-6 mt-6 font-normal focus:outline-none focus-visible:outline-none">
              {!isQuizSubmitted ? (
                // -------------------------------------------------------------
                // ACTIVE QUIZ MODE: 1 QUESTION AT A TIME (WIZARD FLOW)
                // -------------------------------------------------------------
                <div className="space-y-6">
                  {/* Progress Header */}
                  <Card className="bg-card border-border p-5 font-normal space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Trophy className="w-4 h-4 text-foreground" />
                        <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Answered: <strong className="text-foreground font-semibold">{answeredCount}</strong> / {totalQuestions}
                      </div>
                    </div>

                    <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="h-2" />

                    {/* Question Step Pills */}
                    <div className="flex items-center gap-2 pt-1 overflow-x-auto custom-scrollbar">
                      {mcqs.map((_, idx) => {
                        const isCurrent = idx === currentQuestionIndex;
                        const isAnswered = userAnswers[idx] !== undefined;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                              isCurrent
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : isAnswered
                                ? "bg-secondary text-foreground border-border"
                                : "bg-background text-muted-foreground border-border hover:bg-secondary/40 hover:text-foreground"
                            }`}
                          >
                            Q{idx + 1} {isAnswered ? "✓" : ""}
                          </button>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Single Question Card */}
                  {currentMCQ && (
                    <Card className="bg-card border-border font-normal overflow-hidden">
                      <CardHeader className="p-6 sm:p-8 pb-4">
                        <div className="flex items-start gap-3">
                          <Badge variant="secondary" className="font-semibold text-sm flex-shrink-0">
                            Q{currentQuestionIndex + 1}
                          </Badge>
                          <CardTitle className="font-semibold text-base sm:text-xl text-foreground leading-relaxed">
                            {renderFormattedText(currentMCQ.question)}
                          </CardTitle>
                        </div>
                      </CardHeader>

                      <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          {currentMCQ.options.map((opt, optIdx) => {
                            const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                            const optionLetters = ["A", "B", "C", "D"];

                            return (
                              <motion.button
                                key={optIdx}
                                type="button"
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                                className={`p-4 rounded-xl text-left border transition-all text-sm sm:text-base font-normal flex items-center justify-between gap-4 ${
                                  isSelected
                                    ? "bg-secondary border-foreground text-foreground font-semibold shadow-sm"
                                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                                    {optionLetters[optIdx]}
                                  </span>
                                  <span>{renderFormattedText(opt)}</span>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Step Navigation Controls: Next / Previous / Submit */}
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={isFirstQuestion}
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      className="flex items-center gap-2 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </Button>

                    {!isLastQuestion ? (
                      <Button
                        variant="default"
                        size="lg"
                        onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                        className="flex items-center gap-2 font-semibold px-6"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="lg"
                        onClick={handleSubmitQuiz}
                        className="flex items-center gap-2 font-semibold px-8 bg-foreground text-background hover:bg-foreground/90"
                      >
                        <Check className="w-4 h-4 text-background" />
                        <span>Submit Quiz Test</span>
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                // -------------------------------------------------------------
                // SUBMITTED MODE: COMPLETE RESULTS & DETAILED REVIEW
                // -------------------------------------------------------------
                <div className="space-y-6">
                  <Card className="bg-secondary/40 border-border p-6 font-normal space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-secondary border border-border text-foreground">
                          <Trophy className="w-6 h-6 text-foreground" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">Quiz Results Submitted</h3>
                          <p className="text-sm text-muted-foreground">
                            Score: <strong className="text-foreground font-semibold">{score} / {totalQuestions}</strong> ({percentage}%)
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetakeQuiz}
                        className="flex items-center gap-2 font-medium"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Retake Quiz</span>
                      </Button>
                    </div>
                  </Card>

                  {/* Review All Questions with Answer Key & Explanations */}
                  <div className="space-y-6">
                    {mcqs.map((mcq, qIdx) => {
                      const selectedOption = userAnswers[qIdx];
                      const isCorrect = selectedOption === mcq.correctAnswer;

                      return (
                        <Card key={mcq.id || qIdx} className="bg-card border-border font-normal overflow-hidden">
                          <CardHeader className="p-6 sm:p-8 pb-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <Badge variant="secondary" className="font-semibold text-sm flex-shrink-0">
                                  Q{qIdx + 1}
                                </Badge>
                                <CardTitle className="font-semibold text-base sm:text-xl text-foreground leading-relaxed">
                                  {renderFormattedText(mcq.question)}
                                </CardTitle>
                              </div>

                              <div className="flex-shrink-0">
                                {selectedOption === undefined ? (
                                  <Badge variant="outline" className="text-xs">Unanswered</Badge>
                                ) : isCorrect ? (
                                  <Badge variant="default" className="flex items-center gap-1 text-xs">
                                    <Check className="w-3.5 h-3.5" /> Correct
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                                    <XCircle className="w-3.5 h-3.5" /> Incorrect
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                              {mcq.options.map((opt, optIdx) => {
                                const isSelected = selectedOption === optIdx;
                                const isAnswerKey = mcq.correctAnswer === optIdx;

                                let optionClasses = "p-4 rounded-xl text-left border transition-all text-sm sm:text-base font-normal flex items-center justify-between gap-4 ";

                                if (isAnswerKey) {
                                  optionClasses += "bg-emerald-950/20 border-emerald-500/50 text-emerald-300 font-medium";
                                } else if (isSelected && !isCorrect) {
                                  optionClasses += "bg-rose-950/20 border-rose-500/50 text-rose-300 font-medium";
                                } else {
                                  optionClasses += "bg-background/40 border-border/50 text-muted-foreground opacity-60";
                                }

                                const optionLetters = ["A", "B", "C", "D"];

                                return (
                                  <div key={optIdx} className={optionClasses}>
                                    <div className="flex items-center gap-3">
                                      <span className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                                        {optionLetters[optIdx]}
                                      </span>
                                      <span>{renderFormattedText(opt)}</span>
                                    </div>

                                    {isAnswerKey && (
                                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    )}
                                    {isSelected && !isCorrect && (
                                      <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border text-sm text-muted-foreground space-y-1 leading-relaxed">
                              <span className="font-semibold text-foreground block text-xs uppercase tracking-wider">
                                Explanation:
                              </span>
                              <p>{renderFormattedText(mcq.explanation)}</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Make Notes Tab */}
            <TabsContent value="notes" className="space-y-6 mt-6 font-normal focus:outline-none focus-visible:outline-none">
              <Card className="bg-card border-border shadow-xl overflow-hidden font-normal">
                <CardHeader className="p-5 sm:p-6 border-b border-border bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-secondary border border-border text-foreground">
                      <StickyNote className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                        <span>Personal Notes</span>
                        <Badge variant="outline" className="text-[10px] font-mono font-normal">
                          {noteText.trim() ? `${noteText.trim().split(/\s+/).length} words` : "Empty"}
                        </Badge>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground pt-1 font-normal">
                        Jot down takeaways, interview questions, or code snippets for <strong className="text-foreground font-semibold">{topic.title}</strong>. Your notes are automatically saved.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {noteText.trim() && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyNote}
                          className="text-xs flex items-center gap-1.5 px-3 py-1"
                          title="Copy notes to clipboard"
                        >
                          {copiedNote ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-foreground" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant={confirmClear ? "destructive" : "ghost"}
                          size="sm"
                          onClick={handleClearNote}
                          className={`text-xs flex items-center gap-1.5 px-2.5 py-1 transition-all ${
                            confirmClear
                              ? "bg-rose-950/80 text-rose-300 border border-rose-500/60 font-semibold shadow-sm animate-pulse"
                              : "text-muted-foreground hover:text-rose-400"
                          }`}
                          title={confirmClear ? "Click again to permanently delete notes" : "Clear notes for this topic"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{confirmClear ? "Click again to confirm delete" : "Clear"}</span>
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-5 sm:p-6">
                  <textarea
                    value={noteText}
                    onChange={handleNoteChange}
                    placeholder={`Type your personal study notes, reminders, or code snippets for ${topic.title} here...`}
                    rows={12}
                    className="w-full bg-background border border-border rounded-xl p-4 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/50 resize-y leading-relaxed font-mono custom-scrollbar transition-all min-h-[240px]"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="pt-8 border-t border-border flex items-center justify-between gap-4 font-normal">
        {prevTopic ? (
          <Button
            variant="outline"
            size="lg"
            onClick={() => onSelectTopic(prevTopic.id)}
            className="flex items-center gap-3 h-auto py-4 text-left font-normal focus:outline-none focus-visible:outline-none"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
            <div>
              <span className="text-xs text-muted-foreground block uppercase font-normal">Previous Topic</span>
              <span className="text-sm font-medium text-foreground">{prevTopic.title}</span>
            </div>
          </Button>
        ) : (
          <div />
        )}

        {nextTopic ? (
          <Button
            variant="outline"
            size="lg"
            onClick={() => onSelectTopic(nextTopic.id)}
            className="flex items-center gap-3 h-auto py-4 text-right font-normal focus:outline-none focus-visible:outline-none"
          >
            <div>
              <span className="text-xs text-muted-foreground block uppercase font-normal">Next Topic</span>
              <span className="text-sm font-medium text-foreground">{nextTopic.title}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-foreground" />
          </Button>
        ) : (
          <div />
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in to listen to AI Audio"
        description="Please sign in or create a free account to listen to Microsoft Edge Neural AI voice narration for topics."
        badge="Audio Narration Locked"
      />
    </motion.div>
  );
}
