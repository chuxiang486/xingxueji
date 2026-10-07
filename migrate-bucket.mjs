import { readFileSync, readdirSync, createReadStream } from 'fs'
import { join, basename } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const qiniu = require('qiniu')

// ============ 配置区 ============
const QINIU_ACCESS_KEY = '9qgLzhmQMu77v85Qa5ZPczPSi4bXgOsNhqg4n86E'
const QINIU_SECRET_KEY = 'DTRMrnWf2VjaScSutVV2qGWXVCvmeZvkzdDmIa2U'
const NEW_BUCKET = 'xingxueji-music6'
const MUSIC_DIR = 'D:/音乐'
const MUSIC_JS_PATH = './src/data/music.js'
// ================================

const mac = new qiniu.auth.digest.Mac(QINIU_ACCESS_KEY, QINIU_SECRET_KEY)
const putPolicy = new qiniu.rs.PutPolicy({ scope: NEW_BUCKET })
const uploadToken = putPolicy.uploadToken(mac)

function uploadFile(filePath, filename) {
  return new Promise((resolve, reject) => {
    const formUploader = new qiniu.form_up.FormUploader()
    const putExtra = new qiniu.form_up.PutExtra()
    const readable = createReadStream(filePath)

    formUploader.putStream(uploadToken, filename, readable, putExtra, (err, body, info) => {
      if (err) reject(err)
      else resolve(body)
    })
  })
}

async function main() {
  const musicContent = readFileSync(MUSIC_JS_PATH, 'utf-8')
  const urlMatches = [...musicContent.matchAll(/"url":\s*"\/music\/([^"]+)"/g)]
  const expectedFiles = new Set(urlMatches.map(m => decodeURIComponent(m[1])))

  const allFiles = readdirSync(MUSIC_DIR).filter(f => /\.(mp3|ogg)$/i.test(f))
  const filesToUpload = allFiles.filter(f => expectedFiles.has(f))

  if (filesToUpload.length === 0) {
    console.log('没有找到匹配的音乐文件')
    return
  }

  console.log(`\n  music.js 中有 ${expectedFiles.size} 首歌`)
  console.log(`  本地找到 ${filesToUpload.length} 个匹配文件，开始上传...\n`)

  let success = 0
  let failed = 0

  for (let i = 0; i < filesToUpload.length; i++) {
    const filename = filesToUpload[i]
    const filePath = join(MUSIC_DIR, filename)

    try {
      await uploadFile(filePath, filename)
      console.log(`  [${i + 1}/${filesToUpload.length}] ✓ ${basename(filename)}`)
      success++
    } catch (err) {
      console.log(`  [${i + 1}/${filesToUpload.length}] ✗ ${basename(filename)}: ${err.message}`)
      failed++
    }
  }

  const missing = [...expectedFiles].filter(f => !allFiles.includes(f))
  if (missing.length > 0) {
    console.log(`\n  本地缺少 ${missing.length} 个文件:`)
    missing.forEach(f => console.log(`    - ${f}`))
  }

  console.log(`\n  上传完成: 成功 ${success}, 失败 ${failed}`)
  if (failed === 0 && missing.length === 0) {
    console.log(`  下一步: 绑定域名 + 改代码 + 部署`)
  }
}

main().catch(err => {
  console.error('错误:', err.message)
  process.exit(1)
})
