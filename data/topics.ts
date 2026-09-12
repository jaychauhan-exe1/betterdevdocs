import javascriptData from "./content/javascript.json";
import reactData from "./content/react.json";
import nodeData from "./content/node.json";
import httpData from "./content/http.json";
import redisData from "./content/redis.json";
import mysqlData from "./content/mysql.json";
import systemDesignData from "./content/system-design.json";
import securityData from "./content/security.json";
import dsaData from "./content/dsa.json";

export interface CodeExample {
  title: string;
  description: string;
  code: string;
  runnable?: boolean;
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export type CategoryType =
  | "JAVASCRIPT"
  | "REACT"
  | "NODE"
  | "HTTP"
  | "REDIS"
  | "MYSQL"
  | "SYSTEM DESIGN"
  | "SECURITY"
  | "DSA";

export interface Topic {
  id: string;
  title: string;
  category: CategoryType;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  isImportant?: boolean;
  summary: string;
  explanation: {
    overview: string;
    sections: {
      heading: string;
      content: string;
      bulletPoints?: string[];
    }[];
  };
  keyTakeaways: string[];
  codeExamples: CodeExample[];
  mcqs: MCQ[];
}

export const TOPICS: Topic[] = [
  ...(javascriptData as Topic[]),
  ...(reactData as Topic[]),
  ...(nodeData as Topic[]),
  ...(httpData as Topic[]),
  ...(redisData as Topic[]),
  ...(mysqlData as Topic[]),
  ...(systemDesignData as Topic[]),
  ...(securityData as Topic[]),
  ...(dsaData as Topic[]),
];
