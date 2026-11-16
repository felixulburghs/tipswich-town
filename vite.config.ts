import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { REGEN_SLEUTEL, SPONSOR_TAKEOVER } from './src/config'

/**
 * Tout Bien-takeover al in de HTML zetten (bij het bouwen), niet pas als de JavaScript draait:
 * zo begint het lettertype Archivo meteen te laden en is het thema er vanaf de eerste pixel.
 * Leest dezelfde vlag als de rest van de site (src/config.ts), dus het blijft één schakelaar.
 */
const takeoverInHtml = {
  name: 'tout-bien-takeover',
  transformIndexHtml(html: string) {
    if (!SPONSOR_TAKEOVER) return html
    // Komt de blikjesregen? Beslist vóór de eerste pixel (enkel bij binnenkomen op home, één keer per sessie).
    // Zonder opslag (privévenster) speelt hij gewoon. Nooit voor zoekmachines en testtools: Googlebot voert
    // JavaScript uit met een lege sessionStorage en zou anders de homepagina onder het rode scherm zien.
    // App.tsx en index.css lezen data-regen.
    // CSP: dit is het enige inline script. Klein en statisch houden (REGEN_SLEUTEL is een vaste tekst):
    // de Content-Security-Policy laat het toe via zijn sha256-hash, zie CLAUDE.md.
    const regen = `<script>(function(){var h=location.pathname==='/';if(!h||/bot|crawl|spider|slurp|lighthouse|inspectiontool/i.test(navigator.userAgent))return;try{if(sessionStorage.getItem(${JSON.stringify(REGEN_SLEUTEL)})==='1')return}catch(e){}document.documentElement.dataset.regen='1'})()</script>`
    const uit = html
      .replace('<html lang="nl">', '<html lang="nl" data-theme="toutbien">')
      .replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />
    ${regen}`,
      )
      .replace('<meta name="theme-color" content="#080838" />', '<meta name="theme-color" content="#d61022" />')
      .replace(
        'family=Anton&',
        // Archivo italic, breedte 62–125%, enkel gewicht 900 (39 KB i.p.v. 99 KB voor 800–900).
        // Anton valt weg: in het thema gebruikt alles met font-display Archivo.
        'family=Archivo:ital,wdth,wght@1,62..125,900&',
      )
    // Luid falen als index.html zo veranderd is dat een vervanging niet meer past
    for (const stuk of ['data-theme="toutbien"', 'content="#d61022"', 'family=Archivo', 'dataset.regen'])
      if (!uit.includes(stuk)) throw new Error(`tout-bien-takeover: "${stuk}" niet in index.html gezet`)
    return uit
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), takeoverInHtml],
})
