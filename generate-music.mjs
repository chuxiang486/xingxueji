import fs from 'fs'

const QINIU_BASE = '/music'

// 读取文件列表
const lines = fs.readFileSync('D:/QoderTest/xingxueji/qiniu-files.txt', 'utf-8')
  .split('\n')
  .filter(line => line.trim() && !line.startsWith('Key\t'))

const songs = []
let id = 1

for (const line of lines) {
  const filename = line.split('\t')[0]
  
  // 跳过非音频文件
  if (!filename.match(/\.(mp3|ogg|wav|flac|m4a)$/i)) continue
  
  // 解析文件名：歌手 - 歌名 [后缀].扩展名
  const match = filename.match(/^(.+?)\s*-\s*(.+?)(?:\s*\[.*?\])?\.\w+$/)
  if (!match) continue
  
  const artist = match[1].trim()
  let title = match[2].trim()
  
  // 去掉括号里的中文翻译（保留日文/英文原名）
  title = title.replace(/\s*\([^)]*[\u4e00-\u9fa5][^)]*\)/g, '').trim()
  // 如果标题为空（全是中文翻译），用原标题
  if (!title) title = match[2].trim()
  
  // URL encode 文件名
  const encodedFilename = encodeURIComponent(filename)
  
  songs.push({
    id: id++,
    title,
    artist,
    category: '全部',
    url: `${QINIU_BASE}/${encodedFilename}`
  })
}

// 生成 music.js
const output = `export const musicCategories = ['全部', '治愈/温柔', '燃/力量', '抒情/伤感', '轻快/日常']

export const songs = ${JSON.stringify(songs, null, 2)}
`

fs.writeFileSync('D:/QoderTest/xingxueji/src/data/music.js', output, 'utf-8')
console.log(`Generated ${songs.length} songs`)
