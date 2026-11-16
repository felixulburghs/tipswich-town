import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { SPONSOR_TAKEOVER } from './config'

// Vóór de eerste render, zodat je nooit even het gewone thema ziet flitsen
if (SPONSOR_TAKEOVER) {
  document.documentElement.dataset.theme = 'toutbien'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#d61022')
  // Archivo alleen laden als het thema aan staat (italic, breedte 100–125%, gewicht 800–900)
  const font = document.createElement('link')
  font.rel = 'stylesheet'
  font.href = 'https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@1,100..125,800..900&display=swap'
  document.head.append(font)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
