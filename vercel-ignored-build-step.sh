#!/bin/bash

# Vercel Ignored Build Step script
# Restricts automatic deployments to only trigger when changes are merged into the production branch ('main')

echo "🚀 Vercel Deployment Trigger Check"
echo "Current Branch (VERCEL_GIT_COMMIT_REF): '$VERCEL_GIT_COMMIT_REF'"

if [ "$VERCEL_GIT_COMMIT_REF" = "master" ] || [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then
  echo "✅ Target branch is '$VERCEL_GIT_COMMIT_REF' (Production). Proceeding with Vercel deployment!"
  exit 1
else
  echo "🛑 Target branch is '$VERCEL_GIT_COMMIT_REF' (not Production). Skipping Vercel build."
  exit 0
fi
