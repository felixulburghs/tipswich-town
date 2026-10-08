import { useState } from 'react'
import { nieuwsBestand } from '../../lib/nieuws'

/**
 * Video bij een nieuwsbericht.
 * - preload="metadata": de browser haalt enkel de lengte en het eerste beeld op; de video zelf
 *   laadt pas als je op play drukt. Spaart data op gsm.
 * - playsInline: op iPhone speelt hij in de pagina af in plaats van meteen fullscreen.
 * - Staat het bestand (nog) niet in public/media/, dan geeft de browser een fout (onError)
 *   en tonen we een nette melding in plaats van een kapotte speler.
 */
export function NieuwsVideo({ bestand, titel }: { bestand: string; titel: string }) {
  const [kapot, setKapot] = useState(false)

  if (kapot) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-xl bg-navy-900/80 text-center ring-1 ring-white/10">
        <p className="px-4 text-white/60">Video komt eraan</p>
      </div>
    )
  }

  return (
    <video
      src={nieuwsBestand(bestand)}
      controls
      playsInline
      preload="metadata"
      aria-label={`Video: ${titel}`}
      onError={() => setKapot(true)}
      className="aspect-video w-full rounded-xl bg-black ring-1 ring-white/10"
    />
  )
}
