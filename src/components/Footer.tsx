import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { RESPONSIBLE_LINE, SPONSOR_TAKEOVER } from '../config'
import { INSTAGRAM_URL } from './InstagramKnop'
import { SponsorBlok } from './SponsorBlok'

/**
 * Footer op elke pagina, in navy (bg-marine, in beide thema's), met daarboven het sponsorblok
 * (SponsorBlok, alle sponsors uit src/data/sponsors.ts): blijft altijd staan, ook als de takeover uit is.
 * - RESPONSIBLE_LINE (config.ts): de verantwoord-drinken-zin van de sponsor.
 * - Tijdens de takeover tuimelen er een paar Pils-blikjes op de rand van de footer als je onderaan komt.
 */
export function Footer() {
  return (
    <>
      <SponsorBlok />
      <footer className="relative bg-marine px-4 pt-10 pb-8 text-sm text-tekst">
        {SPONSOR_TAKEOVER && <FooterBlikjes />}
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-tekst-zacht sm:text-left">
            Tipswich Town, zaalvoetbal in Leuven.{' '}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-tekst"
            >
              Volg ons op Instagram: @tipswich_town
            </a>
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-5xl text-center text-xs text-tekst-zacht sm:text-left">{RESPONSIBLE_LINE}</p>
      </footer>
    </>
  )
}

/**
 * Een handvol Pils-blikjes die op de bovenrand van de footer vallen, zodra die in beeld komt.
 * Het canvas staat net boven de footer; de "vloer" van de natuurkunde is de rand van de footer.
 */
function FooterBlikjes() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const minderBeweging = useReducedMotion() ?? false

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    let stop = () => {}
    let gestopt = false
    const kijker = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        kijker.disconnect()
        import('../lib/blikjes').then(async ({ startBlikjes }) => {
          if (gestopt) return
          const gsm = el.clientWidth < 640
          const r = await startBlikjes({
            canvas: el,
            rougeKans: 0,
            aantal: gsm ? 4 : 7,
            breedte: gsm ? 34 : 44,
            vloerMarge: 0,
            interactief: false,
            stil: minderBeweging,
            bui: {}, // geen vloerWegNa: ze blijven liggen
          })
          if (gestopt) r.stop()
          else stop = r.stop
        })
      },
      { threshold: 0.5 },
    )
    kijker.observe(el.parentElement!)
    return () => {
      gestopt = true
      kijker.disconnect()
      stop()
    }
  }, [minderBeweging])

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-full h-40 w-full"
    />
  )
}
