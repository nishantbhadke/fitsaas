# FitSaaS

A sleek, premium fitness tracking ecosystem designed for performance and aesthetics. Track your workouts, analyze your progress, and stay consistent with zero clutter.

## Features
- 🏋️ **Workout Library**: Categorized exercises with a modern flip-card interface.
- 📊 **Dynamic Dashboard**: Beautiful SVG-based progress tracking and consistency heatmaps.
- 🔒 **Secure Authentication**: Google OAuth and seamless JWT session management.

## Tech Stack
FitSaaS is built as a monorepo for maximum developer efficiency and speed:
- **Frontend (Web)**: Next.js with TailwindCSS.
- **Backend (API)**: Fastify (a high-performance Node.js framework).
- **Database**: SQLite managed by Prisma ORM.

> **Security Note**: All environment variables and local databases (`*.db`) are strictly ignored in `.gitignore`. Your credentials and user data are never pushed to the repository.

## Hosting & Deployment
The app is fully configured for live deployment:
- **Frontend**: Deploy `apps/web` on Vercel.
- **Backend**: Deploy `apps/api` on Render using the included `render.yaml` configuration (which mounts a persistent disk so your SQLite database is never wiped).

## Future Roadmap Ideas
Want to make the app even better? Here are some features we could build next:
- [ ] **Social Sharing**: Export a beautiful image of your workout summary for Instagram/Twitter.
- [ ] **Gamification**: Earn badges for 7-day or 30-day workout streaks.
- [ ] **Offline Mode (PWA)**: Make the app installable on mobile devices so you can track workouts in the gym without internet.
- [ ] **Dark Mode Toggle**: Allow users to manually switch themes rather than relying purely on system preferences.
