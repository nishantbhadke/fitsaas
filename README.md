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

### 1. Backend (Render)
Deploy `apps/api` on Render using the included `render.yaml` configuration. This mounts a persistent disk (`/data`) so your SQLite database is never wiped between deploys.

### 2. Frontend (Vercel)
1. Push this repository to your GitHub account.
2. Log into Vercel and click "Add New Project", then import this repository.
3. In the Vercel project settings, set the **Root Directory** to `apps/web`.
4. Add your Environment Variables (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_API_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
5. Click **Deploy**. Your sleek web app is now live!

## How to Build the Android App
Because FitSaaS uses a secure, server-side Next.js architecture, the absolute best way to publish it as an Android app is via a **Trusted Web Activity (TWA)**. This transforms your live Vercel website into an official `.apk`/`.aab` package for the Google Play Store with zero code changes.

1. Deploy your app to Vercel (see above).
2. Go to **[PWABuilder.com](https://www.pwabuilder.com/)** and enter your Vercel URL.
3. PWABuilder will automatically package your app into a high-performance Android `.apk` file that you can install on any Android phone or upload to the Google Play Console!

## Future Roadmap Ideas
Want to make the app even better? Here are some features we could build next:
- [ ] **Social Sharing**: Export a beautiful image of your workout summary for Instagram/Twitter.
- [ ] **Gamification**: Earn badges for 7-day or 30-day workout streaks.
- [ ] **Offline Mode (PWA)**: Make the app installable on mobile devices so you can track workouts in the gym without internet.
- [ ] **Dark Mode Toggle**: Allow users to manually switch themes rather than relying purely on system preferences.
