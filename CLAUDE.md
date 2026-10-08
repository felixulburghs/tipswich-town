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
