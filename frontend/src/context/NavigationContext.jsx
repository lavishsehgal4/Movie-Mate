import { createContext, useContext, useState } from 'react'

const NavigationContext = createContext(null)

export function NavigationProvider({ children }) {
  const [page, setPage] = useState('home')
  return (
    <NavigationContext.Provider value={{ page, setPage }}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => useContext(NavigationContext)
