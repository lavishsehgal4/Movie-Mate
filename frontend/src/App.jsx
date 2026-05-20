import { useNavigation } from './context/NavigationContext'
import { useAuth } from './context/AuthContext'
import Hero from './components/Hero'
import MoviesSection from './components/MoviesSection'
import Footer from './components/Footer'
import ProfilePage from './pages/ProfilePage'
import PartnerPage from './pages/PartnerPage'
import MyTheatrePage from './pages/MyTheatrePage'
import TheatreDashboard from './pages/TheatreDashboard'
import ScreenDetailPage from './pages/ScreenDetailPage'
import MovieDetailPage from './pages/MovieDetailPage'
import './App.css'

export default function App() {
  const { page } = useNavigation()
  const { authLoading } = useAuth()

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#E8895B', fontSize: 14, fontFamily: 'sans-serif' }}>Loading...</div>
      </div>
    )
  }

  if (page === 'profile')           return <ProfilePage />
  if (page === 'partner')           return <PartnerPage />
  if (page === 'my-theatre')        return <MyTheatrePage />
  if (page === 'theatre-dashboard') return <TheatreDashboard />
  if (page === 'screen-detail')     return <ScreenDetailPage />
  if (page === 'movie-detail')      return <MovieDetailPage />

  return (
    <>
      <Hero />
      <MoviesSection />
      <Footer />
    </>
  )
}
