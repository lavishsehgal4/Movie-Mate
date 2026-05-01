import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { NavigationProvider } from './context/NavigationContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <NavigationProvider>
      <App />
    </NavigationProvider>
  </AuthProvider>,
)
