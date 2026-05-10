import { createContext, useContext, useState } from 'react'

const NavigationContext = createContext(null)

export function NavigationProvider({ children }) {
  const [page, setPage] = useState('home')
  const [selectedTheatre, setSelectedTheatre] = useState(null)
  const [selectedScreen,  setSelectedScreen]  = useState(null)

  const goToTheatre = (theatre) => {
    setSelectedTheatre(theatre)
    setPage('theatre-dashboard')
  }

  const goToScreen = (screen) => {
    setSelectedScreen(screen)
    setPage('screen-detail')
  }

  return (
    <NavigationContext.Provider value={{ page, setPage, selectedTheatre, goToTheatre, selectedScreen, goToScreen }}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => useContext(NavigationContext)
