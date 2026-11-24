import { useEffect, useMemo, useState } from 'react'
import { useMusicPlayer } from '../context/usePlayer'
import useScrollReveal from '../hooks/useScrollReveal'
import './Music.css'

function getFirstChar(title) {
  if (!title) return '?'
  const ch = title.charAt(0)
  return /[a-zA-Z]/.test(ch) ? ch.toUpperCase() : ch
}

const categoryColors = {
  '治愈/温柔': 'rgba(100, 180, 220, 0.25)',
  '燃/力量': 'rgba(220, 100, 100, 0.25)',
  '抒情/伤感': 'rgba(180, 130, 220, 0.25)',
  '轻快/日常': 'rgba(120, 200, 140, 0.25)',
}

export default function Music() {
  const [catalog, setCatalog] = useState(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch('/api/songs', { signal: controller.signal })
        if (!response.ok) throw new Error('Catalog unavailable')
        const data = await response.json()
        if (!Array.isArray(data.songs) || !Array.isArray(data.categories)) throw new Error('Invalid catalog')
        if (!controller.signal.aborted) setCatalog(data)
      } catch {
        if (!controller.signal.aborted) setFailed(true)
      }
    }
    load()
    return () => controller.abort()
  }, [attempt])
  if (catalog) return <MusicLibrary songs={catalog.songs} musicCategories={catalog.categories} />
  return (
    <section className="music" id="music">
      <h2 className="section-title reveal">音乐收藏</h2>
      <p className="song-empty" role="status">{failed ? '曲库暂时无法加载' : '正在加载曲库…'}</p>
      {failed && <button className="tab" onClick={() => {
        setFailed(false)
        setAttempt(value => value + 1)
      }}>重新加载曲库</button>}
    </section>
  )
}

