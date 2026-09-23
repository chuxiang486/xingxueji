import { useState } from 'react'
import { images, imageCategories } from '../data/images'
import './Gallery.css'

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [lightboxSrc, setLightboxSrc] = useState(null)

  const filtered = activeCategory === '全部'
    ? images
    : images.filter(img => img.category === activeCategory)

  return (
    <section className="gallery" id="gallery">
      <h2 className="section-title">图片收藏</h2>

      <div className="category-tabs">
        {imageCategories.map(cat => (
          <button
            key={cat}
            className={`tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filtered.map(img => (
          <div
            key={img.id}
            className="gallery-item"
            onClick={() => setLightboxSrc(img.src)}
          >
            <img src={img.src} alt={img.title} loading="lazy" />
            <div className="gallery-item-overlay">
              <span>{img.title}</span>
            </div>
          </div>
        ))}
      </div>

      {lightboxSrc && (
        <div className="lightbox" onClick={() => setLightboxSrc(null)}>
          <img src={lightboxSrc} alt="大图预览" />
        </div>
      )}
    </section>
  )
}
