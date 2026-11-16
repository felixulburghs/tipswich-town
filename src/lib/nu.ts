import { useEffect, useState } from 'react'

declare global {
  // Tijdstip van de build tijdens het voorrenderen (scripts/prerender.mjs)
  var __BOUWTIJD__: number | undefined
}

/** Tijdstip van de build: bij het voorrenderen uit __BOUWTIJD__, in de browser uit <html data-bouwtijd>. */
const bouwtijd = () =>
  globalThis.__BOUWTIJD__ ?? (typeof document === 'undefined' ? 0 : Number(document.documentElement.dataset.bouwtijd))

/**
 * "Nu", veilig voor voorgerenderde HTML.
 * De HTML wordt bij de build gemaakt; de browser neemt die over (hydrateren) en moet daarbij exact
 * hetzelfde renderen, anders gooit React de HTML weg. Daarom rekenen we eerst met het tijdstip van de
 * build en schakelen we na het eerste beeld over op de echte tijd.
 * - echt: false zolang we nog met de buildtijd rekenen
 * - elkeSeconde: elke seconde bijwerken (countdown)
 */
export function useNu(elkeSeconde = false) {
  const [nu, setNu] = useState(() => ({ tijd: new Date(bouwtijd() || Date.now()), echt: false }))
  useEffect(() => {
    setNu({ tijd: new Date(), echt: true })
    if (!elkeSeconde) return
    const id = setInterval(() => setNu({ tijd: new Date(), echt: true }), 1000)
    return () => clearInterval(id)
  }, [elkeSeconde])
  return nu
}
