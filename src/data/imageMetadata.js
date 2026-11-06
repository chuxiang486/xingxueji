// 标题为本站展示用描述，并非画师原作标题。
// referenceUrl 只用于核对角色/作品，不代表这张图片的原始发布地址。
const arknights = (title, character, referenceUrl, extra = {}) => ({
  title, character, work: '明日方舟', category: '游戏', referenceUrl,
  identification: 'visual-comparison', ...extra,
})
const anime = (title, character, work, referenceUrl) => ({
  title, character, work, category: '动漫', referenceUrl,
  identification: 'visual-comparison',
})
const amiya = 'https://arknights.wiki.gg/wiki/Amiya/File'
const angelina = 'https://arknights.fandom.com/wiki/Angelina'
const rem = 'https://re-zero-anime.jp/tv/character/'

export const imageMetadata = {
  1: arknights('企鹅物流 · 雨中街景', '德克萨斯、拉普兰德、能天使', 'https://www.arknights.global/'),
  2: arknights('明日方舟 · 海岸群像', '', 'https://www.arknights.global/'),
  3: arknights('明日方舟 · 灯火迎春', '', 'https://www.arknights.global/'),
  4: anime('蕾姆 · 白鸽', '蕾姆', 'Re:从零开始的异世界生活', rem),
  5: arknights('阿米娅 · 雨中回望', '阿米娅', amiya),
  7: anime('小鸟游六花 · 指尖取景', '小鸟游六花', '中二病也要谈恋爱！', 'https://www.anime-chu-2.com/tv2nd/character/rikka/'),
  8: anime('友利奈绪 · 樱花街景', '友利奈绪', 'Charlotte', 'https://charlotte-anime.jp/character/'),
  10: anime('艾拉 · 花间微笑', '艾拉', '可塑性记忆', 'https://www.plastic-memories.jp/sp/character/02.html'),
  11: anime('蕾姆 · 微笑', '蕾姆', 'Re:从零开始的异世界生活', rem),
  12: anime('火影忍者 · 螺旋丸群像', '漩涡鸣人等', '火影忍者', 'https://zh.wikipedia.org/wiki/漩渦鳴人'),
  13: arknights('安洁莉娜 · 春日肖像', '安洁莉娜', angelina),
  14: anime('我妻善逸 · 雷光', '我妻善逸', '鬼灭之刃', 'https://kimetsu.com/anime/risshihen/character/?chara=zennitsu'),
  16: arknights('蕾缪安 · 教堂光影', '蕾缪安', 'https://arknights.wiki.gg/wiki/Lemuen'),
  19: arknights('阿米娅 · 柠檬树下', '阿米娅', amiya),
  21: arknights('凯尔希 · Esperanta', '凯尔希', 'https://arknights.wiki.gg/wiki/Kal%27tsit_Esperanta'),
  22: arknights('阿米娅 · 野趣拾光', '阿米娅', 'https://laplace.live/collections/108086?locale=zh-TW', { visibleCredit: 'HYPERGRYPH', creditBasis: 'image-text' }),
  23: arknights('阿米娅 · 画框中的午后', '阿米娅', amiya, { visibleCredit: '@Reed', creditBasis: 'image-signature' }),
  24: arknights('阿米娅 · 星夜琴声', '阿米娅', amiya),
  25: arknights('维什戴尔 · 赤色锋芒', '维什戴尔', 'https://arknights.wiki.gg/wiki/Wi%C5%A1%27adel'),
  26: arknights('维什戴尔 · 烈焰', '维什戴尔', 'https://arknights.wiki.gg/wiki/Wi%C5%A1%27adel'),
  27: arknights('安洁莉娜 · 银杏秋色', '安洁莉娜', angelina),
  28: anime('亚丝娜 · 海边邀约', '亚丝娜', '刀剑神域', 'https://www.swordart-online.net/sp/phantom/character/chara03.html'),
  29: { title: '纳西妲 · 花叶之座', character: '纳西妲', work: '原神', category: '游戏', referenceUrl: 'https://genshin.hoyoverse.com/zh-tw/character/sumeru?char=0', identification: 'visual-comparison' },
  30: arknights('阿米娅 · 云间花语', '阿米娅', amiya, { visibleCredit: '森空岛 @猫柱儿', creditBasis: 'image-watermark' }),
  31: arknights('水月 · 霓虹游戏', '水月', 'https://www.namie.art/about', { visibleCredit: '森空岛 @Namie', creditBasis: 'image-watermark' }),
}
