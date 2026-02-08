import { list } from '@vercel/blob';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listAllBlobs() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Missing BLOB_READ_WRITE_TOKEN');
    return;
  }

  console.log('Listing all blobs...');
  let hasMore = true;
  let cursor;

  while (hasMore) {
    const response: any = await list({
      cursor,
      limit: 1000,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    for (const blob of response.blobs) {
      console.log(
        `${blob.pathname} \t (${blob.size} bytes) \t ${blob.uploadedAt.toISOString()}`
      );
    }

    hasMore = response.hasMore;
    cursor = response.cursor;
  }
}

listAllBlobs().catch(console.error);
