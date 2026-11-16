import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { Site } from './App'

/**
 * Enkel voor het bouwen (scripts/prerender.mjs): rendert één pagina naar HTML,
 * zonder browser. In de browser neemt main.tsx die HTML over (hydrateRoot).
 */
export function render(pad: string) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={pad}>
        <Site />
      </StaticRouter>
    </StrictMode>,
  )
}

export { kopTags, laatstGewijzigd, paginaInfo, routes, SITE } from './lib/seo'
