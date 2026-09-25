import { animeList, gameList } from '../data/collections'
import useScrollReveal from '../hooks/useScrollReveal'
import './Collection.css'

function StarRating({ rating }) {
  const stars = []
  for (let i = 1; i <= 10; i++) {
    stars.push(
      <span key={i} className={`star${i <= rating ? ' filled' : ''}`}>
        ★
      </span>
    )
  }
  return <span className="star-rating">{stars}</span>
}

export default function Collection() {
  const [sectionRef, sectionVisible] = useScrollReveal()

  return (
    <section className="collection" id="collection" ref={sectionRef}>
      <h2 className={`section-title${sectionVisible ? ' reveal' : ''}`}>我的收藏</h2>

      <div className="collection-block">
        <h3 className={`collection-subtitle${sectionVisible ? ' reveal' : ''}`}>追番</h3>
        <div className="anime-grid">
          {animeList.map((anime, index) => (
            <div
              key={anime.id}
              className={`anime-card${sectionVisible ? ' reveal' : ''}`}
              style={{ transitionDelay: sectionVisible ? `${index * 0.06}s` : '0s' }}
            >
              <div className="anime-header">
                <span className="anime-title">{anime.title}</span>
                <span className="anime-status">{anime.status}</span>
              </div>
              <StarRating rating={anime.rating} />
              {anime.note && <span className="anime-note">{anime.note}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="collection-block">
        <h3 className={`collection-subtitle${sectionVisible ? ' reveal' : ''}`}>游戏</h3>
        <div className="game-grids">
          {gameList.map((game, index) => (
            <div
              key={game.id}
              className={`game-card${sectionVisible ? ' reveal' : ''}`}
              style={{ transitionDelay: sectionVisible ? `${index * 0.06}s` : '0s' }}
            >
              <span className="game-title">{game.title}</span>
              <span className="game-platform">{game.platform}</span>
              <span className="game-hours">{game.hours}</span>
              {game.note && <span className="game-note">{game.note}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
