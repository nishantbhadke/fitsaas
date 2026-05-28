# 🏋️‍♂️ FitSaaS — Production-Grade Workout & Menstrual Cycle Tracking Platform

FitSaaS is a premium, monorepo-based PWA fitness tracking application designed for logging workouts, automatic consistency tracking, and women's health menstrual cycle training synchronization. It delivers phase-tailored aerobic/resistance routines, body metrics forecasting, and high-aesthetic analytical dashboards without clutter.

---

## 🚀 Key Features

* **🌸 Symmetrical Menstrual Cycle Synergy Tracker**: Automatically calculates menstrual phases (Menstrual, Follicular, Ovulatory, Luteal) based on biological cycle spans and logs tailored workout routines, specific intensities, and phase-appropriate nutrition advice.
* **📊 Modern Analytical Widgets**: Glassmorphic stats dashboards displaying active streaks, all-time statistics, a 14-day activity line chart, workout category breakdowns, and a consistency heatmap.
* **🏋️ Symmetrical Profile & Constraints Guard**: Prevents invalid values with strict range validations, positive-only bounds (e.g. no negative weight/height), and future-date blocks.
* **📅 Target Weight Milestones & Calendar Invitation Downloader**: Calculates target milestone dates at a healthy 0.5 kg/week pace and allows users to download standard `.ics` calendar invitation files to sync target milestones to Google or Apple Calendar.
* **🍛 Calorie-Scaled Indian High-Protein Diet Customizer**: Generates custom dietary plans scaled to daily calorie targets for Vegetarian, Non-Vegetarian, and Vegan athletes with dynamic gluten/lactose exclusion options.
* **🔒 2-Minute Inactivity Session Killing & Vercel Auto-Logout Detection**: Monitored client-side user activity listeners instantly end sessions after 2 minutes of idle time. Tracks remote bundle build timestamps to automatically invalidate and sign out expired sessions on new Vercel deploys.

---

## 🏗 System Topology & Architecture

FitSaaS is structured as a modern turborepo-style monorepo, separating concerns into decoupled client, API server, and shared database ORM packages.

### 📦 Package Structure

```
├── apps
│   ├── web/      # Frontend Next.js 16 Web Portal (React 19 + Turbopack + Tailwind v4)
│   ├── api/      # Backend Fastify 4 API Server (TypeScript + JWT Session Guard)
│   └── mobile/   # Mobile App Wrapper Target
└── packages
    └── database/ # Database Layer (ORM Prisma Client Client + Neon PostgreSQL schema)
```

### 🗺 System Architecture Diagram

```mermaid
graph TD
    classDef client fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#fff;
    classDef api fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff;
    classDef db fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff;
    classDef auth fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff;

    subgraph ClientLayer ["Client Layer (apps/web)"]
        Web[Next.js 16 Portal]:::client
        NextAuth[NextAuth.js Client]:::auth
    end

    subgraph ServiceLayer ["Service Layer (apps/api)"]
        Fastify[Fastify 4 Server]:::api
        JWT["@fastify/jwt Guard"]:::auth
    end

    subgraph DatabaseLayer ["Database Layer (packages/database)"]
        Prisma[Prisma Client ORM]:::db
        NeonDB[("Neon Serverless PostgreSQL")]:::db
    end

    Web --> NextAuth
    NextAuth -- "JWT Credentials / Google OAuth" --> Fastify
    Fastify --> JWT
    Fastify --> Prisma
    Prisma --> NeonDB
```

---

## 🔄 Detailed Activity Sequence Diagram

This sequence diagram outlines the entire workflow of the application, encompassing secure user session checks, database synchronization, onboarding setup, and workout logging operations:

