import { useEffect, useState } from 'react'
import { MotionConfig, useReducedMotion } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { BierGiet, GIET_DICHT_MS } from './components/BierGiet'
import { BlikjesRegen } from './components/BlikjesRegen'
import { Footer } from './components/Footer'
import { Nav } from './components/Nav'
import { SPONSOR_TAKEOVER } from './config'
import { Home } from './pages/Home'
import { Kalender } from './pages/Kalender'
import { Nieuws } from './pages/Nieuws'
import { NieuwsBericht } from './pages/NieuwsBericht'
import { SpelerDetail } from './pages/SpelerDetail'
import { Spelers } from './pages/Spelers'

/**
 * De pagina's. Tijdens de takeover is elke paginawissel een "pour" (BierGiet): het bier stijgt,
 * en pas als het scherm vol is tonen we de nieuwe pagina (getoond), onzichtbaar eronder.
 * Zonder takeover of met "minder beweging" wisselt de pagina meteen, zoals vroeger.
 */
function Paginas() {
  const location = useLocation()
  const minderBeweging = useReducedMotion()
  const [getoond, setGetoond] = useState(location)
  const [giet, setGiet] = useState<string | null>(null) // key van de lopende overgang
  const gieten = SPONSOR_TAKEOVER && !minderBeweging
  const pagina = gieten ? getoond : location

  useEffect(() => {
    if (!gieten || location.pathname === getoond.pathname) {
      setGetoond(location)
      return
    }
    setGiet(location.key)
    const wissel = setTimeout(() => setGetoond(location), GIET_DICHT_MS)
    const klaar = setTimeout(() => setGiet(null), 670) // net na de animatie (660 ms): samen onder 700 ms
    return () => {
      clearTimeout(wissel)
      clearTimeout(klaar)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- enkel reageren op een nieuwe locatie
  }, [location])

  // Terug naar boven scrollen bij een nieuwe pagina (de browser doet dat niet vanzelf in een React-app)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pagina.pathname])

  return (
    <>
      <Routes location={pagina}>
        <Route path="/" element={<Home />} />
        <Route path="/kalender" element={<Kalender />} />
        <Route path="/spelers" element={<Spelers />} />
        <Route path="/spelers/:nummer" element={<SpelerDetail />} />
        <Route path="/nieuws" element={<Nieuws />} />
        <Route path="/nieuws/:slug" element={<NieuwsBericht />} />
      </Routes>
      {giet && <BierGiet key={giet} />}
    </>
  )
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
        {SPONSOR_TAKEOVER && <RegenOpHome />}
        <Nav />
        <Paginas />
        <Footer />
      </BrowserRouter>
    </MotionConfig>
  )
}
