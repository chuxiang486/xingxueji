import fs from 'fs'

// 分离歌名映射和歌手映射，避免模糊匹配冲突
// 治愈/温柔: soft, calming, healing
// 燃/力量: energetic, battle, rock, epic, electronic
// 抒情/伤感: emotional, sad, ballads, tear-jerkers
// 轻快/日常: upbeat, cheerful, casual, fun

const songMap = {
  // === 燃/力量 ===
  'Legends Never Die': '燃/力量',
  'We Don\'t Run From Anyone': '燃/力量',
  'History': '燃/力量',
  'Sogno di Volare': '燃/力量',
  'Survive': '燃/力量',
  'Shattered Recon': '燃/力量',
  'Vengeance': '燃/力量',
  'Valley Of The End': '燃/力量',
  'And Now We Run!': '燃/力量',
  'Backstab': '燃/力量',
  'Full Force Forward': '燃/力量',
  'Mayhem Dressed in a Suit': '燃/力量',
  'Tick Tock': '燃/力量',
  'Art of Blade': '燃/力量',
  'Back to the Scoreboard': '燃/力量',
  '我 即 天 龙': '燃/力量',
  'RISE': '燃/力量',
  'Sky City': '燃/力量',
  'Another World': '燃/力量',
  'TowerFierce': '燃/力量',
  'MSR - CONFRONT': '燃/力量',
  'MSR - LITHOS': '燃/力量',
  'MSR - Requiem': '燃/力量',
  'MSR&Jason Walsh - Boiling Blood': '燃/力量',
  'MSR&DJ OKAWARI - Speed of Light': '燃/力量',
  'MSR&Obadiah Brown-Beach - 独行长路': '燃/力量',
  'MSR&Obadiah Brown-Beach - 故乡的风': '治愈/温柔',
  'MSR&Steven Grove - Zone 10⁻⁸': '燃/力量',
  'MSR&Steven Grove - Curtain Call': '燃/力量',
  'MSR&Uyanga Bold - Lullabye': '治愈/温柔',
  'MSR&田井中彩智 - 秋绪': '抒情/伤感',
  'MSR - Stay Gold': '治愈/温柔',
  'MSR&BaoUner - 示岁': '燃/力量',
  '最终之战': '燃/力量',
  '潮汐之剑': '燃/力量',
  'ACHE in PULSE': '燃/力量',
  '灼け落ちない翼': '燃/力量',
  '-フレイム・オブ・レッド-': '燃/力量',
  'THERE IS A REASON': '燃/力量',
  '蛮鳞行动': '燃/力量',
  'Gimme×Gimme': '燃/力量',
  '千本桜': '燃/力量',
  '罰ゲーム': '燃/力量',
  '威风堂堂': '燃/力量',
  'ナーヴ・インパルス': '燃/力量',
  'fesedm': '燃/力量',
  '这样很好': '抒情/伤感',
  'Suck My Blood': '抒情/伤感',
  'i crash, u crash': '抒情/伤感',
  '404 not found': '燃/力量',
  'No title': '燃/力量',
  'medemede': '轻快/日常',
  '煩悩遊戯': '燃/力量',
  '阿吽のビーツ': '燃/力量',
  '帝国少女': '燃/力量',
  'Main Title': '燃/力量',
  'Ready': '燃/力量',
  'ツギハギスタッカート': '轻快/日常',
  'カノン': '治愈/温柔',
  '「铅封行动」主界面': '燃/力量',
  '【明日方舟音乐向】火山旅梦活动主题曲-白天': '轻快/日常',
  '愚人号': '抒情/伤感',
  '这样很好': '抒情/伤感',
  '陈奕迅 英雄联盟 双城之战': '抒情/伤感',

  // === 抒情/伤感 ===
  'Lemon': '抒情/伤感',
  'Letter song': '抒情/伤感',
  'letter song': '抒情/伤感',
  'なんでもないや': '抒情/伤感',
  '人間だった': '抒情/伤感',
  '天ノ弱': '抒情/伤感',
  '小夜子': '抒情/伤感',
  '心拍数♯0822': '抒情/伤感',
  'アスノヨゾラ哨戒班': '抒情/伤感',
  '打上花火': '抒情/伤感',
  'Departures': '抒情/伤感',
  'エウテルペ': '抒情/伤感',
  '幽霊東京': '抒情/伤感',
  'Living in the Shadows': '抒情/伤感',
  '美しきもの': '抒情/伤感',
  'フリージア': '抒情/伤感',
  '透明声彩': '抒情/伤感',
  '夢でまたあえたらなあ': '抒情/伤感',
  '庭園にて。': '抒情/伤感',
  '深海少女': '抒情/伤感',
  'たばこ': '抒情/伤感',
  'だから僕は音楽を辞めた': '抒情/伤感',
  '言って。': '抒情/伤感',
  'ヒッチコック': '抒情/伤感',
  '五月は花緑青の窓辺から': '抒情/伤感',
  'パレード': '抒情/伤感',
  'カイコ': '抒情/伤感',
  '初恋': '抒情/伤感',
  '月がきれい': '抒情/伤感',
  '生きていたんだよな': '抒情/伤感',
  '心做し': '抒情/伤感',
  'だんご大家族': '抒情/伤感',
  'さようなら、花泥棒さん': '抒情/伤感',
  'オオカミと少女': '抒情/伤感',
  '彼女は旅に出る': '抒情/伤感',
  '言葉のいらない約束': '抒情/伤感',
  '愛してる': '抒情/伤感',
  'いかないで': '抒情/伤感',
  'アイロニ': '抒情/伤感',
  'ハロハワユ': '抒情/伤感',
  '春に落ちて': '抒情/伤感',
  '曖昧劣情Lover': '抒情/伤感',
  '繰り返し一粒': '抒情/伤感',
  'ばかみたい': '抒情/伤感',
  'ウィアートル': '抒情/伤感',
  '風の夢': '抒情/伤感',
  '止まない雨に花束を': '抒情/伤感',
  '雪恋少女': '抒情/伤感',
  '永夜のパレード': '抒情/伤感',
  'パスポート': '抒情/伤感',
  '水星': '抒情/伤感',
  '祭果ての花': '抒情/伤感',
  '君の夢は私の夢': '抒情/伤感',
  'なきむし': '抒情/伤感',
  'ねぇ、話をしよう': '抒情/伤感',
  'なまえのないうた': '抒情/伤感',
  '明日方舟 踏寻往昔之风': '抒情/伤感',
  '遗尘漫步': '抒情/伤感',
  '【浊心·斯卡蒂】印象曲': '抒情/伤感',
  '竈門炭治郎のうた': '抒情/伤感',
  'こんな世界、知りたくなかった。': '抒情/伤感',
  '前前前世': '抒情/伤感',
  '嘘つきは恋のはじまり': '抒情/伤感',
  '胧月': '抒情/伤感',
  '花火': '抒情/伤感',
  'ひとり旅': '抒情/伤感',
  '不可思議のカルテ': '抒情/伤感',
  '夢のはなし': '抒情/伤感',
  'secret base': '抒情/伤感',
  'あなたを想いたい': '抒情/伤感',
  'カワキヲアメク': '抒情/伤感',
  '歌に形はないけれど': '抒情/伤感',
  'そして花になる': '抒情/伤感',
  '忘れてしまえ': '抒情/伤感',
  '内臓ありますか': '抒情/伤感',
  '好きなので。': '抒情/伤感',
  '月灯り': '抒情/伤感',
  'さくら': '抒情/伤感',
  'Daisy Blue': '抒情/伤感',
  'glow': '抒情/伤感',
  'メリーメリー': '抒情/伤感',
  '勾指起誓日文版': '抒情/伤感',
  'again': '抒情/伤感',
  'You & I': '抒情/伤感',
  'Promise': '抒情/伤感',
  'Stay Alive': '抒情/伤感',
  'Rumor': '抒情/伤感',
  'COLORS': '抒情/伤感',
  'BesTie': '抒情/伤感',
  'Alice': '抒情/伤感',
  'decide': '抒情/伤感',
  'レディーレ': '抒情/伤感',
  'もっふもふ DE よいのじゃよ': '治愈/温柔',
  'あったかいんだからぁ': '治愈/温柔',
  'For フルーツバスケット': '治愈/温柔',
  'Just a friend': '治愈/温柔',
  'Call': '轻快/日常',

  // === 治愈/温柔 ===
  'ガランド': '治愈/温柔',
  '枕元にゴースト': '治愈/温柔',
  'ごはんを食べよう': '治愈/温柔',
  'future base': '治愈/温柔',
  'ひまわりの約束': '治愈/温柔',
  'ふたりごと': '治愈/温柔',
  '夏恋慕': '治愈/温柔',
  '〇＋●': '治愈/温柔',
  '椿姫': '治愈/温柔',
  'Lil\' Goldfish': '治愈/温柔',
  '会いたい': '治愈/温柔',
  '花降らし': '治愈/温柔',
  'この歌に誓おう': '治愈/温柔',
  'インタビュア': '治愈/温柔',
  'ぱられループ': '治愈/温柔',
  'スパークル': '治愈/温柔',
  '銀河鉄道のペンギン': '治愈/温柔',
  'インドア系ならトラックメイカー': '治愈/温柔',
  '白猫海賊船': '治愈/温柔',
  'ミラクルシュガーランド': '治愈/温柔',
  'Akubi': '治愈/温柔',
  'summertime': '治愈/温柔',
  'terrible life': '治愈/温柔',
  'アイシテ': '治愈/温柔',
  'ろりこんでよかった': '治愈/温柔',
  'またあした': '治愈/温柔',
  'また あした': '治愈/温柔',
  '雪の精霊たち': '治愈/温柔',
  '清凉夏夜': '治愈/温柔',
  'ok绷': '治愈/温柔',
  'Mind Brand': '治愈/温柔',
  'Slow Down': '治愈/温柔',
  'YELLOW': '治愈/温柔',
  '交界线': '治愈/温柔',
  '绊': '治愈/温柔',
  'Picon': '治愈/温柔',
  'Day by day': '治愈/温柔',
  'もう一度': '治愈/温柔',
  '優しい詩。': '治愈/温柔',
  'ふわふわ♪': '治愈/温柔',
  'lionheart': '治愈/温柔',
  '約束': '治愈/温柔',
  '勾指起誓': '治愈/温柔',
  'Yes,': '治愈/温柔',
  'しあわせ色': '治愈/温柔',
  'Loop Slider Cider': '治愈/温柔',
  'More One Night': '治愈/温柔',
  'クリスタライズ': '治愈/温柔',
  'Best FriendS': '治愈/温柔',
  '可愛くなりたい': '治愈/温柔',
  '星屑ビーナス': '治愈/温柔',
  '061【泰拉瑞亚】Untitled World': '治愈/温柔',
  'Night Wander': '治愈/温柔',
  'Kokodayo Chord': '治愈/温柔',
  'Speed of Light': '治愈/温柔',
  '我的世界已坠入爱河': '治愈/温柔',
  '幻灯片': '治愈/温柔',
  '春、恋、花以外の': '治愈/温柔',

  // === 轻快/日常 ===
  'DISCO NIGHT': '轻快/日常',
  '永久の宴': '轻快/日常',
  'HANNARI': '轻快/日常',
  'カトラリー': '轻快/日常',
  '暧昧さ回避': '轻快/日常',
  'Dance Monkey': '轻快/日常',
  'ハレハレヤ': '轻快/日常',
  '两面包夹芝士': '轻快/日常',
  '曖昧トリップ': '轻快/日常',
  'Boom Clap': '轻快/日常',
  'レントリリー': '轻快/日常',
  '朗朗晴天': '轻快/日常',
  'sweets parade': '轻快/日常',
  'もうそう♥えくすぷれす': '轻快/日常',
  '恋愛サーキュレーション': '轻快/日常',
  'Ready Steady': '轻快/日常',
  '夢色パレード': '轻快/日常',
}

