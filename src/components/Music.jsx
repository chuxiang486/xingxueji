import { useState } from 'react'
import { songs, musicCategories, qqMusicPlaylist } from '../data/music'
import useScrollReveal from '../hooks/useScrollReveal'
import './Music.css'

function getQQSearchUrl(title, artist) {
  const query = `${title} ${artist}`
  return `https://y.qq.com/n/ryqq/search?w=${encodeURIComponent(query)}`
}

export default function Music() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [search, setSearch] = useState('')
  const [sectionRef, sectionVisible] = useScrollReveal()

  const keyword = search.trim().toLowerCase()

  const filtered = songs
    .filter(s => activeCategory === '全部' || s.category === activeCategory)
    .filter(s => !keyword || s.title.toLowerCase().includes(keyword) || s.artist.toLowerCase().includes(keyword))

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
        <a
          href={qqMusicPlaylist}
          target="_blank"
          rel="noopener noreferrer"
          className="playlist-link"
        >
          在 QQ 音乐中打开完整歌单 →
        </a>
      </div>

      <div className={`song-list${sectionVisible ? ' reveal' : ''}`}>
        {filtered.map((song, index) => (
          <div key={song.id} className="song-item">
            <span className="song-number">{index + 1}</span>
            <div className="song-info">
              <span className="song-title">{song.title}</span>
              <span className="song-artist">{song.artist}</span>
            </div>
            <span className="song-category-tag">{song.category}</span>
            <a
              href={getQQSearchUrl(song.title, song.artist)}
              target="_blank"
              rel="noopener noreferrer"
              className="song-play-btn"
              title="在 QQ 音乐中搜索"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </a>
          </div>
        ))}
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
