import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, renameSync, copyFileSync } from 'fs'
import { join, basename, extname } from 'path'

// ============ 配置区 ============
const IMAGES_JS_PATH = './src/data/images.js'
const PUBLIC_IMAGES_DIR = './public/images'
const NEW_IMAGES_DIR = './new-images'  // 把新图片放这里
// ================================

function guessCategory(filename) {
  const name = filename.toLowerCase()
  if (/方舟|arknights|明日|arknights/.test(name)) return '游戏'
  if (/原神|genshin|genshin impact/.test(name)) return '游戏'
  if (/碧蓝|azur|bluearchive|蔚蓝/.test(name)) return '游戏'
  if (/动漫|anime|番剧|番/.test(name)) return '动漫'
  if (/进击|巨人|attack|titan/.test(name)) return '动漫'
  if (/鬼灭|demon slayer/.test(name)) return '动漫'
  if (/咒术|jujutsu/.test(name)) return '动漫'
  return '其他'
}

function guessTitle(filename) {
  const name = filename.replace(extname(filename), '')
  // 如果文件名包含中文，直接用
  if (/[\u4e00-\u9fa5]/.test(name)) {
    // 提取中文部分
    const match = name.match(/[\u4e00-\u9fa5]+/)
    if (match) return match[0]
  }
  // 否则用文件名（去掉常见后缀）
  return name.replace(/[-_]\d+$/, '').replace(/[-_]/g, ' ')
}

function parseImageInfo(filename) {
  const name = filename.replace(extname(filename), '')
  // 格式：分类-标题 或 标题
  const match = name.match(/^(\w+)[-–—](.+)$/)
  if (match) {
    return {
      category: match[1],
      title: match[2].trim()
    }
  }
  return {
    category: guessCategory(filename),
    title: guessTitle(filename)
  }
}

async function main() {
  // 检查目录
  try {
    statSync(NEW_IMAGES_DIR)
  } catch {
    console.log(`\n  使用方法：`)
    console.log(`  1. 把新图片放到 ${NEW_IMAGES_DIR}/ 目录`)
    console.log(`  2. 文件名格式：分类-标题.webp（如：游戏-明日方舟.webp）`)
    console.log(`     或直接用描述性名称（如：arknights-01.webp）`)
    console.log(`  3. 运行：node add-images.mjs\n`)
    return
  }

  const files = readdirSync(NEW_IMAGES_DIR).filter(f => {
    const ext = extname(f).toLowerCase()
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)
  })

  if (files.length === 0) {
    console.log(`${NEW_IMAGES_DIR}/ 目录没有图片文件`)
    return
  }

  // 读取现有图片数据
  const imagesContent = readFileSync(IMAGES_JS_PATH, 'utf-8')
  const idMatch = [...imagesContent.matchAll(/id:\s*(\d+)/g)]
  const maxId = idMatch.length ? Math.max(...idMatch.map(m => parseInt(m[1]))) : 0

  console.log(`\n  找到 ${files.length} 张新图片，开始处理...\n`)

  const newEntries = []
  for (const file of files) {
    const srcPath = join(NEW_IMAGES_DIR, file)
    const ext = extname(file).toLowerCase()
    
    // 统一用 webp 或保持原格式
    const targetName = file
    const { category, title } = parseImageInfo(file)

    // 复制到 public/images/
    const targetPath = join(PUBLIC_IMAGES_DIR, targetName)
    try {
      copyFileSync(srcPath, targetPath)
      console.log(`  ✓ 复制 ${file} → public/images/`)
    } catch (err) {
      console.log(`  ✗ ${file}: 复制失败 - ${err.message}`)
      continue
    }

    newEntries.push({
      id: maxId + newEntries.length + 1,
      src: `./images/${targetName}`,
      category,
      title
    })
  }

  if (newEntries.length === 0) {
    console.log('\n  没有成功处理的图片')
    return
  }

  // 更新 images.js
  const newImagesCode = newEntries.map(img => 
    `  {\n    id: ${img.id},\n    src: '${img.src}',\n    category: '${img.category}',\n    title: '${img.title}',\n  }`
  ).join(',\n')

  const updatedContent = imagesContent.replace(
    /\n\]/,
    ',\n' + newImagesCode + '\n]'
  )
  writeFileSync(IMAGES_JS_PATH, updatedContent)

  // 移动已处理文件
  const doneDir = join(NEW_IMAGES_DIR, 'done')
  try { statSync(doneDir) } catch { mkdirSync(doneDir) }
  for (const file of files) {
    const src = join(NEW_IMAGES_DIR, file)
    try {
      renameSync(src, join(doneDir, file))
    } catch {}
  }

  console.log(`\n  ✅ 成功添加 ${newEntries.length} 张图片`)
  console.log(`  📝 已更新 ${IMAGES_JS_PATH}`)
  console.log(`  📦 已处理文件移到 ${doneDir}/`)
  console.log(`\n  下一步：`)
  console.log(`    git add .`)
  console.log(`    git commit -m "添加 ${newEntries.length} 张图片"`)
  console.log(`    git push`)
  console.log(`\n  分类如有需要请手动调整 images.js 中的 category 字段\n`)
}

main().catch(err => {
  console.error('错误:', err.message)
  process.exit(1)
})
