import { useEffect, useMemo, useState } from 'react'
import { MotionConfig, useReducedMotion } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { BierGiet, GIET_DICHT_MS } from './components/BierGiet'
import { BlikjesRegen } from './components/BlikjesRegen'
import { Footer } from './components/Footer'
import { Nav } from './components/Nav'
import { SPONSOR_TAKEOVER } from './config'
import { IntredeContext } from './lib/intrede'
import { zetKop } from './lib/seo'
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
 * Bij een nieuwe pagina: terug naar boven scrollen en de <head> bijwerken (titel, beschrijving, ... uit lib/seo.ts).
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

  // De browser scrollt in een React-app niet vanzelf naar boven
  useEffect(() => {
    window.scrollTo(0, 0)
    zetKop(pagina.pathname)
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

/**
 * Komt de blikjesregen? Dat beslist een klein script in <head> (vite.config.ts) nog vóór de eerste pixel:
 * enkel bij binnenkomen op de homepagina, één keer per sessie. Het zet data-regen="1" op <html>.
 * Bij het voorrenderen (geen document) is het antwoord altijd nee; de HTML is daardoor voor iedereen gelijk.
 */
const regenKomt = () => typeof document !== 'undefined' && document.documentElement.dataset.regen === '1'

/**
 * De site zonder router. In de browser zit hij in een BrowserRouter (hieronder),
 * bij het bouwen in een StaticRouter (src/entry-server.tsx) om elke pagina als HTML voor te renderen.
 */
export function Site() {
  const opHome = useLocation().pathname === '/'
  // Tot de regen overgaat in de pagina blijft de homepagina in haar begin-stand (zie lib/intrede.ts)
  const [regen] = useState(regenKomt)
  const [regenWeg, setRegenWeg] = useState(false)
  const [vrij, setVrij] = useState(!regen)
  const [kruis, setKruis] = useState(!regen)
  const intrede = useMemo(() => ({ vrij, naRegen: regen, kruis }), [vrij, regen, kruis])

  return (
    // reducedMotion="user": wie in de gsm-instellingen "minder beweging" aanzet, krijgt geen animaties
    <MotionConfig reducedMotion="user">
      <IntredeContext.Provider value={intrede}>
        {/* Altijd in de HTML van de homepagina (zo is die voor iedereen gelijk); CSS toont hem enkel bij data-regen */}
        {SPONSOR_TAKEOVER && opHome && !regenWeg && (
          <BlikjesRegen
            actief={regen}
            vrij={() => setVrij(true)}
            kruisGeland={() => setKruis(true)}
            opgeruimd={() => setRegenWeg(true)}
          />
        )}
        <Nav />
        <Paginas />
        <Footer />
      </IntredeContext.Provider>
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