function MusicLibrary({ songs, musicCategories }) {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [expandedCats, setExpandedCats] = useState(() => {
    const init = {}
    musicCategories.forEach(c => { init[c] = true })
    return init
  })
  const [sectionRef, sectionVisible] = useScrollReveal()
  const { playSong, currentSong, isPlaying } = useMusicPlayer()

  const keyword = search.trim().toLowerCase()

  const filtered = useMemo(() => songs.filter(song =>
    (activeCategory === '全部' || song.category === activeCategory) &&
    (!keyword || song.title.toLowerCase().includes(keyword) || song.artist.toLowerCase().includes(keyword))
  ), [songs, activeCategory, keyword])

  const grouped = useMemo(() => {
    const groups = {}
    for (const song of filtered) {
      if (!groups[song.category]) groups[song.category] = []
      groups[song.category].push(song)
    }
    return groups
  }, [filtered])

  const toggleCat = (cat) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  const handlePlaySong = (songList, index) => {
    playSong(songList, index)
  }

  const isCurrentSong = (song) => {
    return currentSong && currentSong.id === song.id
  }

  const isAllView = activeCategory === '全部'

  function tuneRadio() {
    const queue = [...filtered]
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const song = queue[i]
      queue[i] = queue[j]
      queue[j] = song
    }
    if (queue.length > 1 && queue[0].id === currentSong?.id) {
      [queue[0], queue[1]] = [queue[1], queue[0]]
    }
    if (queue.length) playSong(queue.slice(0, 5), 0)
  }

  return (
    <section className="music" id="music" ref={sectionRef}>
      <h2 className={`section-title${sectionVisible ? ' reveal' : ''}`}>音乐收藏</h2>

      <div className="category-tabs">
        {musicCategories.map(cat => (
          <button
            key={cat}
            aria-pressed={activeCategory === cat}
            className={`tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(cat)
              setShowAll(false)
              setExpandedCats(prev => ({ ...prev, [cat]: true }))
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="music-search-wrap">
        <input
          type="text"
          className="music-search"
          placeholder="搜索歌名或歌手..."
          aria-label="搜索歌名或歌手"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setShowAll(false)
            setExpandedCats(prev => ({ ...prev, [activeCategory]: true }))
          }}
        />
      </div>

      <aside className="music-radio" aria-label="星尘电台">
        <div>
          <h3>星尘电台</h3>
          <p>{filtered.length
            ? `从${keyword ? '搜索结果' : isAllView ? '整个曲库' : activeCategory}里随机选 ${Math.min(5, filtered.length)} 首，陪你听一会儿。`
            : '换个关键词，就能继续点播。'}</p>
        </div>
        <button type="button" onClick={tuneRadio} disabled={!filtered.length}>
          <span aria-hidden="true">▶</span> 随机点播
        </button>
      </aside>

      <div className={`song-groups${sectionVisible ? ' reveal' : ''}`}>
        {isAllView ? (
          <div className="song-group">
            <div className="song-group-header" style={{ cursor: 'default' }}>
              <span className="song-group-dot" style={{ background: 'rgba(140,120,220,0.25)' }} />
              <span className="song-group-name">全部歌曲</span>
              <span className="song-group-count">{filtered.length} 首</span>
            </div>
            <div className="song-group-list">
              {(showAll ? filtered : filtered.slice(0, 12)).map((song, idx) => (
                <button
                  type="button"
                  aria-label={`播放 ${song.title}，${song.artist}`}
                  key={song.id}
                  className={`song-item ${isCurrentSong(song) ? 'playing' : ''}`}
                  onClick={() => handlePlaySong(filtered, idx)}
                >
                  <div className="song-cover">
                    {getFirstChar(song.title)}
                  </div>
                  <div className="song-info">
                    <span className="song-title">{song.title}</span>
                    <span className="song-artist">{song.artist}</span>
                  </div>
                  <div className="song-play-icon">
                    {isCurrentSong(song) && isPlaying ? (
                      <div className="sound-bars">
                        <span /><span /><span /><span />
                      </div>
                    ) : (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, catSongs]) => (
            <div key={cat} className="song-group">
              <button
                className="song-group-header"
                aria-expanded={expandedCats[cat]}
                onClick={() => toggleCat(cat)}
              >
                <span className="song-group-dot" style={{ background: categoryColors[cat] || 'rgba(140,120,220,0.25)' }} />
                <span className="song-group-name">{cat}</span>
                <span className="song-group-count">{catSongs.length} 首</span>
                <svg
                  className={`song-group-arrow ${expandedCats[cat] ? 'expanded' : ''}`}
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>

              {expandedCats[cat] && (
                <div className="song-group-list">
                  {(showAll ? catSongs : catSongs.slice(0, 12)).map((song, idx) => (
                    <button
                      type="button"
                      aria-label={`播放 ${song.title}，${song.artist}`}
                      key={song.id}
                      className={`song-item ${isCurrentSong(song) ? 'playing' : ''}`}
                      onClick={() => handlePlaySong(catSongs, idx)}
                    >
                      <div className="song-cover">
                        {getFirstChar(song.title)}
                      </div>
                      <div className="song-info">
                        <span className="song-title">{song.title}</span>
                        <span className="song-artist">{song.artist}</span>
                      </div>
                      <div className="song-play-icon">
                        {isCurrentSong(song) && isPlaying ? (
                          <div className="sound-bars">
                            <span /><span /><span /><span />
                          </div>
                        ) : (
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        {filtered.length === 0 && (
          <p className="song-empty">没有找到匹配的歌曲</p>
        )}
      </div>

      {filtered.length > 12 && (
        <div className="music-expand-wrap">
          <button className="tab" aria-expanded={showAll} onClick={() => {
            setShowAll(value => !value)
            setExpandedCats(prev => ({ ...prev, [activeCategory]: true }))
          }}>
            {showAll ? '收起列表' : `查看全部 ${filtered.length} 首`}
          </button>
        </div>
      )}

      <p className="song-count">
        共 {filtered.length} 首
        {activeCategory !== '全部' && ` · ${activeCategory}`}
        {keyword && ` · 搜索"${search.trim()}"`}
      </p>
    </section>
  )
}
