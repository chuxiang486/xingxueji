import Navbar from './components/Navbar'
import StarBackground from './components/StarBackground'
import CursorGlow from './components/CursorGlow'
import LoadingScreen from './components/LoadingScreen'
import EasterEgg from './components/EasterEgg'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import Music from './components/Music'
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
        <Gallery />
        <Music />
        <Collection />
        <Guestbook />
        <Footer />
        <PlayerBar />
      </div>
    </PlayerProvider>
  )
}

export default App
