import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { AppLayout } from './components/layout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Orders from './pages/Orders'
import Products from './pages/Products'
import AITools from './pages/AITools'

// Theme Context for dark mode
const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved || 'light'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme)
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="ai-tools" element={<AITools />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
