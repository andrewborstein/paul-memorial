const fs = require('fs');
const path = require('path');
const { list } = require('@vercel/blob');
const dotenv = require('dotenv');

// You need to load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const BLOB_PREFIX = process.env.BLOB_PREFIX || '';
const DATA_DIR = path.join(process.cwd(), 'src/data/memories');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

console.log('Downloading blobs to:', DATA_DIR);

async function downloadBlobs() {
  const token = process.env.BLOB_READ_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error('Error: No BLOB token found in environment variables.');
    // Don't fail if no token, just warn (for the user flow if they run it blindly)
    console.log('Skipping download as no token found.');
    return;
  }

  let cursor;
  let hasMore = true;
  let count = 0;

  while (hasMore) {
    const response = await list({
      prefix: BLOB_PREFIX ? `${BLOB_PREFIX}/memories/` : 'memories/',
      cursor,
      token,
      limit: 1000,
    });

    for (const blob of response.blobs) {
      if (!blob.pathname.endsWith('.json')) continue;

      const filename = path.basename(blob.pathname);
      const filePath = path.join(DATA_DIR, filename);

      try {
        const res = await fetch(blob.downloadUrl);
        if (!res.ok) throw new Error(`Failed to fetch ${blob.url}: ${res.statusText}`);
        
        const data = await res.json();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Saved: ${filename}`);
        count++;
      } catch (err) {
        console.error(`Error downloading ${blob.pathname}:`, err);
      }
    }

    cursor = response.cursor;
    hasMore = response.hasMore;
  }

  console.log(`Finished! Downloaded ${count} memories.`);
}

downloadBlobs().catch(console.error);
