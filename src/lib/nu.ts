import { useEffect, useState } from 'react'

declare global {
  // Tijdstip van de build, in de HTML gezet door scripts/prerender.mjs
  var __BOUWTIJD__: number | undefined
}

/**
 * "Nu", veilig voor voorgerenderde HTML.
 * De HTML wordt bij de build gemaakt; de browser neemt die over (hydrateren) en moet daarbij exact
 * hetzelfde renderen, anders gooit React de HTML weg. Daarom rekenen we eerst met het tijdstip van de
 * build (__BOUWTIJD__) en schakelen we na het eerste beeld over op de echte tijd.
 * - echt: false zolang we nog met de buildtijd rekenen
 * - elkeSeconde: elke seconde bijwerken (countdown)
 */
export function useNu(elkeSeconde = false) {
  const [nu, setNu] = useState(() => ({ tijd: new Date(globalThis.__BOUWTIJD__ ?? Date.now()), echt: false }))
  useEffect(() => {
    setNu({ tijd: new Date(), echt: true })
    if (!elkeSeconde) return
    const id = setInterval(() => setNu({ tijd: new Date(), echt: true }), 1000)
    return () => clearInterval(id)
  }, [elkeSeconde])
  return nu
}
