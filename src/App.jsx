import Navbar from './components/Navbar'
import StarBackground from './components/StarBackground'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import Music from './components/Music'
import Guestbook from './components/Guestbook'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="app">
      <StarBackground />
      <Navbar />
      <Hero />
      <Gallery />
      <Music />
      <Guestbook />
      <Footer />
    </div>
  )
}

export default App
