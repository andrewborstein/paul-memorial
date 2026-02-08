const fs = require('fs');
const path = require('path');
const { list } = require('@vercel/blob');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

// We explicitly migrate 'prod' data as that's the valuable one
const PREFIX = 'prod';
const DATA_DIR = path.join(process.cwd(), 'src/data');

const dirs = ['memories', 'redirects'];
dirs.forEach((d) => {
  const p = path.join(DATA_DIR, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

console.log(`Migrating '${PREFIX}' blobs to: ${DATA_DIR}`);

async function migrate() {
  const token =
    process.env.BLOB_READ_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error('No token');
    return;
  }

  let cursor;
  let hasMore = true;
  let count = 0;

  while (hasMore) {
    const response = await list({
      prefix: PREFIX, // List everything in 'prod/'
      cursor,
      token,
      limit: 1000,
    });

    for (const blob of response.blobs) {
      if (!blob.pathname.endsWith('.json')) continue;

      // Handle prod/memories/uuid.json -> src/data/memories/uuid.json
      const parts = blob.pathname.split('/');
      // parts[0] is 'prod'
      // parts[1] is 'memories', 'redirects', or 'index-items'
      const category = parts[1];
      const filename = parts[parts.length - 1];

      if (category === 'memories' || category === 'redirects') {
        const filePath = path.join(DATA_DIR, category, filename);

        // Skip index items as we rebuild index from memories
        if (category === 'index-items') continue;

        try {
          const res = await fetch(blob.downloadUrl);
          if (!res.ok) throw new Error(`Failed to fetch`);
          const data = await res.json();
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          process.stdout.write('.');
          count++;
        } catch (err) {
          console.error(`\nError ${blob.pathname}:`, err.message);
        }
      }
    }
    cursor = response.cursor;
    hasMore = response.hasMore;
  }
  console.log(`\nFinished! Downloaded ${count} files.`);
}

migrate().catch(console.error);
