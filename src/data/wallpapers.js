import { imageVariants } from './imageVariants'

// Original PNGs are local so downloads work without cross-origin restrictions.
export const wallpapers = [
  { id: 'starlit-traveler', title: '星河旅人', category: '星空' },
  { id: 'moonlit-tide', title: '月潮', category: '海洋' },
  { id: 'mountain-observatory', title: '山巅观星台', category: '星空' },
].map(item => {
  const filename = `${item.id}.png`
  const variants = imageVariants.wallpapers[filename]
  return {
    ...item,
    ...variants,
    src: `./wallpapers/${filename}`,
    resolution: `${variants.width} × ${variants.height}`,
  }
})
