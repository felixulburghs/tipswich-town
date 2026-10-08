import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

const DUUR = 3 // seconden: vullen, even klotsen, weer leeglopen
const willekeurig = (min: number, max: number) => min + Math.random() * (max - min)

// Golfvorm (periode 300 op een breedte van 1200), gebruikt voor boven- en onderrand van het schuim
const GOLF = 'C50 6 100 6 150 22s100 16 150 0 100-16 150 0 100 16 150 0 100-16 150 0 100 16 150 0 100-16 150 0 100 16 150 0'

/** Belletjes-textuur voor het schuim: een SVG-patroon van kleine cirkels. */
function SchuimTextuur({ id }: { id: string }) {
  return (
    <pattern id={id} width="26" height="18" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="5" r="3.2" fill="#ffffff" fillOpacity="0.7" />
      <circle cx="17" cy="11" r="4" fill="#ffffff" fillOpacity="0.55" />
      <circle cx="22" cy="3" r="1.8" fill="#ffffff" fillOpacity="0.8" />
      <circle cx="10" cy="14" r="1.5" fill="#e9d29a" fillOpacity="0.6" />
    </pattern>
  )
}

/**
 * Schuimkraag met golvende bovenrand: romige kleurverloop + belletjes-textuur erover.
 * Twee keer zo breed als het scherm, zodat hij oneindig kan opschuiven = schommelend schuim.
 */
function Schuim() {
  const vorm = `M0 100V22${GOLF}v78z`
  return (
    <motion.svg
      viewBox="0 0 1200 100"
      preserveAspectRatio="none"
      className="absolute bottom-full left-0 h-16 w-[200%] sm:h-20"
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration: 1.8, ease: 'linear', repeat: Infinity }}
    >
      <defs>
        <linearGradient id="schuim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffaf0" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#fbefcf" stopOpacity="1" />
          <stop offset="1" stopColor="#f1dca3" stopOpacity="1" />
        </linearGradient>
        <SchuimTextuur id="schuimbellen" />
      </defs>
      <path d={vorm} fill="url(#schuim)" />
      <path d={vorm} fill="url(#schuimbellen)" />
    </motion.svg>
  )
}

/**
 * Golvende onderrand van het schuim, net over de bovenkant van het bier. Schuift de andere
 * kant op dan de bovenrand, zodat schuim en bier tegen elkaar in lijken te deinen.
 * Zelfde golfvorm, verticaal gespiegeld (matrix 1 0 0 -1).
 */
function SchuimOnderrand() {
  return (
    <motion.svg
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      className="absolute top-0 left-0 z-10 -mt-px h-5 w-[200%] sm:h-6"
      animate={{ x: ['-50%', '0%'] }}
      transition={{ duration: 2.6, ease: 'linear', repeat: Infinity }}
    >
      <g transform="matrix(1 0 0 -1 0 40)">
        <path d={`M0 40V22${GOLF}v18z`} fill="#f1dca3" />
      </g>
    </motion.svg>
  )
}

/**
 * Doorzichtig bier dat de site vult: het stijgt tot net onder
 * de navigatie, klotst even en loopt dan weer leeg. Je ziet de site er altijd doorheen.
 * - Wordt via een "portal" rechtstreeks in <body> getekend, zodat het over het hele scherm
 *   kan (binnen de logo-knop zou "fixed" niet werken door de animaties op die knop).
 * - pointer-events-none: je kunt er gewoon doorheen klikken.
 * - De ouder (LogoKnop) haalt het weer weg na DUUR seconden.
 */
export function BierVulling() {
  // Koolzuur: belletjes die in "rijtjes" opstijgen vanaf vaste punten (zoals in een echt glas),
  // plus een paar grotere losse belletjes. Eén keer willekeurig verdeeld (useMemo).
  const belletjes = useMemo(() => {
    const rijtjes = Array.from({ length: 12 }, () => willekeurig(4, 96)).flatMap((links) =>
      Array.from({ length: 5 }, (_, i) => ({
        links: links + willekeurig(-0.6, 0.6),
        grootte: willekeurig(2, 4),
        duur: willekeurig(1.4, 2),
        vertraging: i * 0.28 + willekeurig(0, 0.1),
      })),
    )
    const los = Array.from({ length: 10 }, () => ({
      links: willekeurig(3, 97),
      grootte: willekeurig(5, 9),
      duur: willekeurig(1.8, 2.6),
      vertraging: willekeurig(0, 1),
    }))
    return [...rijtjes, ...los]
  }, [])

  return createPortal(
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <motion.div
        className="absolute inset-x-0 bottom-0 h-full"
        initial={{ y: '105%' }}
        // vullen tot 14% van boven, klotsje, even vol blijven, weer leeglopen
        animate={{ y: ['105%', '14%', '17%', '15%', '15%', '110%'] }}
        transition={{ duration: DUUR, times: [0, 0.38, 0.46, 0.52, 0.68, 1], ease: 'easeInOut' }}
      >
        <Schuim />
        <SchuimOnderrand />

        {/* Het bier: goudgeel bovenaan, dieper amber onderaan */}
        <div className="relative h-full overflow-hidden bg-gradient-to-b from-[#f9cf55]/75 via-[#eeac2c]/78 to-[#c97a12]/85">
          {/* Diepte: randen iets donkerder, alsof je door een rond glas kijkt */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,transparent_45%,rgb(150_80_0/0.35))]" />
          {/* Lichtstrepen op het glas */}
          <div className="absolute inset-y-0 left-[9%] w-[7%] bg-gradient-to-r from-transparent via-white/25 to-transparent blur-sm" />
          <div className="absolute inset-y-0 left-[86%] w-[3%] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-[2px]" />

          {/* Koolzuurbelletjes */}
          {belletjes.map((b, i) => (
            <motion.span
              key={i}
              className="absolute bottom-0 rounded-full bg-white/70 shadow-[inset_-1px_-1px_1px_rgb(255_255_255/0.9)]"
              style={{ left: `${b.links}%`, width: b.grootte, height: b.grootte }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: '-85vh', opacity: [0, 0.9, 0.9, 0], x: [0, 2, -2, 0] }}
              transition={{ duration: b.duur, delay: b.vertraging, ease: 'easeIn', repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}

export const BIER_DUUR_MS = DUUR * 1000
