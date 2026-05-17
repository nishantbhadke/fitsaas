# FitSaaS

FitSaaS is a clean fitness tracking app for logging workouts, checking progress, and sharing workout wins without clutter.

## What It Does

- Browse a categorized workout library with polished exercise cards.
- Log workouts with duration and notes.
- Save workout history to your personal account.
- View progress with dashboard charts, workout type breakdowns, and consistency tracking.
- Export a social-ready workout summary image from recent logs.
- Sign in securely with Google.

## What It Is Built With

- **Web app**: Next.js and TailwindCSS
- **Backend**: Fastify API
- **Database**: Neon PostgreSQL with Prisma
- **Hosting plan**: Vercel for the web app, Render free tier for the API, Neon free tier for the database

## Hosting Setup

### Backend on Render

Use the included `render.yaml` file to deploy the API on Render's free web service plan.

Add these Render environment variables:

- `DATABASE_URL`: your Neon PostgreSQL connection string
- `JWT_SECRET`: a long random secret for API tokens

Render will install dependencies, generate Prisma, build the API, and push the Prisma schema to Neon during deployment.

### Frontend on Vercel

Import the GitHub repository into Vercel and set the root directory to `apps/web`.

Add these Vercel environment variables:

- `NEXTAUTH_URL`: your Vercel app URL
- `NEXTAUTH_SECRET`: a long random secret for NextAuth
- `NEXT_PUBLIC_API_URL`: your Render API URL
- `GOOGLE_CLIENT_ID`: your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: your Google OAuth client secret

After the Render API is live, update `NEXT_PUBLIC_API_URL` in Vercel and redeploy the frontend.

## Android App Path

The fastest free path for Android is a Progressive Web App or Trusted Web Activity using the live Vercel URL. After the site is live, use PWABuilder to package it for Android without rewriting the app.

## Future Ideas

- Streaks and badges for consistency.
- Offline support for gym use.
- Manual dark mode toggle.
- Better workout templates and personal goals.

## Security

Secrets, `.env` files, and local database files are ignored by git. Keep real credentials inside Vercel, Render, and Neon settings rather than committing them to the repository.
