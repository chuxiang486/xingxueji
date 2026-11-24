import Navbar from './components/Navbar'
import StarBackground from './components/StarBackground'
import CursorGlow from './components/CursorGlow'
import LoadingScreen from './components/LoadingScreen'
import EasterEgg from './components/EasterEgg'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import Wallpaper from './components/Wallpaper'
import Music from './components/Music'
import ManagedContent from './components/ManagedContent'
import Collection from './components/Collection'
import Guestbook from './components/Guestbook'
import Footer from './components/Footer'
import PlayerBar from './components/PlayerBar'
import { PlayerProvider } from './context/PlayerContext'
import './App.css'

function App() {
  return (
    <PlayerProvider>
      <div className="app">
        <LoadingScreen />
        <StarBackground />
        <CursorGlow />
        <EasterEgg />
        <Navbar />
        <Hero />
        <ManagedContent sections="gallery" id="gallery" title="图片收藏">{images => <Gallery images={images} />}</ManagedContent>
        <ManagedContent sections="wallpapers" id="wallpaper" title="壁纸专区">{items => <Wallpaper wallpapers={items} />}</ManagedContent>
        <Music />
        <ManagedContent sections="anime,games" id="collection" title="我的收藏">{(animeList, gameList) => <Collection animeList={animeList} gameList={gameList} />}</ManagedContent>
        <Guestbook />
        <Footer />
        <PlayerBar />
      </div>
    </PlayerProvider>
  )
}

export default App
