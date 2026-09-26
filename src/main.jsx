import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { inject } from '@vercel/analytics'
import App from './App.jsx'
import './index.css'

/*
 * Mesure d'audience. Le script est servi depuis /_vercel/insights/, sur
 * le même domaine : la CSP de vercel.json l'autorise déjà (script-src
 * 'self', connect-src 'self'). Ne pas l'élargir.
 *
 * Aucun cookie, aucun profil individuel — voir la page de
 * confidentialité.
 */
inject()

const racine = document.getElementById('root')

const page = (
  <StrictMode>
    <App />
  </StrictMode>
)

/*
 * Deux chemins, selon ce que le serveur a déjà envoyé.
 *
 * `dist/index.html` contient le HTML de la page, injecté au moment du
 * build par scripts/prerendre.mjs : on l'hydrate au lieu de le jeter.
 * C'est ce qui fait apparaître le texte avant que React ne soit chargé.
 *
 * En développement, `#root` est vide et il n'y a rien à hydrater.
 */
if (racine.firstChild) {
  hydrateRoot(racine, page)
} else {
  createRoot(racine).render(page)
}