const artistMap = {
  // 燃/力量
  'Epic Score': '燃/力量',
  'Simon Viklund': '燃/力量',
  'The Glitch Mob': '燃/力量',
  'Xeuphoria': '燃/力量',
  'Inon Zur': '燃/力量',
  'Izzo Kenpachi': '燃/力量',
  'Stlizia12': '燃/力量',
  'QUIX': '燃/力量',
  'MYTH & ROID': '燃/力量',
  'Christopher Tin': '燃/力量',
  '八王子P': '燃/力量',
  '铃木木乃美': '燃/力量',
  '英雄联盟': '燃/力量',
  'SNKS': '燃/力量',
  'Cash Cash': '燃/力量',
  '多田葵': '燃/力量',
  '南杉': '燃/力量',
  '堀江由衣': '燃/力量',
  '钛合金鼻梁骨': '燃/力量',

  // 抒情/伤感
  'ヨルシカ': '抒情/伤感',
  '鹿乃': '抒情/伤感',
  '美波': '抒情/伤感',
  'Uru': '抒情/伤感',
  '花たん': '抒情/伤感',
  '花譜': '抒情/伤感',
  'コレサワ': '抒情/伤感',
  '茅野愛衣': '抒情/伤感',
  '沢井美空': '抒情/伤感',
  '泠鸢yousa': '抒情/伤感',
  '流星P': '抒情/伤感',
  '清浦夏实': '抒情/伤感',
  '瀬名航': '抒情/伤感',
  '山冈晃': '抒情/伤感',
  '弥散_Msa': '抒情/伤感',
  '双笙': '抒情/伤感',
  '小缘': '抒情/伤感',
  '中恵光城': '抒情/伤感',
  '椎名豪': '抒情/伤感',
  '高铃': '抒情/伤感',
  '高桥李依': '抒情/伤感',
  '篠螺悠那': '抒情/伤感',
  'ヲタみん': '抒情/伤感',
  '柚子茶': '抒情/伤感',
  'milet': '抒情/伤感',
  'Matthew Perryman Jones': '抒情/伤感',
  'Sound Horizon': '抒情/伤感',
  'RADWIMPS': '抒情/伤感',
  'Reol': '燃/力量',
  'REOL': '燃/力量',

  // 治愈/温柔
  'Kobasolo': '治愈/温柔',
  'Kous': '治愈/温柔',
  'Maggie_麦吉': '治愈/温柔',
  'Goose house': '治愈/温柔',
  'KOKIA': '治愈/温柔',
  'RSP': '治愈/温柔',
  'cinnamons': '治愈/温柔',
  'beignet': '治愈/温柔',
  'jamie n ginger ale': '治愈/温柔',
  'H△G': '治愈/温柔',
  'Yunomi': '治愈/温柔',
  'Aiobahn': '治愈/温柔',
  'Nao\'ymt': '治愈/温柔',
  'Naomile': '治愈/温柔',
  'Pazi': '治愈/温柔',
  'RAM WIRE': '治愈/温柔',
  'acane_madder': '治愈/温柔',
  'yukina': '治愈/温柔',
  'ちぃむdmp☆': '治愈/温柔',
  'なゆごろう': '治愈/温柔',
  'みぃしゃ': '治愈/温柔',
  'ゆきまめ': '治愈/温柔',
  'マグロ鱼酱': '治愈/温柔',
  '东京塔子': '治愈/温柔',
  '东山奈央': '治愈/温柔',
  '冈崎律子': '治愈/温柔',
  '十九遥': '治愈/温柔',
  '夢乃ゆき': '治愈/温柔',
  '安野希世乃': '治愈/温柔',
  '小仓唯': '治愈/温柔',
  '小野道ono': '治愈/温柔',
  '恰空PurrLude': '治愈/温柔',
  '悠木碧': '治愈/温柔',
  '拿弓子的波塞东': '治愈/温柔',
  '水濑祈': '治愈/温柔',
  '瀬戸麻沙美': '治愈/温柔',
  '箱眠': '治愈/温柔',
  '米泽圆': '治愈/温柔',
  '脸红的思春期': '治愈/温柔',
  '茶太': '治愈/温柔',
  '茶玖': '治愈/温柔',
  '鎖那': '治愈/温柔',
  '锦零': '治愈/温柔',
  '雨宮天': '治愈/温柔',
  '雪落caramel': '治愈/温柔',
  '风雅荷': '治愈/温柔',
  '渊渊的奇妙冒险': '治愈/温柔',
  '九五CHN': '治愈/温柔',
  '二宮愛': '治愈/温柔',
  'Nightcore.Shiro': '治愈/温柔',
  'Emancipator': '治愈/温柔',
  'rionos': '治愈/温柔',
  'YuNi': '治愈/温柔',
  'rhythmic': '治愈/温柔',
  'MorzhiShan': '治愈/温柔',
  '提糯Tino': '抒情/伤感',

  // 轻快/日常
  'Tones and I': '轻快/日常',
  '花澤香菜': '轻快/日常',
  'hanser': '轻快/日常',
  '封茗囧菌': '轻快/日常',
  '小猪P': '轻快/日常',
  '洛天依': '轻快/日常',
  '桃箱': '轻快/日常',
  '和气杏未': '轻快/日常',
  'ナナヲアカリ': '轻快/日常',
  '初音未来': '轻快/日常',
  '熊子': '轻快/日常',
  '猫瑾': '轻快/日常',
  '苍子': '轻快/日常',
  '黑田崇矢': '轻快/日常',
  'のぶなが': '轻快/日常',
  'Sawako碎花': '轻快/日常',
  'Semi': '轻快/日常',
  'Kizuna AI': '轻快/日常',
  'toa': '轻快/日常',
  'くろくも': '轻快/日常',
  'ケーキ姫': '轻快/日常',
  'ラブリーサマーちゃん': '轻快/日常',

  // 特殊格式歌曲 → 秋绘系列
  '秋绘': '抒情/伤感',
}

