import type { CSSProperties } from 'react'
import { SPONSOR_TAKEOVER } from '../config'
import { SPONSORS, type Sponsor, type Tier } from '../data/sponsors'

/**
 * Sponsorblok op elke pagina, net boven de footer, op de achtergrond van de pagina: één rij per niveau. Per rij een oppervlakte (px², gsm en vanaf sm): elk logo krijgt de hoogte
 * waarbij het die oppervlakte heeft, zodat een breed woordlogo en een hoog beeldmerk optisch even groot zijn.
 */
const RIJEN: { tier: Tier; label: string; opp: [number, number] }[] = [
  { tier: 'hoofdsponsor', label: 'Hoofdsponsor', opp: [16200, 29800] }, // Tout Bien ± 56 / 76 px hoog
  { tier: 'powered-by', label: 'Powered by', opp: [6300, 9600] }, // Pitchdrive ± 34 / 42 px
]

// Achtergrond: crème tijdens de takeover, anders navy (vast bij het bouwen, dus gelijk aan de voorgerenderde HTML)
const DONKER = !SPONSOR_TAKEOVER

function Logo({ s, opp }: { s: Sponsor; opp: [number, number] }) {
  const hoogte = (o: number) => `${Math.round(Math.sqrt((o * s.height) / s.width))}px`
  const plaatje = DONKER && !s.logoLight // geen lichte versie: op een crème plaatje (rood op navy is te weinig contrast)
  const img = (
    <img
      src={DONKER ? (s.logoLight ?? s.logo) : s.logo}
      alt={s.name}
      width={s.width}
      height={s.height}
      loading="lazy"
      style={{ '--h': hoogte(opp[0]), '--h-sm': hoogte(opp[1]) } as CSSProperties}
      // object-contain: nooit uitgerekt, ook niet als max-w-full ingrijpt
      className={`block h-(--h) w-auto max-w-full object-contain sm:h-(--h-sm) ${plaatje ? 'box-content rounded-md bg-[#fff9f2] px-3 py-2' : ''}`}
    />
  )
  if (!s.url) return img
  return (
    <a
      href={s.url}
      target="_blank"
      rel={s.sponsored ? 'noopener sponsored' : 'noopener'}
      className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400"
    >
      {img}
    </a>
  )
}

export function SponsorBlok() {
  return (
    // toutbien:pb: ruimte voor de Pils-blikjes die tijdens de takeover op de rand van de footer blijven liggen
    <section data-sponsorblok aria-label="Sponsors" className="px-4 pt-16 pb-12 text-center toutbien:pb-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10">
        {RIJEN.map(({ tier, label, opp }) => (
          <div key={tier} className="flex flex-col items-center gap-4">
            <p className="font-sans text-xs font-semibold tracking-[0.25em] text-tekst-zacht uppercase">{label}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
              {SPONSORS.filter((s) => s.tier === tier).map((s) => (
                <Logo key={s.name} s={s} opp={opp} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
