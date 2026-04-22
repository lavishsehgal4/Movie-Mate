import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MovieSection from './components/MovieSection'
import Footer from './components/Footer'
import { nowShowing, upcomingBlockbusters } from './data/movies'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <MovieSection title="Now Showing" movies={nowShowing} variant="now" />
      <MovieSection title="Upcoming Blockbusters" movies={upcomingBlockbusters} variant="upcoming" />
      <Footer />
    </>
  )
}

export default App
