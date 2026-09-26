import { useState } from 'react'
import { songs, musicCategories } from '../data/music'
import { usePlayer } from '../context/PlayerContext'
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
  const [activeCategory, setActiveCategory] = useState('全部')
  const [search, setSearch] = useState('')
  const [expandedCats, setExpandedCats] = useState(() => {
    const init = {}
    musicCategories.forEach(c => { init[c] = true })
    return init
  })
  const [sectionRef, sectionVisible] = useScrollReveal()
  const { playSong, currentSong, isPlaying } = usePlayer()

  const keyword = search.trim().toLowerCase()

  const filtered = songs
    .filter(s => activeCategory === '全部' || s.category === activeCategory)
    .filter(s => !keyword || s.title.toLowerCase().includes(keyword) || s.artist.toLowerCase().includes(keyword))

  const grouped = {}
  for (const song of filtered) {
    if (!grouped[song.category]) grouped[song.category] = []
    grouped[song.category].push(song)
  }

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

  return (
    <section className="music" id="music" ref={sectionRef}>
      <h2 className={`section-title${sectionVisible ? ' reveal' : ''}`}>音乐收藏</h2>

      <div className="category-tabs">
        {musicCategories.map(cat => (
          <button
            key={cat}
            className={`tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={`song-groups${sectionVisible ? ' reveal' : ''}`}>
        {isAllView ? (
          <div className="song-group">
            <div className="song-group-header" style={{ cursor: 'default' }}>
              <span className="song-group-dot" style={{ background: 'rgba(140,120,220,0.25)' }} />
              <span className="song-group-name">全部歌曲</span>
              <span className="song-group-count">{filtered.length} 首</span>
            </div>
            <div className="song-group-list">
              {filtered.map((song, idx) => (
                <div
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
                </div>
              ))}
            </div>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, catSongs]) => (
            <div key={cat} className="song-group">
              <button
                className="song-group-header"
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
                  {catSongs.map((song, idx) => (
                    <div
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
                    </div>
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

      <p className="song-count">
        共 {filtered.length} 首
        {activeCategory !== '全部' && ` · ${activeCategory}`}
        {keyword && ` · 搜索"${search.trim()}"`}
      </p>
    </section>
  )
}