// Read current music.js
const musicContent = fs.readFileSync('D:/QoderTest/xingxueji/src/data/music.js', 'utf-8')
const songsMatch = musicContent.match(/export const songs = (\[[\s\S]*?\])\n/)
if (!songsMatch) {
  console.error('Could not parse songs array')
  process.exit(1)
}
const songs = JSON.parse(songsMatch[1])

// Reset all to 全部
for (const s of songs) s.category = '全部'

let categorized = 0
let uncategorized = 0
const uncatList = []

for (const song of songs) {
  let assigned = false

  // 1. Try song title match - sort by key length descending so longer keys match first
  const sortedSongKeys = Object.entries(songMap).sort((a, b) => b[0].length - a[0].length)
  for (const [key, cat] of sortedSongKeys) {
    const isShort = key.length < 6
    let matches = false
    if (song.title === key) {
      matches = true
    } else if (song.title.startsWith(key)) {
      // At start: require non-letter after key (space, punctuation, CJK, etc.)
      const nextChar = song.title.charAt(key.length)
      matches = !nextChar || /[^a-zA-Z0-9]/.test(nextChar)
    } else if (!isShort && song.title.includes(key)) {
      matches = true
    }
    if (matches) {
      song.category = cat
      assigned = true
      break
    }
  }

  // 2. Try artist match (artist contains key)
  if (!assigned) {
    const artistBase = song.artist.split('(')[0].trim()
    for (const [key, cat] of Object.entries(artistMap)) {
      if (artistBase === key || artistBase.includes(key) || key.includes(artistBase)) {
        song.category = cat
        assigned = true
        break
      }
    }
  }

  if (assigned) {
    categorized++
  } else {
    uncategorized++
    uncatList.push(`${song.id}: ${song.title} - ${song.artist}`)
  }
}

console.log(`Categorized: ${categorized}, Uncategorized: ${uncategorized}`)
if (uncatList.length > 0) {
  console.log('\nUncategorized songs:')
  uncatList.forEach(s => console.log('  ' + s))
}

// Write back
const output = `export const musicCategories = ['全部', '治愈/温柔', '燃/力量', '抒情/伤感', '轻快/日常']

export const songs = ${JSON.stringify(songs, null, 2)}
`

fs.writeFileSync('D:/QoderTest/xingxueji/src/data/music.js', output, 'utf-8')
console.log('\nUpdated music.js with categories')

// Show distribution
const dist = {}
for (const s of songs) {
  dist[s.category] = (dist[s.category] || 0) + 1
}
console.log('\nDistribution:')
for (const [cat, count] of Object.entries(dist).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${count}`)
}
