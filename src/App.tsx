import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Nav } from './components/Nav'
import { zetKop } from './lib/seo'
import { Home } from './pages/Home'
import { Kalender } from './pages/Kalender'
import { Nieuws } from './pages/Nieuws'
import { NieuwsBericht } from './pages/NieuwsBericht'
import { SpelerDetail } from './pages/SpelerDetail'
import { Spelers } from './pages/Spelers'

/**
 * Bij het wisselen van pagina: terug naar boven scrollen (de browser doet dat niet vanzelf in een React-app)
 * en titel, beschrijving en deel-gegevens van de nieuwe pagina in de <head> zetten (zie lib/seo.ts).
 */
function BijNieuwePagina() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    zetKop(pathname)
  }, [pathname])
  return null
}

/**
 * De site zonder router. In de browser zit hij in een BrowserRouter (hieronder),
 * bij het bouwen in een StaticRouter (src/entry-server.tsx) om elke pagina als HTML voor te renderen.
 */
export function Site() {
  return (
    // reducedMotion="user": wie in de gsm-instellingen "minder beweging" aanzet, krijgt geen animaties
    <MotionConfig reducedMotion="user">
      <BijNieuwePagina />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kalender" element={<Kalender />} />
        <Route path="/spelers" element={<Spelers />} />
        <Route path="/spelers/:nummer" element={<SpelerDetail />} />
        <Route path="/nieuws" element={<Nieuws />} />
        <Route path="/nieuws/:slug" element={<NieuwsBericht />} />
      </Routes>
    </MotionConfig>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Site />
    </BrowserRouter>
  )
}
