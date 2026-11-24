import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import useScrollReveal from '../hooks/useScrollReveal'
import './Wallpaper.css'

export default function Wallpaper({ wallpapers }) {
  const [currentIndex, setCurrentIndex] = useState(() => wallpapers.length ? Math.floor(Math.random() * wallpapers.length) : null)
  const [showBrowser, setShowBrowser] = useState(false)
  const [isRevealing, setIsRevealing] = useState(true)
  const [sectionRef, sectionVisible] = useScrollReveal()
  const svgFilterRef = useRef(null)
  const browserRef = useRef(null)

  const getRandomIndex = useCallback(() => {
    if (wallpapers.length === 0) return null
    if (wallpapers.length === 1) return 0
    const offset = 1 + Math.floor(Math.random() * (wallpapers.length - 1))
    return (currentIndex + offset) % wallpapers.length
  }, [currentIndex, wallpapers.length])

  useEffect(() => {
    const svg = svgFilterRef.current
    if (!svg) return
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionPreference.matches) {
      const frame = requestAnimationFrame(() => setIsRevealing(false))
      return () => cancelAnimationFrame(frame)
    }

    const turbulence = svg.querySelector('feTurbulence')
    const displacement = svg.querySelector('feDisplacementMap')
    const blur = svg.querySelector('feGaussianBlur')

    if (turbulence) turbulence.setAttribute('baseFrequency', '0.02')
    if (displacement) displacement.setAttribute('scale', '80')
    if (blur) blur.setAttribute('stdDeviation', '8')

    const duration = 1500
    const startTime = performance.now()
    let animationId

    const handleMotionChange = () => {
      if (!motionPreference.matches) return
      cancelAnimationFrame(animationId)
      if (displacement) displacement.setAttribute('scale', '0')
      if (blur) blur.setAttribute('stdDeviation', '0')
      setIsRevealing(false)
    }

    const animate = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      if (turbulence) {
        const freq = 0.02 - (0.02 - 0.005) * easeProgress
        turbulence.setAttribute('baseFrequency', freq.toString())
      }
      if (displacement) {
        const scale = 80 * (1 - easeProgress)
        displacement.setAttribute('scale', scale.toString())
      }
      if (blur) {
        const blurVal = 8 * (1 - easeProgress)
        blur.setAttribute('stdDeviation', blurVal.toString())
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      } else {
        setIsRevealing(false)
      }
    }

    animationId = requestAnimationFrame(animate)
    motionPreference.addEventListener('change', handleMotionChange)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      motionPreference.removeEventListener('change', handleMotionChange)
    }
  }, [currentIndex])

  const showRandom = useCallback(() => {
    if (wallpapers.length < 2) return
    const newIndex = getRandomIndex()
    setCurrentIndex(newIndex)
    setIsRevealing(true)
  }, [getRandomIndex, wallpapers.length])

  const selectWallpaper = useCallback((index) => {
    setShowBrowser(false)
    if (index === currentIndex) return
    setCurrentIndex(index)
    setIsRevealing(true)
  }, [currentIndex])

  const handleDownload = useCallback(() => {
    if (currentIndex === null) return
    const item = wallpapers[currentIndex]
    const link = document.createElement('a')
    link.href = item.src
    const extension = new URL(item.src, document.baseURI).pathname.match(/\.(png|webp|jpe?g|avif|gif)$/i)?.[0] || ''
    link.download = item.title + extension
    link.rel = 'noopener'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [currentIndex, wallpapers])

  useEffect(() => {
    if (!showBrowser) return
    const trigger = document.activeElement
    const root = document.getElementById('root')
    const previousInert = root?.inert
    const previousOverflow = document.body.style.overflow
    if (root) root.inert = true
    document.body.style.overflow = 'hidden'
    browserRef.current?.querySelector('button')?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShowBrowser(false)
      if (event.key !== 'Tab') return
      const buttons = [...browserRef.current.querySelectorAll('button')]
      const first = buttons[0]
      const last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (root) root.inert = previousInert
      trigger?.focus()
    }
  }, [showBrowser])

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
      <svg ref={svgFilterRef} aria-hidden="true" className="wallpaper-svg-filters" width="0" height="0">
        <defs>
          <filter id="dissolve">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01"
              numOctaves="3"
              seed="5"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation="0" />
          </filter>
        </defs>
      </svg>

      <h2 className={`section-title${sectionVisible ? ' reveal' : ''}`}>壁纸专区</h2>

      <div className={`wallpaper-showcase${isRevealing ? ' revealing' : ''}`}>
        {currentWallpaper && (
          <div
            className={`wallpaper-display${isRevealing ? ' revealing' : ''}`}
          >
            <img
              src={currentWallpaper.preview || currentWallpaper.src}
              srcSet={currentWallpaper.srcSet}
              sizes="(max-width: 1400px) calc(100vw - 40px), 1360px"
              width={currentWallpaper.width}
              height={currentWallpaper.height}
              alt={currentWallpaper.title}
              className="wallpaper-main-img"
              loading="lazy"
              decoding="async"
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
          <button className="wallpaper-btn" aria-label="换一张壁纸" onClick={showRandom}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            <span>换一张</span>
          </button>
          <button className="wallpaper-btn" aria-label="浏览全部壁纸" onClick={() => setShowBrowser(true)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
            </svg>
            <span>浏览全部</span>
          </button>
          <button className="wallpaper-btn wallpaper-btn-download" aria-label="下载壁纸" onClick={handleDownload}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            <span>下载壁纸</span>
          </button>
        </div>
      </div>

      {showBrowser && (
        createPortal(<div className="wallpaper-browser-overlay" onClick={() => setShowBrowser(false)}>
          <div ref={browserRef} role="dialog" aria-modal="true" aria-labelledby="wallpaper-browser-title" className="wallpaper-browser" onClick={(e) => e.stopPropagation()}>
            <div className="wallpaper-browser-header">
              <h3 id="wallpaper-browser-title">选择壁纸</h3>
              <button className="wallpaper-browser-close" aria-label="关闭壁纸浏览" onClick={() => setShowBrowser(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="wallpaper-browser-grid">
              {wallpapers.map((item, originalIndex) => {
                return (
                  <button
                    type="button"
                    aria-pressed={originalIndex === currentIndex}
                    key={item.id}
                    className={`wallpaper-thumbnail${originalIndex === currentIndex ? ' selected' : ''}`}
                    onClick={() => selectWallpaper(originalIndex)}
                  >
                    <img src={item.thumbnail || item.src} alt={item.title} width={item.width} height={item.height} loading="lazy" decoding="async" />
                    <span className="wallpaper-thumb-title">{item.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>, document.body)
      )}
    </section>
  )
}
