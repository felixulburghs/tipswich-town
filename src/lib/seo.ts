import { INSTAGRAM_URL } from '../components/InstagramKnop'
import { matchen, reeks, seizoen, seizoensStats } from './matchen'
import { berichtMet, berichten, nieuwsBestand } from './nieuws'
import { coach, naamDelen, spelerMet, spelers, statsVan, topschutters } from './spelers'

/**
 * Alles wat zoekmachines en deel-previews (WhatsApp, Instagram, ...) per pagina nodig hebben,
 * berekend uit de data. Gebruikt door:
 * - scripts/prerender.mjs: zet het in de voorgerenderde HTML en maakt sitemap.xml
 * - App.tsx (zetKop): werkt de <head> bij als je in de browser naar een andere pagina gaat
 */

export const SITE = 'https://www.tipswichtown.be'
const NAAM = 'Tipswich Town'
const DEEL_BEELD = `${SITE}/og.png` // 1200 × 630, gemaakt uit ons logo

export type PaginaInfo = {
  titel: string
  beschrijving: string
  url: string // canonieke URL
  beeld: string
  soort: 'website' | 'article' | 'profile'
  jsonLd?: object
}

/** Alle pagina's die voorgerenderd worden en in de sitemap komen (spelers en berichten uit de data). */
export function routes(): string[] {
  return [
    '/',
    '/kalender',
    '/spelers',
    ...spelers.map((s) => `/spelers/${s.nummer}`),
    '/nieuws',
    ...berichten.map((b) => `/nieuws/${b.slug}`),
  ]
}

/** Datum voor de sitemap (enkel voor berichten bekend). */
export const laatstGewijzigd = (pad: string) =>
  pad.startsWith('/nieuws/') ? berichtMet(pad.slice(8))?.datum : undefined

const kort = (tekst: string, max = 160) =>
  tekst.length <= max ? tekst : tekst.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
const meervoud = (n: number, een: string, meer: string) => `${n} ${n === 1 ? een : meer}`

/** Titel, beschrijving, ... voor één pad, of null als de pagina niet bestaat. */
export function paginaInfo(pad: string): PaginaInfo | null {
  const basis = { url: SITE + (pad === '/' ? '/' : pad), beeld: DEEL_BEELD, soort: 'website' as const }

  if (pad === '/')
    return {
      ...basis,
      titel: `${NAAM} – zaalvoetbal in Leuven`,
      beschrijving: `${NAAM} is een zaalvoetbalploeg uit Leuven in ${reeks}, seizoen ${seizoen}. Speelschema, uitslagen, spelers en nieuws. Zaalvoetbal met passie. UP THE TIPS!`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SportsTeam',
        name: NAAM,
        sport: 'Futsal',
        url: `${SITE}/`,
        logo: `${SITE}/logo.webp`,
        location: {
          '@type': 'Place',
          name: 'Leuven',
          address: { '@type': 'PostalAddress', addressLocality: 'Leuven', addressCountry: 'BE' },
        },
        sameAs: [INSTAGRAM_URL],
      },
    }

  if (pad === '/kalender') {
    const s = seizoensStats()
    return {
      ...basis,
      titel: `Speelschema ${seizoen} – ${NAAM}`,
      beschrijving: `Alle ${matchen.length} matchen van ${NAAM} in ${reeks}, seizoen ${seizoen}: ${s.gespeeld} gespeeld (${s.winst} gewonnen, ${s.gelijk} gelijk, ${s.verlies} verloren, ${s.voor}–${s.tegen} in doelpunten), met uitslagen, doelpuntenmakers en de komende matchen.`,
    }
  }

  if (pad === '/spelers') {
    const top = topschutters(1)[0]
    const topTekst = top
      ? ` Topschutter: ${naamDelen(top.speler).voornaam} ${naamDelen(top.speler).achternaam} met ${meervoud(top.goals, 'goal', 'goals')}.`
      : ''
    return {
      ...basis,
      titel: `Spelers – ${NAAM}`,
      beschrijving: `De kern van ${NAAM}: ${spelers.length} spelers en coach ${coach.naam}, met rugnummers, goals en assists per speler.${topTekst}`,
    }
  }

  if (pad.startsWith('/spelers/')) {
    const speler = spelerMet(Number(pad.slice(9)))
    if (!speler) return null
    const { voornaam, achternaam } = naamDelen(speler)
    const st = statsVan(speler.nummer)
    const naam = `${voornaam} ${achternaam}`.trim()
    return {
      ...basis,
      soort: 'profile',
      beeld: speler.foto ? `${SITE}/spelers/${speler.foto}` : DEEL_BEELD,
      titel: `${naam} #${speler.nummer} – ${NAAM}`,
      beschrijving: `${naam} draagt rugnummer ${speler.nummer} bij ${NAAM}${speler.positie ? `, ${speler.positie.toLowerCase()}` : ''}. Seizoen ${seizoen}: ${meervoud(st.goals, 'goal', 'goals')} en ${meervoud(st.assists, 'assist', 'assists')} in ${meervoud(st.matchen, 'match', 'matchen')}.`,
    }
  }

  if (pad === '/nieuws') {
    const laatste = berichten[0]
    return {
      ...basis,
      titel: `Nieuws – ${NAAM}`,
      beschrijving: `Het laatste nieuws over ${NAAM} en de spelers${laatste ? `. Meest recent: ${laatste.titel}.` : '.'}`,
    }
  }

  if (pad.startsWith('/nieuws/')) {
    const b = berichtMet(pad.slice(8))
    if (!b) return null
    const beeld = b.afbeelding ? SITE + nieuwsBestand(b.afbeelding) : DEEL_BEELD
    // Deel-previews (WhatsApp, ...) tonen niet overal WebP: daar enkel JPG/PNG, anders ons deelbeeld.
    // Google (JSON-LD hieronder) kan wel met WebP overweg.
    const deelBeeld = /\.(jpe?g|png)$/i.test(beeld) ? beeld : DEEL_BEELD
    return {
      ...basis,
      soort: 'article',
      beeld: deelBeeld,
      titel: `${b.titel} – ${NAAM}`,
      beschrijving: kort(b.intro),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: b.titel,
        description: b.intro,
        datePublished: b.datum,
        dateModified: b.datum,
        image: [beeld],
        inLanguage: 'nl-BE',
        mainEntityOfPage: basis.url,
        author: { '@type': 'Organization', name: NAAM, url: `${SITE}/` },
        publisher: { '@type': 'Organization', name: NAAM, logo: { '@type': 'ImageObject', url: `${SITE}/logo.webp` } },
      },
    }
  }

  return null
}

