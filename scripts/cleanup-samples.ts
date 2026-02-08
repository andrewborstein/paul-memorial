const fs = require('fs');
const path = require('path');

// Define the test memories array (extracted from src/app/api/admin/bulk-create/route.ts)
const testMemories = [
  { name: 'Sarah Johnson', email: 'sarah.j@example.com' },
  { name: 'Mike Chen', email: 'mike.chen@example.com' },
  { name: 'Emily Rodriguez', email: 'emily.r@example.com' },
  { name: 'David Thompson', email: 'david.t@example.com' },
  { name: 'Lisa Park', email: 'lisa.park@example.com' },
  { name: 'James Wilson', email: 'james.w@example.com' },
  { name: 'Rachel Green', email: 'rachel.g@example.com' },
  { name: 'Alex Martinez', email: 'alex.m@example.com' },
  { name: 'Jennifer Lee', email: 'jennifer.lee@example.com' },
  { name: 'Robert Kim', email: 'robert.kim@example.com' },
  { name: 'Amanda Foster', email: 'amanda.f@example.com' },
  { name: 'Chris Davis', email: 'chris.davis@example.com' },
  { name: 'Maria Garcia', email: 'maria.g@example.com' },
  { name: 'Tom Anderson', email: 'tom.a@example.com' },
  { name: 'Nina Patel', email: 'nina.patel@example.com' },
  { name: "Kevin O'Brien", email: 'kevin.obrien@example.com' },
  { name: 'Sophie Turner', email: 'sophie.t@example.com' },
  { name: 'Daniel Brown', email: 'daniel.brown@example.com' },
  { name: 'Jessica White', email: 'jessica.white@example.com' },
  { name: 'Ryan Clark', email: 'ryan.clark@example.com' },
  { name: 'Kate Miller', email: 'kate.m@example.com' },
  { name: 'Sam Johnson', email: 'sam.j@example.com' },
  { name: 'Emma Davis', email: 'emma.d@example.com' },
  { name: 'Mark Wilson', email: 'mark.w@example.com' },
  { name: 'Anna Chen', email: 'anna.chen@example.com' },
  { name: 'John Smith', email: 'john.smith@example.com' },
  { name: 'Lisa Wong', email: 'lisa.wong@example.com' },
  { name: 'Mike Rodriguez', email: 'mike.r@example.com' },
  { name: 'Sarah Kim', email: 'sarah.kim@example.com' },
  { name: 'David Lee', email: 'david.lee@example.com' },
  { name: 'Jennifer Adams', email: 'jennifer.adams@example.com' },
  { name: 'Michael Thompson', email: 'michael.t@example.com' }, // Assuming this was the last one cut off
];

const MEMORIES_DIR = path.join(process.cwd(), 'src/data/memories');

async function cleanupSampleMemories() {
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

      // Check if this memory matches any of the test memories
      const isSample = testMemories.some(
        (sample) => memory.name === sample.name && memory.email === sample.email
      );

      if (isSample) {
        console.log(
          `Deleting sample memory: ${memory.name} (${memory.email}) - ${file}`
        );
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    } catch (err) {
      console.error(`Error processing file ${file}:`, err);
    }
  }

  console.log(`\nCleanup complete. Deleted ${deletedCount} sample memories.`);
}

cleanupSampleMemories();
