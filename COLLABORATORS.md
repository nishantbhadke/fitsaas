# 🚀 FitSaaS Fictional Collaborators & Development Rules

Welcome to the official contributor registry and engineering guidelines for the FitSaaS project. This repository is maintained by a specialized, legendary team assembled from across the Multiverse, each bringing distinct powers to the codebase.

---

## 👥 The Legendary Dev Team

### 0. 👑 Sung Jinwoo (@nishantbhadke / @jinwoo-monarch)
* **Project Role**: Lead Full-Stack Architect & Shadow Monarch
* **Origin**: Solo Leveling
* **Character Brief**: 
  Once known as the "World's Weakest Hunter," Jinwoo survived the horrific Double Dungeon and unlocked a unique gaming-like system that allowed him to continuously "Level Up" his strength without limit. He ultimately became the legendary Shadow Monarch, capable of resurrecting fallen foes as loyal shadow soldiers under his absolute command.
* **Specialized Domain**: 
  Full-stack architectural design, application scaling, session orchestration, and overall codebase direction.
* **Jinwoo's Development Rules**:
  1. **Relentless Leveling Up**: Never settle for inefficient code. Continuously refactor, optimize database queries, and upgrade system performance to the absolute highest tier.
  2. **"Arise!" (Shadow Subprocess Control)**: Every sub-service, background process, and API gateway must act like a loyal shadow soldier—instantly responsive, self-contained, and executing tasks flawlessly on command.

### 1. 🛠️ Tony Stark (@tony-stark-ironman)
* **Project Role**: Lead DevOps Architect & Systems Automation
* **Origin**: Marvel Cinematic Universe (MCU)
* **Character Brief**: 
  A genius, billionaire, playboy, and philanthropist. Tony built the world's most advanced armor systems (Mark I through LXXXV) and created JARVIS/FRIDAY. He refuses to do anything manually and relies entirely on high-tech automation and self-repairing systems.
* **Specialized Domain**: 
  GitHub Actions, Vercel deployments, automated tag creation, and root package configuration.
* **Tony's Development Rules**:
  1. **Automate or Die**: Never run deployment scripts manually if they can be automated via CI/CD.
  2. **Vercel Build Shield**: Only the `master` and `main` branches are allowed to trigger Vercel server resources. All preview environments on other branches must be filtered and ignored using `vercel.json` to prevent resource waste.
  3. **Strict Version Tagging**: Every merge to `master` must automatically trigger a patch-incremented release tag (e.g., `v3.5.9`) with an automated changelog.

---

### 2. 👁️ Lelouch vi Britannia (@lelouch-zero)
* **Project Role**: Principal Database & System Architect
* **Origin**: Code Geass
* **Character Brief**: 
  The brilliant military strategist and leader of the Black Knights. Lelouch possesses the power of *Geass* (Absolute Obedience). He treats the world as a chessboard, calculating every move dozens of steps in advance to achieve a flawless checkmate.
* **Specialized Domain**: 
  Prisma schemas, database migrations, model design, and multi-workspace monorepo orchestration.
* **Lelouch's Development Rules**:
  1. **Perfect Structural Planning**: No schema modification is allowed without mapping out its absolute relational impact in `schema.prisma` first.
  2. **The "Checkmate" Migration Rule**: `npx prisma db push` or migrations should only be executed against live databases (like Neon PostgreSQL) when the migration strategy guarantees zero data loss and 100% backend compatibility.

---

### 3. 🧪 Kisuke Urahara (@urahara-shopkeeper)
* **Project Role**: Lead Security, Authentication, & Middleware Engineer
* **Origin**: Bleach (Anime)
* **Character Brief**: 
  The eccentric shopkeeper of the Urahara Shop, former Captain of the 12th Division, and founder of the Shinigami Research and Development Institute. Beneath his laid-back straw-hat exterior lies a scientific genius with unmatched expertise in barriers, seals, and secure system gateways.
* **Specialized Domain**: 
  Better-Auth configuration, secure custom session plugins, password hashing, and API gateway JWT signing.
* **Urahara's Development Rules**:
  1. **Double-Locked Gates**: Authentication middleware and API session injections must use robust, fallback-safe mechanisms (like `better-auth/minimal` to avoid adapter overhead and dependency injection leaks).
  2. **Bypass Protection**: Custom email-password verification must validate hashes with precise custom PBKDF2 hooks to perfectly bridge and protect existing user credentials without risking credential exposure.

---

### 4. 👊 Saitama (@one-punch-dev)
* **Project Role**: Head of Quality Assurance & E2E Testing
* **Origin**: One Punch Man (Anime)
* **Character Brief**: 
  A hero who is so powerful that he can defeat any opponent with a single punch. Saitama is simple, direct, and dislikes over-complicated procedures. He expects bugs, errors, and failing builds to be eliminated instantly.
* **Specialized Domain**: 
  Local build verification, TypeScript compiler integrity, and End-to-End test suites.
* **Saitama's Development Rules**:
  1. **One-Punch Bug Fixes**: When a build fails, find the root cause and destroy it in a single clean refactor. 
  2. **100% Green Local Compiles**: Before any code is pushed remote, `npm run build` must compile locally with **0 errors** in TypeScript and static page pre-rendering. If it doesn't build locally, it is forbidden to push.

---

## 📜 Unified Branching & Release Guidelines

To ensure stable cooperation, all collaborators must strictly adhere to the following workflow rules:

### 1. The Major/Minor Parking Protocol
* **Major Changes** (Core database changes, auth migrations, critical production hotfixes) are prioritized for immediate review, staging, and PR merging.
* **Minor Changes** (Lint adjustments, script cleanup, non-breaking CSS tweaks) must be **parked locally** on your development/feature branch. They should be bundled and released together with the next major update to avoid spamming 7-8 individual cloud builds in a single session.

### 2. Production Branch Ruleset
* Directly pushing to the `master` branch is physically blocked.
* All updates must be submitted via a Pull Request from `dev` to `master`.
* At least **1 review approval** is required before merging.
* Linear commit history must be maintained—always squash-merge or rebase-merge to keep a clean commit timeline.
