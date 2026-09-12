import { CategoryType } from "./topics";

export interface RoleTrack {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  badge: string;
  categories: CategoryType[];
}

export const ROLES: RoleTrack[] = [
  {
    id: "all",
    title: "Full Curriculum (All Topics)",
    shortTitle: "All Topics",
    description: "Explore the complete developer knowledge base across all technical domains.",
    badge: "Full Spectrum",
    categories: [
      "HTML & CSS",
      "JAVASCRIPT",
      "REACT",
      "NODE",
      "HTTP",
      "REDIS",
      "MYSQL",
      "SYSTEM DESIGN",
      "SECURITY",
      "DSA",
    ],
  },
  {
    id: "frontend",
    title: "Frontend Developer",
    shortTitle: "Frontend Dev",
    description: "Master modern HTML5, CSS layout, JavaScript, React, web security, and client-side algorithms based on roadmap.sh standards.",
    badge: "UI & Web Apps",
    categories: ["HTML & CSS", "JAVASCRIPT", "REACT", "HTTP", "SECURITY", "DSA"],
  },
  {
    id: "backend",
    title: "Backend Developer",
    shortTitle: "Backend Dev",
    description: "Build robust server applications, APIs, databases, caching layers, security protocols, and system architecture.",
    badge: "Server & APIs",
    categories: ["JAVASCRIPT", "NODE", "HTTP", "REDIS", "MYSQL", "SYSTEM DESIGN", "SECURITY", "DSA"],
  },
  {
    id: "fullstack",
    title: "Full Stack Developer",
    shortTitle: "Full Stack",
    description: "End-to-end software engineering spanning interactive frontend UI, HTML/CSS, server runtimes, data systems, and system design.",
    badge: "End-to-End",
    categories: [
      "HTML & CSS",
      "JAVASCRIPT",
      "REACT",
      "NODE",
      "HTTP",
      "REDIS",
      "MYSQL",
      "SECURITY",
      "SYSTEM DESIGN",
      "DSA",
    ],
  },
  {
    id: "data-engineer",
    title: "Data Engineer",
    shortTitle: "Data Engineer",
    description: "Focus on relational databases, SQL optimization, memory data stores, high-throughput pipelines, and system architecture.",
    badge: "Data Pipelines",
    categories: ["MYSQL", "REDIS", "NODE", "SYSTEM DESIGN", "DSA"],
  },
  {
    id: "data-analytics",
    title: "Data Analytics / Analyst",
    shortTitle: "Data Analyst",
    description: "Deep dive into SQL querying, relational data structures, caching concepts, and core logical algorithms.",
    badge: "Analytics & SQL",
    categories: ["MYSQL", "REDIS", "DSA"],
  },
  {
    id: "devops-architect",
    title: "DevOps & System Architect",
    shortTitle: "System Architect",
    description: "Architect high-availability distributed systems, security enforcement, network protocols, caching topologies, and server runtimes.",
    badge: "Infrastructure",
    categories: ["SYSTEM DESIGN", "SECURITY", "HTTP", "REDIS", "MYSQL", "NODE", "DSA"],
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    shortTitle: "DSA & CS",
    description: "Master computer science fundamentals, data structures, searching/sorting algorithms, and problem-solving patterns based on roadmap.sh standards.",
    badge: "Algorithms & CS",
    categories: ["DSA", "JAVASCRIPT"],
  },
];
