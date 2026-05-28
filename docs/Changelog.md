# FitSaaS V3 Changelog

All notable changes to the FitSaaS ecosystem are documented here.

## [v3.0.0] - 2026-05-28

### Added
- **Women's Health Integration**:
  - Expanded Prisma schema (`User` model) with `gender`, `cycleLength`, and `lastPeriodStart`.
  - Added a highly responsive "Cycle Insight" dashboard widget showing current menstrual phase and custom workout recommendations.
  - Implemented profile customization fields under dashboard `/profile`.
- **Dedicated Authentication**:
  - Created standalone, high-aesthetic `/login` and `/register` pages.
  - Added standard Email/Password authentication provider in NextAuth and Fastify alongside Google OAuth.
- **Obsidian vault synchronization pipelines**:
  - Automatically creating workspace logs, architecture systems, and changelogs inside local Obsidian vault.

### Fixed
- **Workout Card Engine**:
  - Solved absolute Y-axis 3D flipping card jitter by implementing hardware-accelerated CSS layers.
  - Resolved dynamic card heights to ensure the "Save Workout Record" button is 100% visible and correctly aligned without overlapping cards below it.
- **Recent Logs Instant Sync**:
  - Re-fetched user profiles and workout state cleanly across route changes, eliminating lagging dashboard data flashes.
