const fs = require('fs');
const path = require('path');

const MEMORIES_DIR = path.join(process.cwd(), 'src/data/memories');

function cleanupJunk() {
  if (!fs.existsSync(MEMORIES_DIR)) {
    console.log('Memories directory not found.');
    return;
  }

  const files = fs.readdirSync(MEMORIES_DIR);
  let deletedCount = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const filePath = path.join(MEMORIES_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const memory = JSON.parse(content);

      if (isJunk(memory)) {
        console.log(
          `Deleting junk memory: "${memory.name}" (${memory.email}) - Body: "${memory.body.substring(0, 30)}..."`
        );
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    } catch (err) {
      console.error(`Error processing file ${file}:`, err);
    }
  }

  console.log(`\nCleanup complete. Deleted ${deletedCount} junk memories.`);
}

function isJunk(memory) {
  const name = (memory.name || '').toLowerCase();
  const email = (memory.email || '').toLowerCase();
  const body = (memory.body || '').trim().toLowerCase();
  const title = (memory.title || '').toLowerCase();

  // 1. Explicit Junk Names
  if (
    name.includes('foo boo') ||
    name.includes('foo bar') ||
    name.includes('test test')
  )
    return true;

  // 2. Explicit Junk Emails
  if (
    email.includes('foo@') ||
    email.includes('test@') ||
    email.endsWith('@example.com')
  )
    return true;

  // 3. Junk Content (Short "Test" or "Foo")
  // Be careful not to match real bodies containing "test" or "foo" (like "greatest", "food")
  if (body === 'test' || body === 'foo' || body === 'bar') return true;
  if (title === 'test' || title === 'foo') return true;

  return false;
}

cleanupJunk();