/** De tags voor in de <head>: beschrijving, canonieke URL, Open Graph, Twitter en JSON-LD. */
export function kopTags(info: PaginaInfo): { naam: string; waarde: string; sleutel: 'name' | 'property' }[] {
  return [
    { sleutel: 'property', naam: 'og:type', waarde: info.soort },
    { sleutel: 'property', naam: 'og:site_name', waarde: NAAM },
    { sleutel: 'property', naam: 'og:locale', waarde: 'nl_BE' },
    { sleutel: 'property', naam: 'og:title', waarde: info.titel },
    { sleutel: 'property', naam: 'og:description', waarde: info.beschrijving },
    { sleutel: 'property', naam: 'og:url', waarde: info.url },
    { sleutel: 'property', naam: 'og:image', waarde: info.beeld },
    { sleutel: 'name', naam: 'twitter:card', waarde: 'summary_large_image' },
    { sleutel: 'name', naam: 'twitter:title', waarde: info.titel },
    { sleutel: 'name', naam: 'twitter:description', waarde: info.beschrijving },
    { sleutel: 'name', naam: 'twitter:image', waarde: info.beeld },
  ]
}

/** In de browser: de <head> bijwerken na een paginawissel (dezelfde gegevens als in de voorgerenderde HTML). */
export function zetKop(pad: string) {
  const info = paginaInfo(pad)
  if (!info) return
  document.title = info.titel
  const meta = (sleutel: string, naam: string, waarde: string) => {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${sleutel}="${naam}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(sleutel, naam)
      document.head.append(el)
    }
    el.content = waarde
  }
  meta('name', 'description', info.beschrijving)
  for (const t of kopTags(info)) meta(t.sleutel, t.naam, t.waarde)
  let canon = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canon) {
    canon = document.createElement('link')
    canon.rel = 'canonical'
    document.head.append(canon)
  }
  canon.href = info.url
  document.getElementById('json-ld')?.remove()
  if (info.jsonLd) {
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.id = 'json-ld'
    s.textContent = JSON.stringify(info.jsonLd)
    document.head.append(s)
  }
}
