import { useState, useEffect, useCallback, useRef } from 'react'
import { wallpapers } from '../data/wallpapers'
import useScrollReveal from '../hooks/useScrollReveal'
import './Wallpaper.css'

export default function Wallpaper() {
  const [currentIndex, setCurrentIndex] = useState(null)
  const [showBrowser, setShowBrowser] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const [sectionRef, sectionVisible] = useScrollReveal()
  const svgFilterRef = useRef(null)

  const getRandomIndex = useCallback(() => {
    if (wallpapers.length === 0) return null
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * wallpapers.length)
    } while (newIndex === currentIndex && wallpapers.length > 1)
    return newIndex
  }, [currentIndex])

  const triggerReveal = useCallback(() => {
    setIsRevealing(true)
    const timer = setTimeout(() => setIsRevealing(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const showRandom = useCallback(() => {
    const newIndex = getRandomIndex()
    setCurrentIndex(newIndex)
    triggerReveal()
  }, [getRandomIndex, triggerReveal])

  const selectWallpaper = useCallback((index) => {
    setCurrentIndex(index)
    setShowBrowser(false)
    triggerReveal()
  }, [triggerReveal])

  const handleDownload = useCallback(() => {
    if (currentIndex === null) return
    const item = wallpapers[currentIndex]
    const link = document.createElement('a')
    link.href = item.src
    link.download = `${item.title}.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [currentIndex])

  useEffect(() => {
    if (wallpapers.length > 0 && currentIndex === null) {
      showRandom()
    }
  }, [])

  if (wallpapers.length === 0) {
    return (
      <section className="wallpaper" id="wallpaper" ref={sectionRef}>
        <h2 className={`section-title${sectionVisible ? ' reveal' : ''}`}>壁纸专区</h2>
        <div className="wallpaper-empty">
          <p>壁纸正在准备中，敬请期待...</p>
        </div>
      </section>
    )
  }

  const currentWallpaper = currentIndex !== null ? wallpapers[currentIndex] : null

  return (
    <section className="wallpaper" id="wallpaper" ref={sectionRef}>
      <svg className="wallpaper-svg-filters" width="0" height="0">
        <defs>
          <filter id="dissolve">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={isRevealing ? "0.01" : "0.01"}
              numOctaves="3"
              seed="5"
              result="noise"
            >
              {isRevealing && (
                <animate
                  attributeName="baseFrequency"
                  from="0.02"
                  to="0.005"
                  dur="1.5s"
                  fill="freeze"
                />
              )}
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={isRevealing ? "50" : "0"}
              xChannelSelector="R"
              yChannelSelector="G"
            >
              {isRevealing && (
                <animate
                  attributeName="scale"
                  from="80"
                  to="0"
                  dur="1.5s"
                  fill="freeze"
                />
              )}
            </feDisplacementMap>
            <feGaussianBlur stdDeviation={isRevealing ? "0" : "0"}>
              {isRevealing && (
                <animate
                  attributeName="stdDeviation"
                  from="8"
                  to="0"
                  dur="1.2s"
                  fill="freeze"
                />
              )}
            </feGaussianBlur>
          </filter>
        </defs>
      </svg>

      <h2 className={`section-title${sectionVisible ? ' reveal' : ''}`}>壁纸专区</h2>

      <div className={`wallpaper-showcase${isRevealing ? ' revealing' : ''}`}>
        {currentWallpaper && (
          <div
            className="wallpaper-display"
            style={{
              filter: isRevealing ? 'url(#dissolve)' : 'none'
            }}
          >
            <img
              src={currentWallpaper.src}
              alt={currentWallpaper.title}
              className="wallpaper-main-img"
            />
            <div className="wallpaper-overlay">
              <div className="wallpaper-info">
                <h3>{currentWallpaper.title}</h3>
                {currentWallpaper.resolution && (
                  <span>{currentWallpaper.resolution}</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="wallpaper-controls">
          <button className="wallpaper-btn" onClick={showRandom}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            <span>换一张</span>
          </button>
          <button className="wallpaper-btn" onClick={() => setShowBrowser(true)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
            </svg>
            <span>浏览全部</span>
          </button>
          <button className="wallpaper-btn wallpaper-btn-download" onClick={handleDownload}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            <span>下载壁纸</span>
          </button>
        </div>
      </div>

      {showBrowser && (
        <div className="wallpaper-browser-overlay" onClick={() => setShowBrowser(false)}>
          <div className="wallpaper-browser" onClick={(e) => e.stopPropagation()}>
            <div className="wallpaper-browser-header">
              <h3>选择壁纸</h3>
              <button className="wallpaper-browser-close" onClick={() => setShowBrowser(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="wallpaper-browser-grid">
              {wallpapers.map((item) => {
                const originalIndex = wallpapers.findIndex(w => w.id === item.id)
                return (
                  <div
                    key={item.id}
                    className={`wallpaper-thumbnail${originalIndex === currentIndex ? ' selected' : ''}`}
                    onClick={() => selectWallpaper(originalIndex)}
                  >
                    <img src={item.src} alt={item.title} />
                    <span className="wallpaper-thumb-title">{item.title}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
