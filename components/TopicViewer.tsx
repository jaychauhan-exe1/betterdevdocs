"use client";

import React, { useState, useEffect } from "react";
import { Topic } from "@/data/topics";
import CodePlayground from "./CodePlayground";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CheckSquare,
  Square,
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
  Star,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface TopicViewerProps {
  topic: Topic;
  allTopics: Topic[];
  isCompleted: boolean;
  onToggleComplete: (topicId: string) => void;
  onSelectTopic: (topicId: string) => void;
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

export default function TopicViewer({
  topic,
  allTopics,
  isCompleted,
  onToggleComplete,
  onSelectTopic,
}: TopicViewerProps) {
  const [activeTab, setActiveTab] = useState<string>("explanation");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // MCQ Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  useEffect(() => {
    setUserAnswers({});
    setIsQuizSubmitted(false);
    setCurrentQuestionIndex(0);
  }, [topic.id]);

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
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optionIdx }));
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
    <div className="max-w-5xl mx-auto space-y-8 pb-20 font-normal">
      {/* Top Banner Card */}
      <Card className="bg-card border-border shadow-xl relative overflow-hidden font-normal">
        <CardHeader className="p-6 sm:p-8 pb-6 font-normal">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 font-normal">
            <div className="space-y-3 font-normal">
              <div className="flex items-center gap-2.5 flex-wrap font-normal">
                {topic.isImportant && (
                  <Badge variant="default" className="flex items-center gap-1.5 font-bold text-xs sm:text-sm py-1 px-3">
                    <Star className="w-4 h-4 fill-current text-primary-foreground" />
                    <span>MUST LEARN TOPIC</span>
                  </Badge>
                )}
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
              onClick={() => onToggleComplete(topic.id)}
              className="flex items-center gap-2.5 font-semibold text-sm sm:text-base flex-shrink-0"
            >
              {isCompleted ? (
                <>
                  <CheckSquare className="w-5 h-5 text-primary-foreground" />
                  <span>Topic Mastered</span>
                </>
              ) : (
                <>
                  <Square className="w-5 h-5" />
                  <span>Mark as Mastered</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {/* Tabs Container */}
        <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 font-normal">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full sm:w-auto font-normal">
              <TabsTrigger value="explanation" className="flex items-center gap-2 font-medium focus:outline-none focus-visible:outline-none">
                <BookOpen className="w-4 h-4" />
                Concept Overview
              </TabsTrigger>

              <TabsTrigger value="examples" className="flex items-center gap-2 font-medium focus:outline-none focus-visible:outline-none">
                <Code className="w-4 h-4" />
                Code Examples ({topic.codeExamples.length})
              </TabsTrigger>

              <TabsTrigger value="sandbox" className="flex items-center gap-2 font-medium focus:outline-none focus-visible:outline-none">
                <Sparkles className="w-4 h-4" />
                Live Sandbox
              </TabsTrigger>

              <TabsTrigger value="mcq" className="flex items-center gap-2 font-medium focus:outline-none focus-visible:outline-none">
                <HelpCircle className="w-4 h-4" />
                MCQ Quiz Test ({mcqs.length})
              </TabsTrigger>
            </TabsList>

            {/* Explanation Content */}
            <TabsContent value="explanation" className="space-y-6 mt-6 font-normal focus:outline-none focus-visible:outline-none">
              <div className="space-y-6">
                <Card className="bg-card border-border font-normal">
                  <CardHeader className="p-6 sm:p-8 pb-3">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2.5 uppercase tracking-wide">
                      <Lightbulb className="w-5 h-5 text-foreground" />
                      Core Concept Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
                    {renderFormattedText(topic.explanation.overview)}
                  </CardContent>
                </Card>

                {topic.explanation.sections.map((section, idx) => (
                  <Card key={idx} className="bg-card border-border font-normal">
                    <CardHeader className="p-6 sm:p-8 pb-3">
                      <CardTitle className="text-base sm:text-xl font-semibold text-foreground uppercase tracking-wider">
                        {section.heading}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 space-y-4 font-normal">
                      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
                        {renderFormattedText(section.content)}
                      </p>
                      {section.bulletPoints && (
                        <ul className="space-y-3 pt-2 font-normal">
                          {section.bulletPoints.map((bp, bpIdx) => (
                            <li key={bpIdx} className="flex items-start gap-3 text-base text-muted-foreground leading-relaxed font-normal">
                              <span className="w-2 h-2 rounded-full bg-foreground mt-2 flex-shrink-0" />
                              <span>{renderFormattedText(bp)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))}
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

            {/* Code Examples Tab */}
            <TabsContent value="examples" className="space-y-6 mt-6 font-normal focus:outline-none focus-visible:outline-none">
              {topic.codeExamples.map((example, idx) => (
                <Card key={idx} className="bg-card border-border overflow-hidden font-normal">
                  <div className="px-6 py-4 bg-secondary/40 border-b border-border flex items-center justify-between gap-4 font-normal">
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg text-foreground">{example.title}</h3>
                      <p className="text-sm text-muted-foreground font-normal">{example.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCode(example.code, idx)}
                      className="flex items-center gap-2 text-xs sm:text-sm font-medium flex-shrink-0 focus:outline-none focus-visible:outline-none"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-4 h-4 text-foreground" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="p-6 bg-background overflow-x-auto text-sm sm:text-base text-foreground leading-relaxed whitespace-pre custom-scrollbar font-normal">
                    {example.code}
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Live Sandbox Tab */}
            <TabsContent value="sandbox" className="mt-6 font-normal focus:outline-none focus-visible:outline-none">
              <CodePlayground
                initialCode={topic.codeExamples[0]?.code || "// Write JavaScript code here\nconsole.log('Hello DevDocs');"}
                title={`Sandbox: ${topic.title}`}
              />
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
                              <button
                                key={optIdx}
                                type="button"
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
                              </button>
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
                        onClick={() => setIsQuizSubmitted(true)}
                        className="flex items-center gap-2 font-semibold px-8"
                      >
                        <Check className="w-4 h-4 text-primary-foreground" />
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
                        onClick={() => {
                          setIsQuizSubmitted(false);
                          setUserAnswers({});
                          setCurrentQuestionIndex(0);
                        }}
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
    </div>
  );
}
