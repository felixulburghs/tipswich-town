import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const root = document.getElementById('root')!
const site = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Voorgerenderde pagina (de HTML staat er al, zie scripts/prerender.mjs): React neemt die over.
// Lege pagina (bv. een onbekend adres, of `npm run dev`): React bouwt alles zelf op, zoals vroeger.
if (root.hasChildNodes()) hydrateRoot(root, site)
else createRoot(root).render(site)
