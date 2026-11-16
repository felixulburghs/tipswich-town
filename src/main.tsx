import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { SPONSOR_TAKEOVER } from './config'

// Vóór de eerste render, zodat je nooit even het gewone thema ziet flitsen
if (SPONSOR_TAKEOVER) document.documentElement.dataset.theme = 'toutbien'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
