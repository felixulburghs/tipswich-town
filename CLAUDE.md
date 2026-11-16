# Tipswich Town – clubsite

Website voor Tipswich Town, een zaalvoetbalploeg uit Leuven (Reeks 2A Leuven, seizoen 2026/27).
Instagram: @tipswich_town. Slogans: "Just the tip", "UP THE TIPS!", "Zaalvoetbal met passie".

## Doel
- Matchkalender met komende match (countdown) en gespeelde matchen met uitslag + doelpuntenmakers
- Spelersoverzicht als FIFA-achtige kaarten (rugnummer, naam, positie, foto) die omdraaien
- Stand topschutters/assists, automatisch berekend uit `data/matchen.json`
- Leuk en geanimeerd, maar snel en goed op gsm (de meeste bezoekers komen via Instagram)

## Stack
- Vite + React + TypeScript, Tailwind CSS, Framer Motion voor animaties
- Geen backend: alle data staat in `data/matchen.json`, `data/spelers.json` en `data/nieuws.json`
- Nieuws: berichten in `data/nieuws.json`, video's en foto's in `public/media/` (niet `public/nieuws/`, dat botst met de route `/nieuws`)
- Foto's in `public/spelers/<achternaam>.jpg`, logo in `public/logo.webp` (transparant), favicon in `public/favicon.png`, iPhone-icoon in `public/apple-touch-icon.png`
- Hosting: Vercel of Netlify, gekoppeld aan GitHub

## Sponsor-takeover (Tout Bien)
- Eén schakelaar: `SPONSOR_TAKEOVER` in `src/config.ts`. Daar staan ook `SPONSOR` (url, logo), `RESPONSIBLE_LINE` en `SPONSOR_KOP`.
- `vite.config.ts` zet bij het bouwen `data-theme="toutbien"` en het lettertype Archivo in `index.html`; de kleuren staan in `src/index.css` onder `[data-theme='toutbien']`. Klassen die enkel in het thema gelden: `toutbien:...`.
- Sponsorbestanden in `public/sponsors/` (enkel van Felix, nooit van hun site halen). De `.webp`-blikjes zijn verkleinde kopieën van de `.png`'s; maak ze opnieuw als die PNG's veranderen.
- De sponsorstrook in de footer blijft staan als de takeover uit is.

## SEO en voorrenderen
- `npm run build` rendert elke pagina voor naar echte HTML (`scripts/prerender.mjs` + `src/entry-server.tsx`); de browser neemt die over met `hydrateRoot`. Geen Next.js.
- Titel, beschrijving, canonieke URL, Open Graph/Twitter en JSON-LD per pagina komen uit `src/lib/seo.ts`; daar staat ook de lijst pagina's voor `sitemap.xml`. Nieuwe spelers of berichten komen er vanzelf in.
- Render nooit iets dat van de tijd, `window` of "minder beweging" afhangt: dan wijkt de browser af van de voorgerenderde HTML. Tijd: `useNu()` uit `src/lib/nu.ts`.
- De `google-site-verification`-tag in `index.html` moet altijd in elke pagina blijven staan.
- Inline scripts en CSP: er is precies één inline script, het blikjesregen-script in `<head>` (gezet door `vite.config.ts`, enkel met de takeover aan). Hou het klein en statisch: geen waarden die per build veranderen (de buildtijd staat daarom als `data-bouwtijd` op `<html>`, niet in een script). Bij de Content-Security-Policy dit script toelaten via zijn hash, **nooit** met `'unsafe-inline'`: `script-src 'self' 'sha256-S4hkLmKjV1HBZBo7qXGb3kOx6ilDjXu6aBjuW9gI9Ok=' https://cloud.umami.is`. Verander je het script, bereken de hash opnieuw (sha256 van de tekst tussen `<script>` en `</script>`, base64) en pas de CSP aan.

## Huisstijl (uit Instagram)
| Token        | Hex       | Gebruik                                   |
|--------------|-----------|-------------------------------------------|
| navy-950     | `#080838` | achtergrond (donkerste)                   |
| navy-900     | `#081858` | achtergrond, kaarten                      |
| royal-700    | `#082888` | panelen, gradients                        |
| royal-500    | `#0848B8` | thuisshirt-blauw, highlights              |
| red-600      | `#D70719` | accent: titelbalken, knoppen, "thuis"     |
| orange-400   | `#F19029` | mascotte, kleine accenten                 |
| white        | `#F8F8F8` | tekst                                     |

Sfeer: donkere sportzaal, blauw licht, rode "geschilderde" penseelstreken achter titels,
vette condensed sans-serif in hoofdletters (bv. Anton, Bebas Neue of Oswald), kroontje als detail.

## Werkafspraken
- Ik (Felix) wil de code begrijpen: leg na elke nieuwe component kort uit wat hij doet en waarom.
- Werk in kleine stappen; gebruik plan mode voor grotere features.
- Hardcode geen spelers of matchen in componenten, lees altijd uit de JSON-bestanden.
- Thuis/uit tonen met een icoon (huis = thuis in GBS De Stip Linden, vliegtuig = uit), zoals op het speelschema.
