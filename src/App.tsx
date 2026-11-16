import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { BlikjesRegen } from './components/BlikjesRegen'
import { Nav } from './components/Nav'
import { SPONSOR_TAKEOVER } from './config'
import { Home } from './pages/Home'
import { Kalender } from './pages/Kalender'
import { Nieuws } from './pages/Nieuws'
import { NieuwsBericht } from './pages/NieuwsBericht'
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

/** De blikjesregen hoort bij de homepagina (één keer per sessie, zie BlikjesRegen). */
function RegenOpHome() {
  return useLocation().pathname === '/' ? <BlikjesRegen /> : null
}

export default function App() {
  return (
    // reducedMotion="user": wie in de gsm-instellingen "minder beweging" aanzet, krijgt geen animaties
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <NaarBoven />
        {SPONSOR_TAKEOVER && <RegenOpHome />}
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kalender" element={<Kalender />} />
          <Route path="/spelers" element={<Spelers />} />
          <Route path="/spelers/:nummer" element={<SpelerDetail />} />
          <Route path="/nieuws" element={<Nieuws />} />
          <Route path="/nieuws/:slug" element={<NieuwsBericht />} />
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  )
}
