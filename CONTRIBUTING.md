# Contributing to DevDocs

Thank you for your interest in contributing to **DevDocs**! We welcome contributions from developers of all skill levels. Whether you are fixing a bug, adding new interview topics, improving mobile responsiveness, or enhancing coding challenges, your help is greatly appreciated.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Option A: Native Setup (Local Machine)](#option-a-native-setup-local-machine)
  - [Option B: Docker Setup](#option-b-docker-setup)
- [Project Architecture](#project-architecture)
- [Development Workflow](#development-workflow)
  - [1. Fork & Clone](#1-fork--clone)
  - [2. Create a Feature Branch](#2-create-a-feature-branch)
  - [3. Code & Test](#3-code--test)
  - [4. Verification Commands](#4-verification-commands)
  - [5. Submit a Pull Request](#5-submit-a-pull-request)
- [Coding Guidelines](#coding-guidelines)
- [Questions & Support](#questions--support)

---

## Code of Conduct

Please maintain a respectful, welcoming, and collaborative tone in all issues, pull requests, and discussions.

---

## Getting Started

### Prerequisites

Before starting, ensure you have the following installed on your system:

- **Git** (v2.30 or higher)
- **Node.js** (v18.x or v20.x LTS recommended)
- **npm** (v9.x or higher)
- *(Optional for Docker setup)* **Docker Engine** & **Docker Compose**

---

### Environment Variables

Copy the sample `.env.example` file to create your local `.env.local` configuration:

```bash
cp .env.example .env.local
```

Fill in the environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

> [!NOTE]
> Local development can run without active Clerk/Supabase keys, but cloud user progress sync and authentication features require valid keys.

---

### Option A: Native Setup (Local Machine)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```

3. **Open the Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option B: Docker Setup

We provide Docker container configuration (`Dockerfile` and `docker-compose.yml`) for instant containerized development.

#### Running Production Container

Build and start the containerized Next.js production server:

```bash
docker compose up --build app
```

Access the application at [http://localhost:3000](http://localhost:3000).

#### Running Live-Reload Development Container

If you prefer developing inside a container with volume mounts and live hot-reloading:

```bash
docker compose up --build dev
```

Access the development container at [http://localhost:3001](http://localhost:3001).

#### Stopping Docker Containers

```bash
docker compose down
```

---

## Project Architecture

```
├── app/                        # Next.js App Router pages and API endpoints
│   ├── api/                    # Backend API routes (leaderboard, progress, github-stars)
│   ├── coding/                 # Coding Arena page route
│   ├── leaderboard/            # Leaderboard page route
│   ├── points/                 # Points Ledger page route
│   └── progress/               # Progress Roadmap page route
├── components/                 # Reusable UI & View Components
│   ├── ui/                     # Shadcn UI primitive components
│   ├── CodingArena.tsx         # Monaco code editor & test suite runner
│   ├── Header.tsx              # Sticky header with breadcrumbs & points badge
│   ├── LeaderboardView.tsx     # Global rankings table
│   ├── PointsView.tsx          # Points ledger breakdown
│   ├── ProgressRoadmapView.tsx # 3D Candy Crush style winding roadmap canvas
│   └── TopicViewer.tsx         # Main concept reader & interactive quiz
├── data/                       # Static study content and interview coding challenges
│   ├── content/                # JSON documentation files per tech stack category
│   ├── coding-challenges.ts    # Interview coding challenges list
│   ├── roles.ts                # Developer career path role definitions
│   └── topics.ts               # Topics data loader
├── lib/                        # Utility functions & helpers
│   ├── leaderboard.ts          # Leaderboard data calculation helpers
│   └── points.ts               # Points & scoring engine logic
├── store/                      # Zustand state store with persistence & cloud sync
│   └── useStudyStore.ts        # Global application state management
├── Dockerfile                  # Multi-stage Docker build config
├── docker-compose.yml          # Docker Compose orchestration config
└── CONTRIBUTING.md             # Contribution guide
```

---

## Development Workflow

### 1. Fork & Clone

Fork the repository on GitHub, then clone your fork:

```bash
git clone https://github.com/YOUR-USERNAME/devdocs.git
cd devdocs
```

### 2. Create a Feature Branch

Create a branch describing your work:

```bash
git checkout -b feature/amazing-new-feature
# or for bug fixes:
git checkout -b fix/roadmap-mobile-padding
```

### 3. Code & Test

Make your changes following the design aesthetics:
- Keep the dark monochrome aesthetic (`#0a0a0a`, `bg-card`, `border-border`).
- Ensure full mobile responsiveness (`sm:`, `md:`, `lg:` breakpoints).
- Maintain proper type safety with TypeScript.

### 4. Verification Commands

Before committing, run typechecks and linting to ensure zero build errors:

```bash
# Run TypeScript type check
npx tsc --noEmit

# Run ESLint check
npm run lint

# Validate production build
npm run build
```

> [!IMPORTANT]
> All PRs must pass `npx tsc --noEmit` with **0 errors** before being merged.

### 5. Submit a Pull Request

1. Push your changes to your fork:
   ```bash
   git push origin feature/amazing-new-feature
   ```
2. Open a Pull Request against the `main` branch of `devdocs`.
3. Provide a concise summary of your changes, screenshots for UI modifications, and test details.

---

## Coding Guidelines

- **Component Design**: Keep UI components modular, clean, and styled using Tailwind CSS and CSS variables.
- **State Management**: Use `useStudyStore` (Zustand) for global application state.
- **Strict Controls**: Avoid hardcoding static offsets or magic numbers. Maintain accessibility and haptic feedback standards (`triggerHaptic`).
- **Clean Diffs**: Avoid committing unused files, temporary logs, or unformatted code.

---

Thank you for helping make **DevDocs** better for developers everywhere! 🚀
