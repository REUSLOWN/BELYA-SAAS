import { renderToString } from 'react-dom/server'
import App from './App.jsx'

/*
 * Entrée de rendu côté serveur, utilisée **uniquement au moment du
 * build** par scripts/prerendre.mjs. Il n'y a pas de serveur Node en
 * production : le site reste un fichier statique.
 *
 * Ce que cela change. Sans pré-rendu, `dist/index.html` ne contient
 * qu'un `<div id="root">` vide : sur une connexion 3G à Abidjan, le
 * premier texte n'apparaît qu'après le téléchargement et l'exécution de
 * 130 Ko de JavaScript compressé. Avec, le texte est déjà dans le HTML
 * et s'affiche au premier paquet ; React vient ensuite l'hydrater.
 *
 * Aucun `window`, aucun `document` n'est touché pendant ce rendu — les
 * composants les lisent tous dans un `useEffect`, qui ne s'exécute pas
 * côté serveur.
 */
export function rendre() {
  return renderToString(<App />)
}
