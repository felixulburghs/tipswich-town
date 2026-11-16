// Voorrenderen (stap 3 van `npm run build`, na de gewone build en de server-build):
// - elke pagina als echte HTML met inhoud, zodat Google en deel-previews alles zien zonder JavaScript
// - per pagina de juiste <title>, beschrijving, canonieke URL, Open Graph/Twitter en JSON-LD (src/lib/seo.ts)
// - sitemap.xml en robots.txt, uit dezelfde lijst pagina's
// - spa.html: de lege schil, voor adressen die niet voorgerenderd zijn (vercel.json, _redirects)
// In de browser neemt React de HTML over (hydrateRoot in src/main.tsx): de site werkt verder zoals altijd.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

// Data en datums zoals een bezoeker in België ze ziet (de build-server draait in UTC)
process.env.TZ = 'Europe/Brussels'
// Iedereen (deze build én het hydrateren in de browser) rekent eerst met dit tijdstip, zie src/lib/nu.ts
const bouwtijd = Date.now()
globalThis.__BOUWTIJD__ = bouwtijd

const DIST = 'dist'
const server = await import(pathToFileURL(join('dist-server', 'entry-server.js')).href)
const { render, paginaInfo, kopTags, routes, laatstGewijzigd, SITE } = server

const sjabloon = readFileSync(join(DIST, 'index.html'), 'utf8')
const VERIFICATIE = '<meta name="google-site-verification"'
if (!sjabloon.includes(VERIFICATIE)) throw new Error('index.html mist de google-site-verification tag')
if (!sjabloon.includes('<div id="root"></div>')) throw new Error('index.html: <div id="root"></div> niet gevonden')

const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

writeFileSync(join(DIST, 'spa.html'), sjabloon)

for (const pad of routes()) {
  const info = paginaInfo(pad)
  if (!info) throw new Error(`Geen pagina-info voor ${pad}`)
  const inhoud = render(pad)
  const kop = [
    `<link rel="canonical" href="${attr(info.url)}" />`,
    ...kopTags(info).map((t) => `<meta ${t.sleutel}="${t.naam}" content="${attr(t.waarde)}" />`),
    info.jsonLd
      ? `<script type="application/ld+json" id="json-ld">${JSON.stringify(info.jsonLd).replace(/</g, '\\u003c')}</script>`
      : '',
    `<script>window.__BOUWTIJD__=${bouwtijd}</script>`,
  ]
    .filter(Boolean)
    .map((r) => `    ${r}\n`)
    .join('')

  const html = sjabloon
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${attr(info.titel)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${attr(info.beschrijving)}" />`,
    )
    .replace('</head>', `${kop}  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${inhoud}</div>`)

  // Controles: niets mag stil mislukken
  for (const moet of [`<title>${attr(info.titel)}</title>`, `content="${attr(info.beschrijving)}"`, VERIFICATIE])
    if (!html.includes(moet)) throw new Error(`${pad}: "${moet}" ontbreekt`)
  if (inhoud.length < 500) throw new Error(`${pad}: verdacht weinig inhoud (${inhoud.length} tekens)`)

  // "/" → index.html, "/spelers/10" → spelers/10.html (Vercel: cleanUrls, Netlify: vanzelf)
  const bestand = join(DIST, pad === '/' ? 'index.html' : `${pad.slice(1)}.html`)
  mkdirSync(dirname(bestand), { recursive: true })
  writeFileSync(bestand, html)
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes()
  .map((pad) => {
    const datum = laatstGewijzigd(pad)
    return `  <url><loc>${SITE}${pad === '/' ? '/' : pad}</loc>${datum ? `<lastmod>${datum}</lastmod>` : ''}</url>`
  })
  .join('\n')}
</urlset>
`
writeFileSync(join(DIST, 'sitemap.xml'), sitemap)
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)

rmSync('dist-server', { recursive: true, force: true })
console.log(`voorgerenderd: ${routes().length} pagina's, sitemap.xml, robots.txt, spa.html`)