```mermaid
sequenceDiagram
    autonumber
    actor User as Athlete
    participant Web as Next.js Web App
    participant Auth as NextAuth.js
    participant API as Fastify API
    participant DB as Neon PostgreSQL

    User->>Web: Access /dashboard (Session Check)
    Web->>Auth: Retrieve active session
    alt Session is Active
        Auth-->>Web: Session Active (appToken present)
    else Session is Expired / Missing
        Auth-->>Web: Redirect to /login
        User->>Web: Select Google OAuth or Credentials
        Web->>Auth: Initiate Authenticate
        Auth->>API: POST /auth/google (or /auth/login)
        API->>DB: Find/Create User record
        DB-->>API: Return User entity
        API->>API: Generate @fastify/jwt (appToken)
        API-->>Auth: Return appToken + User JSON
        Auth-->>Web: Establish session cookies
        Web-->>User: Render Dashboard
    end

    rect rgb(30, 41, 59)
        note right of Web: Onboarding Profile Verification Flow
        Web->>API: GET /auth/me (Auth: Bearer appToken)
        API->>DB: Fetch user metrics
        DB-->>API: User details (weight, height, gender, birthDate)
        API-->>Web: Return User Profile JSON
        alt Missing onboarding fields? (gender, weight, height, birthDate)
            Web-->>User: Display Onboarding setup banner
            User->>Web: Submits /profile form details
            Web->>API: PUT /auth/profile
            API->>DB: Update User record
            DB-->>API: Profile saved
            API-->>Web: Success JSON
            Web->>Auth: updateSession() (Sync context)
            Web-->>User: Hide Onboarding Banner
        else All fields complete
            Web-->>User: Render cycle phase widgets & workouts
        end
    end

    rect rgb(20, 80, 50)
        note right of Web: Workout CRUD & Cycle Tracking Pacing
        User->>Web: View Menstrual health widget
        Web->>Web: getCycleInfo(lastPeriodStart, cycleLength)
        Web-->>User: Phase-tailored exercises, intensity, nutrition
        User->>Web: Save workout log (duration, notes)
        Web->>API: POST /workouts
        API->>DB: Create Workout record (linked to User)
        DB-->>API: Success response
        API-->>Web: Log saved
        Web-->>User: Dynamic UI updates & active streak count increments
    end
```

---

## 🛠️ Local Development Installation

### Prerequisites
* Node.js v18 or v20
* A live Neon Serverless PostgreSQL Database instance (or any equivalent PostgreSQL database)

### Setup Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/nishantbhadke/fitsaas.git
   cd fitness-app
   ```

2. **Configure Environment Variables**:
   * Create `apps/web/.env.local` for the web portal:
     ```env
     NEXTAUTH_URL=http://localhost:3000
     NEXTAUTH_SECRET=generate-a-random-nextauth-secret-key
     NEXT_PUBLIC_API_URL=http://localhost:3001
     GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
     ```
   * Create `apps/api/.env` and `packages/database/.env` for the database and API server:
     ```env
     JWT_SECRET=your-secure-fastify-jwt-secret-key
     DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
     ```

3. **Install Monorepo Dependencies**:
   ```bash
   npm install
   ```

4. **Synchronize Prisma & Database Schema**:
   Generate client and push the schema directly to your live database instance:
   ```bash
   npx prisma db push --schema=packages/database/prisma/schema.prisma
   ```

5. **Start Dev Servers Concurrently**:
   Run the dev servers inside both frontend and backend workspaces concurrently from the root directory:
   ```bash
   npm run dev
   ```

*Note: On Windows systems, you can also launch the workspaces in separate dedicated terminals to isolate the log streams:*
* **Backend API**: `npm run dev --workspace=api` (Active at [http://localhost:3001](http://localhost:3001))
* **Frontend Web App**: `npm run dev --workspace=web` (Active at [http://localhost:3000](http://localhost:3000))

---

## 📦 Production Build & Deployments

### 🐳 Backend Deploy (Render)
Render utilizes the pre-configured `render.yaml` blueprint. Connect the repository, define your environment variables (`DATABASE_URL`, `JWT_SECRET`), and deploy. Fastify will install dependencies, generate the Prisma client, and launch the server.

### ⚡ Frontend Deploy (Vercel)
Import the monorepo, set the root workspace directory target to `apps/web`, bind the environment variables (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_API_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), and build.

---

## 📱 Mobile App Compilation Guide
Since FitSaaS is fully PWA-enabled with registered active service workers, you can package and publish it to the Google Play Store and Apple App Store for free using **PWABuilder** (Microsoft's open-source tool):

### iOS & Android Packaging Checklist
1. Build and host your frontend portal live on Vercel.
2. Visit **[PWABuilder.com](https://www.pwabuilder.com)** and enter your live URL.
3. Once verification succeeds (scoring 100% due to full service worker and secure TLS support), select **Generate App**.
4. Configure your parameters (e.g. Package ID: `com.fitsaas.app`, Launcher Title: `FitSaaS`).
5. Download the pre-built packages:
   * **Android**: Generates a signed, production-ready `.apk` and `.aab` file for immediate Play Store submission.
   * **iOS**: Generates the complete Xcode project wrapper to build, sign, and submit directly via Xcode on a macOS device.

---

## 🛡️ Security & Disclosures
* Secrets, environment parameters (`.env`, `.env.local`), and local sqlite database entries are locked and ignored by git.
* Production source maps have been entirely deactivated (`productionBrowserSourceMaps: false` in `next.config.ts`) to avoid disclosing original TypeScript source code files.
* Production sites have built-in Chrome DevTools inspection protection (blocks Right-Click, F12, and inspector key combinations) to safeguard active application scripts.
