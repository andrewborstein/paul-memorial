import { Octokit } from '@octokit/rest';
import { posix } from 'path';

/**
 * Resolve a caller-supplied filename to a repo path.
 *
 * Callers pass things like "abc.json" or "../redirects/abc.json". The latter
 * must be normalised here: Octokit percent-encodes the path, and GitHub
 * rejects an encoded ".." with "path contains a malformed path component".
 */
function repoPathFor(filename: string) {
  return posix.normalize(`src/data/memories/${filename}`);
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : null;

/** One file to write, or delete, inside a single commit. */
export type FileChange =
  | { path: string; content: object }
  | { path: string; delete: true };

function shouldWriteLocally() {
  const forceGithub = process.env.USE_GITHUB_DATA === 'true';
  if (!octokit || !GITHUB_OWNER || !GITHUB_REPO) {
    if (process.env.NODE_ENV === 'development' && !forceGithub) return true;
    throw new Error(
      'GitHub configuration missing (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO)'
    );
  }
  return process.env.NODE_ENV === 'development' && !forceGithub;
}

/**
 * Apply several file changes as ONE commit, via the Git Data API.
 *
 * The contents API can only touch a single file per call, so an edit used to
 * land as three commits -- write new, write redirect, delete old -- which
 * meant three pushes, and a window where the site showed the memory twice
 * because only some of them had deployed. Committing a whole tree at once
 * makes the edit atomic: it either all lands or nothing does.
 */
export async function commitFiles(message: string, changes: FileChange[]) {
  if (!changes.length) return;

  if (shouldWriteLocally()) {
    const fs = await import('fs/promises');
    const path = await import('path');
    for (const change of changes) {
      const filePath = path.join(process.cwd(), change.path);
      if ('delete' in change) {
        await fs.unlink(filePath).catch(() => {});
      } else {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(change.content, null, 2));
      }
    }
    console.log(`Applied ${changes.length} local change(s): ${message}`);
    return;
  }

  const owner = GITHUB_OWNER!;
  const repo = GITHUB_REPO!;

  const { data: ref } = await octokit!.git.getRef({
    owner,
    repo,
    ref: `heads/${GITHUB_BRANCH}`,
  });
  const parent = ref.object.sha;
  const { data: parentCommit } = await octokit!.git.getCommit({
    owner,
    repo,
    commit_sha: parent,
  });

  const { data: tree } = await octokit!.git.createTree({
    owner,
    repo,
    base_tree: parentCommit.tree.sha,
    tree: changes.map((change) => ({
      path: change.path,
      mode: '100644' as const,
      type: 'blob' as const,
      // A null sha removes the path from the tree.
      ...('delete' in change
        ? { sha: null }
        : { content: JSON.stringify(change.content, null, 2) }),
    })),
  });

  const { data: commit } = await octokit!.git.createCommit({
    owner,
    repo,
    message,
    tree: tree.sha,
    parents: [parent],
  });

  await octokit!.git.updateRef({
    owner,
    repo,
    ref: `heads/${GITHUB_BRANCH}`,
    sha: commit.sha,
  });

  console.log(`Committed ${changes.length} change(s) as ${commit.sha}`);
}

export async function saveMemoryToRepo(filename: string, content: object) {
  // Allow forcing GitHub operations in development via env var
  const forceGithub = process.env.USE_GITHUB_DATA === 'true';

  if (!octokit || !GITHUB_OWNER || !GITHUB_REPO) {
    if (process.env.NODE_ENV === 'development' && !forceGithub) {
      const fs = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'src/data/memories', filename);
      await fs.writeFile(filePath, JSON.stringify(content, null, 2));
      console.log('Saved memory locally:', filePath);
      return;
    }
    throw new Error(
      'GitHub configuration missing (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO)'
    );
  }

  // Double check development fallback if config exists but we want local fs
  if (process.env.NODE_ENV === 'development' && !forceGithub) {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'src/data/memories', filename);
    await fs.writeFile(filePath, JSON.stringify(content, null, 2));
    console.log('Saved memory locally:', filePath);
    return;
  }

  const path = repoPathFor(filename);
  const message = `Add/Update memory: ${posix.basename(filename)}`;
  const jsonContent = JSON.stringify(content, null, 2);
  const buffer = Buffer.from(jsonContent, 'utf-8');
  const contentBase64 = buffer.toString('base64');

  try {
    // Check if file exists to get SHA (for update)
    let sha: string | undefined;
    try {
      const { data } = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path,
        ref: GITHUB_BRANCH,
      });
      if (data && !Array.isArray(data) && data.sha) {
        sha = data.sha;
      }
    } catch (e) {
      // File doesn't exist, ignore
    }

    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path,
      message,
      content: contentBase64,
      branch: GITHUB_BRANCH,
      sha,
    });
    console.log(`Saved memory to GitHub: ${path}`);
  } catch (error) {
    console.error('Error saving to GitHub:', error);
    throw error;
  }
}

export async function deleteFileFromRepo(filename: string) {
  // Allow forcing GitHub operations in development via env var
  const forceGithub = process.env.USE_GITHUB_DATA === 'true';

  if (!octokit || !GITHUB_OWNER || !GITHUB_REPO) {
    if (process.env.NODE_ENV === 'development' && !forceGithub) {
      const fs = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'src/data/memories', filename);
      try {
        await fs.unlink(filePath);
        console.log('Deleted memory locally:', filePath);
      } catch (e) {
        // Ignore if not found
      }
      return;
    }
    throw new Error('GitHub configuration missing for delete');
  }

  // Double check development fallback
  if (process.env.NODE_ENV === 'development' && !forceGithub) {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'src/data/memories', filename);
    try {
      await fs.unlink(filePath);
      console.log('Deleted memory locally:', filePath);
    } catch (e) {
      // Ignore
    }
    return;
  }

  const path = repoPathFor(filename);
  const message = `Delete memory: ${posix.basename(filename)}`;

  try {
    // Get SHA first (required for delete)
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path,
      ref: GITHUB_BRANCH,
    });

    if (Array.isArray(data) || !data.sha) {
      throw new Error('File not found or is a directory');
    }

    await octokit.repos.deleteFile({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path,
      message,
      branch: GITHUB_BRANCH,
      sha: data.sha,
    });
    console.log(`Deleted file from GitHub: ${path}`);
  } catch (error: any) {
    if (error.status === 404) {
      console.log('File already deleted or not found on GitHub');
      return;
    }
    console.error('Error deleting from GitHub:', error);
    throw error;
  }
}
