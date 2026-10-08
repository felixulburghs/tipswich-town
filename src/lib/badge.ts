// Tegenstanders hebben geen logo: we maken een badge met initialen en een vaste kleur per naam.

const VULWOORDEN = new Set(['fc', 'zvc', 'de', 'en'])

/** "FC Boeziness" → "BO", "Tranquilos en Casa FC" → "TC", "Caradona '86" → "CA" */
export function initialen(naam: string): string {
  const woorden = naam
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}]/gu, '')) // enkel letters (weg met '86, ', ...)
    .filter((w) => w && !VULWOORDEN.has(w.toLowerCase()))
  if (woorden.length === 0) return naam.replace(/[^\p{L}]/gu, '').slice(0, 2).toUpperCase()
  if (woorden.length === 1) return woorden[0].slice(0, 2).toUpperCase()
  return (woorden[0][0] + woorden[1][0]).toUpperCase()
}

/**
 * Zelfde naam → altijd zelfde kleur. We maken van de letters een getal (hash)
 * en gebruiken dat als tint (0–360°) op het kleurenwiel. Saturatie en lichtheid
 * liggen vast, zodat witte tekst er altijd goed op leesbaar is.
 */
export function kleurVanNaam(naam: string): string {
  let hash = 0
  for (const teken of naam) hash = (hash * 31 + teken.charCodeAt(0)) >>> 0
  return `hsl(${hash % 360} 55% 36%)`
}
