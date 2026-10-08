import { Link } from 'react-router-dom'
import { nieuwsDatum } from '../../lib/nieuws'
import type { Nieuwsbericht } from '../../types'
import { NieuwsVideo } from './NieuwsVideo'
import { SpelerChip } from './SpelerChip'

/** Bericht in de nieuwslijst: datum, titel, intro, video (indien aanwezig) en over wie het gaat. Kaart is klikbaar, behalve de video. */
export function NieuwsKaart({ bericht }: { bericht: Nieuwsbericht }) {
  return (
    <article className="relative rounded-2xl bg-navy-900/80 p-5 ring-1 ring-white/10 transition hover:bg-navy-900 hover:ring-white/25">
      <div className="flex items-center gap-3 text-xs text-white/60">
        <time dateTime={bericht.datum}>{nieuwsDatum(bericht)}</time>
        {bericht.video && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 font-semibold text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-3">
              <path d="M8 5v14l11-7z" />
            </svg>
            Video
          </span>
        )}
      </div>
      <h2 className="mt-2 font-display text-2xl leading-tight uppercase sm:text-3xl">
        {/* De link spant via after:absolute over de hele kaart, zodat je overal kunt klikken */}
        <Link to={`/nieuws/${bericht.slug}`} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-orange-400">
          {bericht.titel}
        </Link>
      </h2>
      <p className="mt-2 text-white/80">{bericht.intro}</p>
      {/* Video meteen in de kaart. relative z-10 legt hem boven de onzichtbare link-laag,
          zodat play/volume/fullscreen werken in plaats van naar het bericht te springen. */}
      {bericht.video && (
        <div className="relative z-10 mt-4">
          <NieuwsVideo bestand={bericht.video} titel={bericht.titel} />
        </div>
      )}
      {bericht.spelers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {bericht.spelers.map((n) => (
            <SpelerChip key={n} nummer={n} klikbaar={false} />
          ))}
        </div>
      )}
    </article>
  )
}
