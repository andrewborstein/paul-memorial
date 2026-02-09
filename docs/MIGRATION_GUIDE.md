# Migration to Git-Based Storage

This guide describes the current Git-backed storage model (Vercel Blob has been replaced).

## Current Architecture

1. **Data Location**: Memories are stored as JSON files in `src/data/memories/`.
2. **Reads**: The app reads from local JSON files at runtime.
3. **Writes**: Create/Edit/Delete commit directly to GitHub via the GitHub API.
4. **Deploy**: Each commit triggers a redeploy (Vercel), so updates appear after a short delay.

## Required Environment Variables

```env
GITHUB_TOKEN=your_personal_access_token_classic_with_repo_scope
GITHUB_OWNER=andrewborstein
GITHUB_REPO=paul-memorial
GITHUB_BRANCH=main
```

Optional for local testing (forces GitHub writes in dev):

```env
USE_GITHUB_DATA=true
```

## Local Testing Notes

- With `USE_GITHUB_DATA=true`, writes go to GitHub even in development.
- Reads are still local; after a write, run `git pull` to see the new file locally.

## Data Backups

- A snapshot backup lives in `backups/initial-migration-snapshot/`.
- Git history is the primary audit trail and recovery mechanism.

## UX Behavior

- New submissions redirect to `/memories/success` because builds take time.
- Expect 1–3 minutes before changes appear on the live site.

## Troubleshooting

- If updates don’t appear: check Vercel build logs and GitHub commit history.
- If writes fail: verify the GitHub token has `repo` scope and is not expired.
