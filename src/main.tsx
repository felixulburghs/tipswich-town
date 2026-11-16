import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
// Het Tout Bien-thema (data-theme, lettertype) zet vite.config.ts al in de HTML, zie SPONSOR_TAKEOVER in config.ts

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
