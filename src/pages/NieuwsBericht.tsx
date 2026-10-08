import { Link, useParams } from 'react-router-dom'
import { NieuwsVideo } from '../components/nieuws/NieuwsVideo'
import { SpelerChip } from '../components/nieuws/SpelerChip'
import { berichtMet, nieuwsBestand, nieuwsDatum } from '../lib/nieuws'

function TerugLink() {
  return (
    <Link to="/nieuws" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="size-4">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      Al het nieuws
    </Link>
  )
}

/** Eén nieuwsbericht: titel, datum, video of foto, tekst en betrokken spelers. */
export function NieuwsBericht() {
  const slug = useParams().slug ?? ''
  const bericht = berichtMet(slug)

  if (!bericht) {
    return (
      <main className="grid min-h-svh place-items-center bg-navy-950 px-4 text-center">
        <div>
          <p className="font-display text-4xl uppercase">Bericht niet gevonden</p>
          <p className="mt-2 text-white/60">Misschien is de link veranderd.</p>
          <div className="mt-4">
            <TerugLink />
          </div>
        </div>
      </main>
    )
  }

  // De video komt na de eerste alinea, zodat je eerst weet waarover het gaat
  const [eerste, ...rest] = bericht.tekst

  return (
    <main
      className="min-h-svh bg-navy-950 px-4 pt-24 pb-16 sm:pt-28"
      style={{ backgroundImage: 'radial-gradient(ellipse 70% 30% at 50% 0%, rgb(8 72 184 / 0.45), transparent 70%)' }}
    >
      <article className="mx-auto max-w-2xl">
        <TerugLink />
        <time dateTime={bericht.datum} className="mt-6 block text-sm text-white/60">
          {nieuwsDatum(bericht)}
        </time>
        <h1 className="mt-2 font-display text-4xl leading-none text-balance uppercase sm:text-6xl">{bericht.titel}</h1>

        {bericht.spelers.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {bericht.spelers.map((n) => (
              <SpelerChip key={n} nummer={n} />
            ))}
          </div>
        )}

        <div className="mt-8 space-y-5 text-lg leading-relaxed text-white/85">
          {eerste && <p>{eerste}</p>}

          {bericht.video && <NieuwsVideo bestand={bericht.video} titel={bericht.titel} />}
          {!bericht.video && bericht.afbeelding && (
            <img
              src={nieuwsBestand(bericht.afbeelding)}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full rounded-xl ring-1 ring-white/10"
            />
          )}

          {rest.map((alinea, i) => (
            <p key={i}>{alinea}</p>
          ))}
        </div>
      </article>
    </main>
  )
}
