# Migration to Git-Based Storage

This guide explains how to complete the migration from Vercel Blob to Git-based storage (which is free!).

## What Changed

1.  **Data Migration**: Valid production data (memories) has been downloaded from Vercel Blob to `src/data/memories/` in your repository.
2.  **Reads**: The application now reads data directly from these local JSON files instead of fetching from Vercel Blob. This makes reads instant and free.
3.  **Writes**: Creating a new memory now uses the GitHub API to commit the new memory file directly to your repository. This triggers a redeploy of the site with the new content.

## Setup Steps

### 1. Environment Variables

You need to add the following variables to your Vercel Project Settings (and `.env.local` for local development):

```env
GITHUB_TOKEN=your_personal_access_token_classic_with_repo_scope
GITHUB_OWNER=andrewborstein
GITHUB_REPO=paul-memorial
GITHUB_BRANCH=main
```

**How to get a Token:**

1.  Go to GitHub Settings -> Developer Settings -> Personal Access Tokens -> Tokens (classic).
2.  Generate new token.
3.  Select `repo` scope (covers all repo actions).
4.  Copy the token.

### 2. Verify Data

Check the `src/data/memories` folder. I have already run the migration script and cleaned up test/junk data (removed ~45 junk files). You should see your ~45 valid production memories there.

### 3. Deploy

You can now commit and push the changes.

`git add .`
`git commit -m "Migrate to Git-based storage (with cleaned data)"`
`git push`

## Maintenance

- **Backups**: Your git repository IS your backup.
- **Editing**: You can edit JSON files directly in GitHub or VS Code.
- **Deleting**: The delete button in the UI now works and will delete the JSON file from the repository via API.

## Troubleshooting

- If new memories aren't showing up, check Vercel Logs for the API route. It might be a GitHub permission issue.
- The site might take a few minutes to update after a new memory is added (as it triggers a build or cache revalidation).
