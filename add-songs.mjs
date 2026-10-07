import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, renameSync } from 'fs'
import { join, basename, extname } from 'path'
import { createHmac } from 'crypto'

// ============ 配置区 ============
const QINIU_ACCESS_KEY = '9qgLzhmQMu77v85Qa5ZPczPSi4bXgOsNhqg4n86E'
const QINIU_SECRET_KEY = 'DTRMrnWf2VjaScSutVV2qGWXVCvmeZvkzdDmIa2U'
const QINIU_BUCKET = 'xingxueji-music'
const QINIU_DOMAIN = 'http://music.026924.xyz'
const MUSIC_JS_PATH = './src/data/music.js'
const NEW_SONGS_DIR = './new-songs'  // 把新 MP3 放这里
// ================================

function base64url(str) {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function getUploadToken(bucket, accessKey, secretKey) {
  const putPolicy = JSON.stringify({ scope: bucket })
  const encoded = base64url(putPolicy)
  const sign = createHmac('sha1', secretKey).update(encoded).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${accessKey}:${sign}:${encoded}`
}

async function uploadToQiniu(filePath, token) {
  const filename = basename(filePath)
  const fileData = readFileSync(filePath)

  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2)
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: audio/mpeg\r\n\r\n`),
    fileData,
    Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${token}\r\n--${boundary}--\r\n`)
  ])

  const res = await fetch('http://up-as0.qiniup.com', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`上传失败: ${res.status} ${text}`)
  }

  return res.json()
}

function guessCategory(filename) {
  const name = filename.toLowerCase()
  if (/燃|power|fight|battle|epic|rock|metal/.test(name)) return '燃/力量'
  if (/治愈|gentle|soft|calm|peace|lullaby/.test(name)) return '治愈/温柔'
  if (/轻快|happy|cute|daily|pop|dance/.test(name)) return '轻快/日常'
  return '抒情/伤感'  // 默认
}

function parseSongInfo(filename) {
  const name = filename.replace(extname(filename), '')
  const match = name.match(/^(.+?)\s*[-–—]\s*(.+)$/)
  if (match) {
    return { title: match[2].trim(), artist: match[1].trim() }
  }
  return { title: name, artist: '未知' }
}

async function main() {
  // 检查目录
  try {
    statSync(NEW_SONGS_DIR)
  } catch {
    console.log(`\n  使用方法：`)
    console.log(`  1. 把新 MP3 文件放到 ${NEW_SONGS_DIR}/ 目录`)
    console.log(`  2. 文件名格式：歌手 - 歌名.mp3（如：周杰伦 - 晴天.mp3）`)
    console.log(`  3. 填写本脚本顶部的七牛 AccessKey 和 SecretKey`)
    console.log(`  4. 运行：node add-songs.mjs\n`)
    return
  }

  const files = readdirSync(NEW_SONGS_DIR).filter(f => f.endsWith('.mp3'))
  if (files.length === 0) {
    console.log(`${NEW_SONGS_DIR}/ 目录没有 MP3 文件`)
    return
  }

  // 读取现有音乐数据
  const musicContent = readFileSync(MUSIC_JS_PATH, 'utf-8')
  const songsMatch = musicContent.match(/export const songs = \[([\s\S]*?)\n\]/)
  if (!songsMatch) throw new Error('无法解析 music.js')

  const existingSongs = []
  const idMatch = [...musicContent.matchAll(/"id":\s*(\d+)/g)]
  const maxId = idMatch.length ? Math.max(...idMatch.map(m => parseInt(m[1]))) : 0

  // 获取上传凭证
  const token = getUploadToken(QINIU_BUCKET, QINIU_ACCESS_KEY, QINIU_SECRET_KEY)
  console.log(`\n  找到 ${files.length} 首新歌，开始上传...\n`)

  const newEntries = []
  for (const file of files) {
    const filePath = join(NEW_SONGS_DIR, file)
    const { title, artist } = parseSongInfo(file)
    const category = guessCategory(file)

    try {
      const result = await uploadToQiniu(filePath, token)
      console.log(`  ✓ ${file} → ${result.key || file}`)

      const urlEncoded = encodeURIComponent(file)
      newEntries.push({
        id: maxId + newEntries.length + 1,
        title,
        artist,
        category,
        url: `/music/${urlEncoded}`
      })
    } catch (err) {
      console.log(`   ${file}: ${err.message}`)
    }
  }

  if (newEntries.length === 0) {
    console.log('\n  没有成功上传的歌曲')
    return
  }

  // 更新 music.js
  const newSongsCode = newEntries.map(s =>
    `  {\n    "id": ${s.id},\n    "title": "${s.title}",\n    "artist": "${s.artist}",\n    "category": "${s.category}",\n    "url": "${s.url}"\n  }`
  ).join(',\n')

  const updatedContent = musicContent.replace(
    /\n\]/,
    ',\n' + newSongsCode + '\n]'
  )
  writeFileSync(MUSIC_JS_PATH, updatedContent)

  // 移动已上传文件
  const doneDir = join(NEW_SONGS_DIR, 'done')
  try { statSync(doneDir) } catch { mkdirSync(doneDir) }
  for (const file of files) {
    const src = join(NEW_SONGS_DIR, file)
    try {
      renameSync(src, join(doneDir, file))
    } catch {}
  }

  console.log(`\n  ✅ 成功添加 ${newEntries.length} 首歌`)
  console.log(`  📝 已更新 ${MUSIC_JS_PATH}`)
  console.log(`  📦 已上传文件移到 ${doneDir}/`)
  console.log(`\n  下一步：git add && git commit && git push`)
  console.log(`  分类如有需要请手动调整 music.js 中的 category 字段\n`)
}

main().catch(err => {
  console.error('错误:', err.message)
  process.exit(1)
})
