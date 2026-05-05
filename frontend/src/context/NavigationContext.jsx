import { createContext, useContext, useState } from 'react'

const NavigationContext = createContext(null)

export function NavigationProvider({ children }) {
  const [page, setPage] = useState('home')
  const [selectedTheatre, setSelectedTheatre] = useState(null) // { theatreId, theatre_name, city, state, role, ... }

  const goToTheatre = (theatre) => {
    setSelectedTheatre(theatre)
    setPage('theatre-dashboard')
  }

  return (
    <NavigationContext.Provider value={{ page, setPage, selectedTheatre, goToTheatre }}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => useContext(NavigationContext)
