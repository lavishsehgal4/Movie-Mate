import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MovieSection from './components/MovieSection'
import Footer from './components/Footer'
import AuthPage from './pages/AuthPage'
import { trending, inTheatres, comingSoon } from './data/movies'
import './App.css'

function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <MovieSection
        title="Trending Now"
        subtitle="Most booked movies this week"
        movies={trending}
      />
      <MovieSection
        title="Only in Theatres"
        subtitle="Exclusive big-screen experiences"
        movies={inTheatres}
      />
      <MovieSection
        title="Coming Soon"
        subtitle="Mark your calendars"
        movies={comingSoon}
        variant="coming"
      />
      <Footer />
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  )
}

export default App
