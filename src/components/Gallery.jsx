import { useState, useEffect, useCallback } from 'react'
import { images, imageCategories } from '../data/images'
import useScrollReveal from '../hooks/useScrollReveal'
import './Gallery.css'

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [sectionRef, sectionVisible] = useScrollReveal()

  const filtered = activeCategory === '全部'
    ? images
    : images.filter(img => img.category === activeCategory)

  const handleCloseLightbox = useCallback(() => {
    setLightboxSrc(null)
  }, [])

  useEffect(() => {
    if (!lightboxSrc) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseLightbox()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [lightboxSrc, handleCloseLightbox])

  return (
    <section className="gallery" id="gallery" ref={sectionRef}>
      <h2 className={`section-title${sectionVisible ? ' reveal' : ''}`}>图片收藏</h2>

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
        {filtered.map((img, index) => (
          <div
            key={img.id}
            className={`gallery-item${sectionVisible ? ' reveal' : ''}`}
            style={{ transitionDelay: sectionVisible ? `${index * 0.05}s` : '0s' }}
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
        <div className="lightbox" onClick={handleCloseLightbox}>
          <button className="lightbox-close" onClick={handleCloseLightbox}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
          <img className="lightbox-img" src={lightboxSrc} alt="大图预览" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  )
}
