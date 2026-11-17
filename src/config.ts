/**
 * Sponsor-takeover: zet op true en de hele site krijgt het Tout Bien-thema
 * (data-theme="toutbien" op <html>, zie index.css). Op false = de gewone site.
 * Het sponsorblok boven de footer (src/data/sponsors.ts) blijft altijd staan, ook met de takeover uit.
 */
export const SPONSOR_TAKEOVER = true

/** sessionStorage-sleutel: de blikjesregen speelt één keer per sessie (ook gelezen door het script in vite.config.ts). */
export const REGEN_SLEUTEL = 'toutbien-drop-gezien'

export const SPONSOR = {
  naam: 'Tout Bien',
  url: 'https://toutbienpils.com',
  logo: '/sponsors/tout-bien-logo.png', // het echte logo (800 × 155); logo.svg was de tijdelijke versie
}

/** Verantwoord-drinken-zin onderaan elke pagina. Plak hier de exacte tekst die de sponsor wil. */
export const RESPONSIBLE_LINE = 'Geniet van bier, drink met mate.'

/**
 * Titel naast het logo bovenaan de homepagina tijdens de takeover. Drie opties:
 * 1. 'Het meest gemiddelde bier ter wereld, nu op onze borst.'
 * 2. 'Gemiddeld bier voor een gemiddelde ploeg. Perfecte match.'
 * 3. 'Eindelijk een sponsor die ons niveau begrijpt.'
 */
export const SPONSOR_KOP = 'Het meest gemiddelde bier ter wereld, nu op onze borst.'
