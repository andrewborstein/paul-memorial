import { list, head } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { writeFile } from 'fs/promises';

// Load environment variables
dotenv.config({ path: '.env.local' });

const OUTPUT_DIR = path.join(process.cwd(), 'src/data/memories');

async function downloadBlobs() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Missing BLOB_READ_WRITE_TOKEN in .env.local');
    process.exit(1);
  }

  console.log('Fetching blob list...');
  let hasMore = true;
  let cursor;
  let count = 0;

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  while (hasMore) {
    const response = await list({
      cursor,
      limit: 1000,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log(`Found ${response.blobs.length} blobs in this batch.`);

    for (const blob of response.blobs) {
      // Filter for JSON files in memories/ path or similar if needed
      // Based on previous findings, it seems we want all JSONs that are memories
      // Some might be at root 'memories/' or 'memories/xyz.json'
      // Inspecting the pathname is important.

      const fileName = path.basename(blob.pathname);
      if (!fileName.endsWith('.json')) continue;

      // Basic check: is it a memory?
      // We might download everything and filter later, or filter by path 'memories/'
      // Earlier listing showed UUIDs and 'mem_' files.

      const destination = path.join(OUTPUT_DIR, fileName);

      try {
        console.log(`Downloading ${blob.pathname}...`);
        const res = await fetch(blob.url);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
        const data = await res.text();

        let json;
        try {
          json = JSON.parse(data);
        } catch (e) {
          console.warn(`Skipping non-JSON file: ${fileName}`);
          continue;
        }

        // Optional: Verify it looks like a memory (has body, created_at, etc)
        // But for migration, safer to take all JSONs that look vaguely correct.

        await writeFile(destination, JSON.stringify(json, null, 2));
        count++;
      } catch (err) {
        console.error(`Error downloading ${fileName}:`, err);
      }
    }

    hasMore = response.hasMore;
    cursor = response.cursor;
  }

  console.log(`\nDownload complete! Total files: ${count}`);
}

downloadBlobs().catch(console.error);
