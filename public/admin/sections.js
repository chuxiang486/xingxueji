export const sections = {
  songs: { label: '音乐', fields: { title: '歌名', artist: '歌手', category: '分类', url: '音频地址' } },
  gallery: { label: '图库', fields: { title: '图片标题', src: '原图地址', category: '分类', work: '作品', character: '角色' } },
  wallpapers: { label: '壁纸', fields: { title: '壁纸名称', src: '原图地址', category: '分类', resolution: '分辨率' } },
  anime: { label: '追番', fields: { title: '番剧名称', status: '观看状态', rating: '评分（1–10）', note: '短评' } },
  games: { label: '游戏', fields: { title: '游戏名称', platform: '游戏平台', hours: '游玩时长', note: '备注' } },
}
export const galleryCategories = ['游戏','动漫','其他']
export const watchStatuses = ['在看','已看完','想看']
