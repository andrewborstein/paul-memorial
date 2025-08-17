import fs from 'fs/promises'
import path from 'path'
import { listTributes } from '../src/lib/notion'

async function main(){
  const outDir = path.join(process.cwd(), 'data', 'tributes')
  await fs.mkdir(outDir, { recursive: true })
  const items = await listTributes()
  for (const t of items) {
    const fname = `${t.createdAt.replace(/[:.]/g,'-')}_${t.id}.json`
    await fs.writeFile(path.join(outDir, fname), JSON.stringify(t, null, 2), 'utf8')
  }
  console.log(`Exported ${items.length} tributes to /data/tributes`)
}
main().catch(e=>{ console.error(e); process.exit(1) })
