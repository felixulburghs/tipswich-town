import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Home } from './pages/Home'
import { Kalender } from './pages/Kalender'
import { SpelerDetail } from './pages/SpelerDetail'
import { Spelers } from './pages/Spelers'

/** Bij het wisselen van pagina terug naar boven scrollen (de browser doet dat niet vanzelf in een React-app). */
function NaarBoven() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    // reducedMotion="user": wie in de gsm-instellingen "minder beweging" aanzet, krijgt geen animaties
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <NaarBoven />
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kalender" element={<Kalender />} />
          <Route path="/spelers" element={<Spelers />} />
          <Route path="/spelers/:nummer" element={<SpelerDetail />} />
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  )
}
