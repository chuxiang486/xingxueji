import { useState, useEffect, useCallback } from 'react'
import { images, imageCategories } from '../data/images'
import useScrollReveal from '../hooks/useScrollReveal'
import './Gallery.css'

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [sectionRef, sectionVisible] = useScrollReveal()

  const filtered = activeCategory === '全部'
    ? images
    : images.filter(img => img.category === activeCategory)

  const openLightbox = (index) => setLightboxIndex(index)

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  const goPrev = useCallback(() => {
    setLightboxIndex(prev => prev === null ? null : (prev - 1 + filtered.length) % filtered.length)
  }, [filtered.length])

  const goNext = useCallback(() => {
    setLightboxIndex(prev => prev === null ? null : (prev + 1) % filtered.length)
  }, [filtered.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, closeLightbox, goPrev, goNext])

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
            onClick={() => openLightbox(index)}
          >
            <img src={img.src} alt={img.title} loading="lazy" />
            <div className="gallery-item-overlay">
              <span>{img.title}</span>
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
          <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); goPrev() }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <img
            className="lightbox-img"
            src={filtered[lightboxIndex].src}
            alt={filtered[lightboxIndex].title}
            onClick={(e) => e.stopPropagation()}
          />
          <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); goNext() }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
          <div className="lightbox-counter">
            {lightboxIndex + 1} / {filtered.length}
          </div>
        </div>
      )}
    </section>
  )
}
