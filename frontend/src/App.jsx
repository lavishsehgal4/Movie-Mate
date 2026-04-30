import { useNavigation } from './context/NavigationContext'
import Hero from './components/Hero'
import MoviesSection from './components/MoviesSection'
import Footer from './components/Footer'
import ProfilePage from './pages/ProfilePage'
import './App.css'

export default function App() {
  const { page } = useNavigation()

  if (page === 'profile') {
    return <ProfilePage />
  }

  return (
    <>
      <Hero />
      <MoviesSection />
      <Footer />
    </>
  )
}
