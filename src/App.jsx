import Navbar from './components/Navbar'
import StarBackground from './components/StarBackground'
import CursorGlow from './components/CursorGlow'
import LoadingScreen from './components/LoadingScreen'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import Music from './components/Music'
import Collection from './components/Collection'
import Guestbook from './components/Guestbook'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="app">
      <LoadingScreen />
      <StarBackground />
      <CursorGlow />
      <Navbar />
      <Hero />
      <Gallery />
      <Music />
      <Collection />
      <Guestbook />
      <Footer />
    </div>
  )
}

export default App
