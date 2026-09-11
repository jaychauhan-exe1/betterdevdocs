# 🚀 Better DevDocs — Interactive Developer Learning & Career Roadmap Platform

An interactive, gamified software engineering learning platform built with **Next.js 16**, **React 19**, **Clerk**, **Supabase**, and **Tailwind CSS**. Designed to take developers from core concepts to system design mastery across targeted role-based career paths.

---

## ✨ Features

- **🌐 9 Technical Domains**: Deep-dive curriculum covering:
  - **JavaScript** (Core concepts, async JS, event loop, V8 mechanics)
  - **React** (State management, Hooks, reconciliation, server components)
  - **Node.js** (Event loop, streams, clusters, event emitters)
  - **HTTP & Networking** (REST, WebSockets, HTTP/1-3, TLS/SSL, caching)
  - **Redis** (Data structures, pub/sub, caching strategies, persistence)
  - **MySQL** (Indexing, query optimization, transactions, ACID compliance)
  - **System Design** (Scalability, load balancing, microservices, partitioning)
  - **Security** (OWASP Top 10, JWT, CORS, OAuth2, XSS/CSRF prevention)
  - **Data Structures & Algorithms (DSA)** (Arrays, graphs, dynamic programming, trees)

- **🎯 Role-Based Learning Tracks**: Focus your learning with curated paths:
  - ⚡ *Full Spectrum* (All Topics)
  - 🎨 *Frontend Developer*
  - ⚙️ *Backend Developer*
  - 🛠️ *Full Stack Developer*
  - 📊 *Data Engineer & Data Analyst*
  - 🏗️ *DevOps & System Architect*

- **💻 Interactive Code Playground**: Practice live code snippets directly inside the topic viewer.
- **🧠 Interactive Knowledge Quizzes**: Master concepts through Multiple Choice Questions (MCQs) with real-time feedback and explanations.
- **🔊 Audio Learning (TTS)**: Built-in Text-to-Speech support (`node-edge-tts`) to listen to summaries on the go.
- **🏆 Gamification & Leaderboard**: Earn XP, build streaks, unlock badges, track completion progress, and compete on the real-time leaderboard.
- **🔐 Auth & Cloud Sync**: Seamless authentication with Clerk and user progress sync using Supabase.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide Icons](https://lucide.dev/), [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database & Sync**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`, `@supabase/ssr`)
- **Audio Engine**: `node-edge-tts`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **npm** / **yarn** / **pnpm** / **bun**

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd devdocs
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory and configure the necessary credentials:

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase Storage & Sync
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📂 Project Structure

```
devdocs/
├── app/                  # Next.js App Router pages and API endpoints
│   ├── api/              # Backend API routes (TTS, progress, leaderboard, etc.)
│   ├── leaderboard/      # Leaderboard view
│   ├── points/           # Points, badges & achievements view
│   ├── progress/         # Visual roadmap & topic progress tracking
│   └── page.tsx          # Main application dashboard
├── components/           # Reusable UI components
│   ├── CodePlayground.tsx# Live code editor & execution preview
│   ├── TopicViewer.tsx   # Topic lesson content, code examples, & quizzes
│   ├── LeaderboardView.tsx
│   ├── PointsView.tsx
│   ├── ProgressRoadmapView.tsx
│   └── RoleSelectionModal.tsx
├── data/                 # Curriculum data
│   ├── content/          # Topic JSON data (JavaScript, React, Node, DSA, etc.)
│   ├── roles.ts          # Role track definitions
│   └── topics.ts         # Topic models and combined dataset
├── lib/                  # Utilities, Supabase client/server helpers, middleware
├── store/                # Zustand global state (useStudyStore.ts)
└── supabase/             # Database schema migrations & SQL policies
```

---

## 📜 Available Scripts

- `npm run dev`: Launches the development server with Next.js Turbopack.
- `npm run build`: Compiles and builds the production application.
- `npm run start`: Runs the built production application.
- `npm run lint`: Runs ESLint check across the repository.

---

## 📄 License

This project is licensed under the MIT License.
