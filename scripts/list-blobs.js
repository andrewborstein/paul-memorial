const { list } = require('@vercel/blob');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function listBlobs() {
  const token =
    process.env.BLOB_READ_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error('No token');
    return;
  }

  let cursor;
  let hasMore = true;
  while (hasMore) {
    const res = await list({ token, cursor, limit: 1000 });
    res.blobs.forEach((b) => console.log(b.pathname));
    cursor = res.cursor;
    hasMore = res.hasMore;
  }
}

listBlobs().catch(console.error);
