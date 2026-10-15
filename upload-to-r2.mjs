import { readdir } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const IMAGES_DIR = join(import.meta.dirname, 'public', 'images')
const BUCKET = 'xingxueji-images'

async function main() {
  const files = (await readdir(IMAGES_DIR)).filter(f => /\.(webp|jpg|jpeg|png|gif)$/i.test(f))
  console.log(`Found ${files.length} images to upload\n`)

  let success = 0
  let failed = 0

  for (const file of files) {
    const filePath = join(IMAGES_DIR, file)
    const objectKey = file
    try {
      await execAsync(`wrangler r2 object put ${BUCKET}/${objectKey} --file "${filePath}" --remote`)
      success++
      console.log(`[${success}/${files.length}] ✓ ${file}`)
    } catch (err) {
      failed++
      console.error(`[${success + failed}/${files.length}] ✗ ${file} — ${err.stderr || err.message}`)
    }
  }

  console.log(`\nDone: ${success} uploaded, ${failed} failed`)
}

main()
