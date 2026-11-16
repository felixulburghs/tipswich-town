import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const DUUR_MS = 2300 // vallen, even blijven liggen (vloer weg na 1,3 s), uit beeld vallen

/**
 * Korte blikjesbui over het hele scherm, als slot van het logo-bier tijdens de takeover.
 * Dezelfde natuurkunde als de grote blikjesregen (src/lib/blikjes.ts), maar kort en zonder interactie:
 * je kunt er gewoon doorheen klikken. Roept klaar() op als hij voorbij is.
 */
export function BlikjesBui({ klaar }: { klaar: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let stop = () => {}
    let gestopt = false
    import('../lib/blikjes').then(async ({ startBlikjes }) => {
      if (gestopt || !canvas.current) return
      const r = await startBlikjes({
        canvas: canvas.current,
        rougeKans: 0.25,
        aantal: canvas.current.clientWidth < 640 ? 6 : 10,
        interactief: false,
        bui: { vloerWegNa: 1300 },
      })
      if (gestopt) r.stop()
      else stop = r.stop
    })
    const timer = setTimeout(klaar, DUUR_MS)
    return () => {
      gestopt = true
      clearTimeout(timer)
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- één keer per bui
  }, [])

  return createPortal(
    <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 h-full w-full" />,
    document.body,
  )
}
