import { useEffect, useMemo, useState } from 'react'
import { MotionConfig, useReducedMotion } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import { BlikjesRegen } from './components/BlikjesRegen'
import { Footer } from './components/Footer'
import { Nav } from './components/Nav'
import { SPONSOR_TAKEOVER } from './config'
import { giet } from './lib/bier'
import { IntredeContext, useIntrede } from './lib/intrede'
import { zetKop } from './lib/seo'
import { Home } from './pages/Home'
import { Kalender } from './pages/Kalender'
import { Nieuws } from './pages/Nieuws'
import { NieuwsBericht } from './pages/NieuwsBericht'
import { SpelerDetail } from './pages/SpelerDetail'
import { Spelers } from './pages/Spelers'

/** Volgorde van de nav, voor de kanteling van het bier: een detailpagina staat net rechts van haar overzicht. */
const VOLGORDE = ['/', '/kalender', '/spelers', '/nieuws']
const plek = (pad: string) => {
  const delen = pad.split('/').filter(Boolean)
  return Math.max(0, VOLGORDE.indexOf('/' + (delen[0] ?? ''))) + (delen.length > 1 ? 0.5 : 0)
}

/**
 * De pagina's. Tijdens de takeover is elke paginawissel een "pour" (lib/bier.ts): het bier stijgt tot het
 * scherm vol is, dan wisselt de pagina (getoond) en springt de scroll naar boven, onzichtbaar eronder.
 * De intredes van de nieuwe pagina wachten tot het schuim voorbij 60% zakt (paginaVrij), zodat ze in beeld spelen.
 * - zelfde pagina of enkel een #anker: geen bier
 * - minder beweging: 100 ms uitfaden, wisselen, 100 ms infaden
 * - zonder takeover: meteen wisselen, zoals vroeger
 * Bij een nieuwe pagina: terug naar boven scrollen en de <head> bijwerken (titel, beschrijving, ... uit lib/seo.ts).
 */
function Paginas() {
  const location = useLocation()
  const navigatie = useNavigationType()
  const minderBeweging = useReducedMotion()
  const buiten = useIntrede()
  const [getoond, setGetoond] = useState(location)
  const [paginaVrij, setPaginaVrij] = useState(true)
  const [vervaagd, setVervaagd] = useState(false)
  const pagina = SPONSOR_TAKEOVER ? getoond : location

  useEffect(() => {
    if (!SPONSOR_TAKEOVER || location.pathname === getoond.pathname) {
      setGetoond(location)
      return
    }
    let gestopt = false
    if (minderBeweging) {
      setVervaagd(true)
      const t = setTimeout(() => {
        setGetoond(location)
        setVervaagd(false)
      }, 100)
      return () => clearTimeout(t)
    }
    // Kanteling: in de richting van de nav-volgorde; terug/vooruit in de geschiedenis kantelt vanzelf andersom
    const verschil = plek(location.pathname) - plek(getoond.pathname)
    const richting = verschil !== 0 ? Math.sign(verschil) : navigatie === 'POP' ? -1 : 1
    giet({
      richting,
      dicht: () => {
        if (gestopt) return
        setPaginaVrij(false)
        setGetoond(location)
      },
      zichtbaar: () => !gestopt && setPaginaVrij(true),
    })
    return () => {
      gestopt = true // een nieuwe klik midden in de overgang: die nieuwe overgang neemt het over
      setPaginaVrij(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- enkel reageren op een nieuwe locatie
  }, [location])

  // De browser scrollt in een React-app niet vanzelf naar boven (tijdens de takeover: onder het volle bier)
  useEffect(() => {
    window.scrollTo(0, 0)
    zetKop(pagina.pathname)
  }, [pagina.pathname])

  const intrede = useMemo(() => ({ ...buiten, vrij: buiten.vrij && paginaVrij }), [buiten, paginaVrij])
  const routes = (
    <Routes location={pagina}>
      <Route path="/" element={<Home />} />
      <Route path="/kalender" element={<Kalender />} />
      <Route path="/spelers" element={<Spelers />} />
      <Route path="/spelers/:nummer" element={<SpelerDetail />} />
      <Route path="/nieuws" element={<Nieuws />} />
      <Route path="/nieuws/:slug" element={<NieuwsBericht />} />
    </Routes>
  )
  if (!SPONSOR_TAKEOVER) return routes
  return (
    <IntredeContext.Provider value={intrede}>
      {/* enkel voor "minder beweging": de korte overvloeier */}
      <div style={{ opacity: vervaagd ? 0 : 1, transition: 'opacity 100ms linear' }}>{routes}</div>
    </IntredeContext.Provider>
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
