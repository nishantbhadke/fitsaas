# FitSaaS V3 Enhancement Implementation Plan

This note maps the checklist and deliverables for the approved V3 enhancements.

## Feature Breakdown

### 1. Database Schema
- [x] Modify `schema.prisma` in `packages/database`.
- [x] Define `Gender` enum.
- [x] Push schema changes to Neon database (`npx prisma db push`).

### 2. Service Endpoints
- [x] Add `/me` profile retrieval route in Fastify `/auth`.
- [x] Add `/profile` update route in Fastify `/auth`.
- [x] Update `/register` and `/login` return contracts to include new parameters.

### 3. Dedicated Authentication
- [x] Wire Credentials Provider inside `next-auth` (`route.ts`).
- [x] Build dark-themed `/login` screen.
- [x] Build `/register` free account screen.

### 4. Dynamic Insights
- [x] Build dynamic menstrual cycle calculator inside overview page.
- [x] Render custom "Cycle Insight" alerts and suggestions for female users.
- [x] Code `/profile` settings forms to log details.

### 5. UI Stabilizations
- [x] Add 3D Y-axis CSS utilities inside `globals.css`.
- [x] Re-architect `WorkoutCard` with active-face relative positioning to avoid clipping.
