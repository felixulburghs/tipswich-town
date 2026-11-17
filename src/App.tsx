import { useEffect, useMemo, useRef, useState } from 'react'
import { MotionConfig, useReducedMotion } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import { BlikjesRegen } from './components/BlikjesRegen'
import { Footer } from './components/Footer'
import { Nav } from './components/Nav'
import { Rouge, type RougeVel } from './components/Rouge'
import { SPONSOR_TAKEOVER } from './config'
import { IntredeContext, useIntrede } from './lib/intrede'
import { zetKop } from './lib/seo'
import { Home } from './pages/Home'
import { Kalender } from './pages/Kalender'
import { Nieuws } from './pages/Nieuws'
import { NieuwsBericht } from './pages/NieuwsBericht'
import { SpelerDetail } from './pages/SpelerDetail'
import { Spelers } from './pages/Spelers'

/**
 * De pagina's. Tijdens de takeover is elke paginawissel een veeg van het rode vel (components/Rouge.tsx):
 * het vel bedekt het scherm, dan wisselt de pagina (getoond) en springt de scroll naar boven, onzichtbaar eronder.
 * De intredes van de nieuwe pagina wachten tot de penseelrand voorbij de helft is (paginaVrij).
 * - zelfde pagina of enkel een #anker: geen veeg
 * - terug/vooruit: het vel gaat van boven naar onder
 * - een klik tijdens een veeg: die veeg neemt de nieuwste pagina mee, of er volgt er meteen nog één
 * - minder beweging: 150 ms overvloeien (75 uit, wisselen, 75 in)
 * - zonder takeover: meteen wisselen, zoals vroeger
 * Bij een nieuwe pagina: terug naar boven scrollen en de <head> bijwerken (titel, beschrijving, ... uit lib/seo.ts).
 */
function Paginas() {
  const location = useLocation()
  const navigatie = useNavigationType()
  const minderBeweging = useReducedMotion()
  const buiten = useIntrede()
  const [getoond, setGetoond] = useState(location)
  const [volgende, setVolgende] = useState<{ plek: typeof location; omlaag: boolean } | null>(null)
  const [paginaVrij, setPaginaVrij] = useState(true)
  const [vervaagd, setVervaagd] = useState(false)
  const vel = useRef<RougeVel>(null)
  const lagenRef = useRef<HTMLDivElement>(null)
  const doel = useRef(location) // de nieuwste locatie
  const getoondPad = useRef(location.pathname)
  const bezig = useRef(false)
  const pagina = SPONSOR_TAKEOVER ? getoond : location

  // Eerst de nieuwe pagina verborgen opbouwen (al op haar plaats, enkel onzichtbaar), dán pas vegen:
  // tijdens de veeg heeft de hoofdthread zo bijna niets te doen en is de wissel enkel "zichtbaar maken".
  const veeg = (omlaag: boolean) => {
    bezig.current = true
    setVolgende({ plek: doel.current, omlaag })
  }
  useEffect(() => {
    if (!volgende) return
    vel.current!.veeg({
      omlaag: volgende.omlaag,
      dicht: () => {
        // De wissel meteen zelf in de DOM (zelfde eindstand als React straks): React heeft voor het afbreken
        // van de oude pagina op een trage gsm langer nodig dan het scherm bedekt is.
        const [oud, nieuw] = lagenRef.current!.children as unknown as HTMLElement[]
        if (nieuw && doel.current === volgende.plek) {
          oud.style.display = 'none'
          nieuw.className = ''
          nieuw.inert = false
          window.scrollTo(0, 0)
        }
        setPaginaVrij(false)
        setVolgende(null)
        setGetoond(doel.current)
        getoondPad.current = doel.current.pathname
      },
      zichtbaar: () => setPaginaVrij(true),
    }).then(() => {
      bezig.current = false
      if (doel.current.pathname !== getoondPad.current) veeg(volgende.omlaag)
    })
  }, [volgende])

  useEffect(() => {
    doel.current = location
    if (bezig.current) return
    if (!SPONSOR_TAKEOVER || location.pathname === getoond.pathname) {
      setGetoond(location)
      return
    }
    if (minderBeweging) {
      setVervaagd(true)
      const t = setTimeout(() => {
        setGetoond(location)
        getoondPad.current = location.pathname
        setVervaagd(false)
      }, 75)
      return () => clearTimeout(t)
    }
    veeg(navigatie === 'POP')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- enkel reageren op een nieuwe locatie
  }, [location])

  // De browser scrollt in een React-app niet vanzelf naar boven (tijdens de takeover: onder het rode vel)
  useEffect(() => {
    window.scrollTo(0, 0)
    zetKop(pagina.pathname)
  }, [pagina.pathname])

  const intrede = useMemo(() => ({ ...buiten, vrij: buiten.vrij && paginaVrij }), [buiten, paginaVrij])
  const verborgen = useMemo(() => ({ ...buiten, vrij: false }), [buiten]) // de volgende pagina wacht in haar begin-stand
  const routes = (plek: typeof location) => (
    <Routes location={plek}>
      <Route path="/" element={<Home />} />
      <Route path="/kalender" element={<Kalender />} />
      <Route path="/spelers" element={<Spelers />} />
      <Route path="/spelers/:nummer" element={<SpelerDetail />} />
      <Route path="/nieuws" element={<Nieuws />} />
      <Route path="/nieuws/:slug" element={<NieuwsBericht />} />
    </Routes>
  )
  // De getoonde pagina, en tijdens een veeg ook de volgende (verborgen). Per sleutel: bij de wissel blijft
  // de volgende gewoon staan (enkel zichtbaar gemaakt) en verdwijnt de oude.
  const lagen = volgende && volgende.plek.key !== getoond.key ? [getoond, volgende.plek] : [getoond]
  if (!SPONSOR_TAKEOVER) return routes(location)
  return (
    <>
      {/* enkel voor "minder beweging": de korte overvloeier */}
      <div ref={lagenRef} style={{ opacity: vervaagd ? 0 : 1, transition: 'opacity 75ms linear' }}>
        {lagen.map((l) => (
          // de volgende: al opgemaakt bovenaan (zo kost de wissel geen opmaak meer), maar onzichtbaar en onbereikbaar
          <div key={l.key} inert={l !== getoond} className={l === getoond ? '' : 'invisible absolute inset-x-0 top-0'}>
            <IntredeContext.Provider value={l === getoond ? intrede : verborgen}>{routes(l)}</IntredeContext.Provider>
          </div>
        ))}
      </div>
      <Rouge ref={vel} />
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
