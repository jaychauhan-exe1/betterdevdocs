import { Topic } from "@/data/topics";
import { CodingChallenge } from "@/data/coding-challenges";

export interface TopicPointsBreakdown {
  topicId: string;
  topicTitle: string;
  category: string;
  isCompleted: boolean;
  completionPoints: number; // 2 or 0
  totalMcqs: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  mcqPoints: number; // (correct * 1) - (incorrect * 0.5)
  isPerfectBonus: boolean;
  perfectBonusPoints: number; // 3 or 0
  totalTopicPoints: number;
}

export interface CodingPointsSummary {
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  easyPoints: number;
  mediumPoints: number;
  hardPoints: number;
  earnedCodingPoints: number;
  failedSubmissionsCount: number;
  codingDeductions: number;
  totalCodingPoints: number;
  solvedCount: number;
}

export interface PointsSummary {
  totalPoints: number;
  completionPointsTotal: number;
  mcqPointsTotal: number;
  bonusPointsTotal: number;
  deductionPointsTotal: number;
  correctMcqsTotal: number;
  incorrectMcqsTotal: number;
  completedTopicsCount: number;
  perfectTopicsCount: number;
  topicBreakdown: TopicPointsBreakdown[];
  codingPoints?: CodingPointsSummary;
}

export function formatPoints(points: number, useK: boolean = false): string {
  if (useK && Math.abs(points) >= 1000) {
    const kVal = points / 1000;
    const rounded = Math.round(kVal * 10) / 10;
    const formatted = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
    return `${formatted}k`;
  }
  const rounded = Math.round(points * 10) / 10;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
}

export function formatKPoints(points: number): string {
  return formatPoints(points, true);
}

export function calculateCodingPoints(
  solvedChallenges: Record<string, { solvedAt: number; code: string }>,
  allChallenges: CodingChallenge[],
  failedSubmissionsCount: number = 0
): CodingPointsSummary {
  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;

  allChallenges.forEach((challenge) => {
    if (solvedChallenges[challenge.id]) {
      if (challenge.difficulty === "Easy") easySolved++;
      else if (challenge.difficulty === "Medium") mediumSolved++;
      else if (challenge.difficulty === "Hard") hardSolved++;
    }
  });

  const easyPoints = easySolved * 2;
  const mediumPoints = mediumSolved * 3;
  const hardPoints = hardSolved * 4;
  const earnedCodingPoints = easyPoints + mediumPoints + hardPoints;
  const codingDeductions = Math.round(failedSubmissionsCount * 0.5 * 10) / 10;
  const totalCodingPoints = Math.round((earnedCodingPoints - codingDeductions) * 10) / 10;
  const solvedCount = easySolved + mediumSolved + hardSolved;

  return {
    easySolved,
    mediumSolved,
    hardSolved,
    easyPoints,
    mediumPoints,
    hardPoints,
    earnedCodingPoints,
    failedSubmissionsCount,
    codingDeductions,
    totalCodingPoints,
    solvedCount,
  };
}

export function calculateUserPoints(
  topics: Topic[],
  completedTopics: string[],
  mcqAnswers: Record<string, Record<number, number>>
): PointsSummary {
  let completionPointsTotal = 0;
  let mcqPointsTotal = 0;
  let bonusPointsTotal = 0;
  let deductionPointsTotal = 0;
  let correctMcqsTotal = 0;
  let incorrectMcqsTotal = 0;
  let completedTopicsCount = 0;
  let perfectTopicsCount = 0;

  const topicBreakdown: TopicPointsBreakdown[] = topics.map((topic) => {
    const isCompleted = completedTopics.includes(topic.id);
    const completionPoints = isCompleted ? 2 : 0;
    if (isCompleted) {
      completedTopicsCount++;
      completionPointsTotal += 2;
    }

    const mcqs = topic.mcqs || [];
    const userAnswers = mcqAnswers[topic.id] || {};

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    mcqs.forEach((mcq, idx) => {
      const selectedOption = userAnswers[idx];
      if (selectedOption === undefined) {
        unansweredCount++;
      } else if (selectedOption === mcq.correctAnswer) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    correctMcqsTotal += correctCount;
    incorrectMcqsTotal += incorrectCount;

    const positiveMcqPoints = correctCount * 1.0;
    const negativeMcqPoints = incorrectCount * 0.5;
    const mcqPoints = positiveMcqPoints - negativeMcqPoints;

    mcqPointsTotal += mcqPoints;
    deductionPointsTotal += negativeMcqPoints;

    // Perfect Bonus condition:
    // Topic is completed AND has MCQs AND every MCQ was answered AND every MCQ was correct
    const isPerfectBonus =
      isCompleted &&
      mcqs.length > 0 &&
      correctCount === mcqs.length &&
      incorrectCount === 0;

    const perfectBonusPoints = isPerfectBonus ? 3 : 0;
    if (isPerfectBonus) {
      perfectTopicsCount++;
      bonusPointsTotal += 3;
    }

    const totalTopicPoints = completionPoints + mcqPoints + perfectBonusPoints;

    return {
      topicId: topic.id,
      topicTitle: topic.title,
      category: topic.category,
      isCompleted,
      completionPoints,
      totalMcqs: mcqs.length,
      correctCount,
      incorrectCount,
      unansweredCount,
      mcqPoints,
      isPerfectBonus,
      perfectBonusPoints,
      totalTopicPoints,
    };
  });

  const rawTotal =
    completionPointsTotal + mcqPointsTotal + bonusPointsTotal;
  const totalPoints = Math.round(rawTotal * 10) / 10;

  return {
    totalPoints,
    completionPointsTotal,
    mcqPointsTotal,
    bonusPointsTotal,
    deductionPointsTotal,
    correctMcqsTotal,
    incorrectMcqsTotal,
    completedTopicsCount,
    perfectTopicsCount,
    topicBreakdown,
  };
}
