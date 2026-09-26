/*
 * Pré-rendu au moment du build.
 *
 *   vite build                              → dist/       (le site)
 *   vite build --ssr src/entree-serveur.jsx → dist-ssr/   (le rendu)
 *   node scripts/prerendre.mjs              → injecte l'un dans l'autre
 *
 * Le résultat reste un site statique : il n'y a pas de serveur Node en
 * production. On remplit simplement le `<div id="root">` de
 * `dist/index.html` avec le HTML que React aurait produit, pour que le
 * texte s'affiche sans attendre le JavaScript.
 *
 * Le script échoue bruyamment si quelque chose manque. Un pré-rendu qui
 * échoue en silence rend un site qui marche — mais lentement, et
 * personne ne s'en aperçoit avant la prochaine mesure.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PAGE = resolve(RACINE, 'dist/index.html')
const RENDU = resolve(RACINE, 'dist-ssr/entree-serveur.js')

// Ce qu'on remplace dans index.html. Le motif doit rester celui du
// fichier source : s'il change, le pré-rendu doit échouer, pas glisser.
const CIBLE = '<div id="root"></div>'

function echouer(message) {
  console.error(`\n  Pré-rendu impossible : ${message}\n`)
  process.exit(1)
}

if (!existsSync(PAGE)) {
  echouer('dist/index.html est absent. Lancez `vite build` d’abord.')
}
if (!existsSync(RENDU)) {
  echouer(
    'dist-ssr/entree-serveur.js est absent. Lancez ' +
      '`vite build --ssr src/entree-serveur.jsx --outDir dist-ssr` d’abord.',
  )
}

const { rendre } = await import(pathToFileURL(RENDU).href)

let html
try {
  html = rendre()
} catch (erreur) {
  echouer(`le rendu a levé une erreur.\n  ${erreur.stack}`)
}

if (!html || html.length < 1000) {
  echouer(`le rendu est vide ou trop court (${html?.length ?? 0} caractères).`)
}

const page = readFileSync(PAGE, 'utf8')

if (!page.includes(CIBLE)) {
  echouer(`« ${CIBLE} » est introuvable dans dist/index.html.`)
}

writeFileSync(PAGE, page.replace(CIBLE, `<div id="root">${html}</div>`), 'utf8')

const poids = Buffer.byteLength(html, 'utf8') / 1024
console.log(`  pré-rendu  dist/index.html  +${poids.toFixed(1)} Ko de HTML`)
