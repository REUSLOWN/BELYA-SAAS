#!/usr/bin/env node
/*
 * LES CRITÈRES D'ACCEPTATION, VÉRIFIÉS.
 *
 *   npm run verifier        (après npm run build)
 *
 * Le brief de la refonte liste dix critères à contrôler avant chaque
 * mise en ligne. Une liste qu'on relit à la main se relit mal : au
 * troisième push, on coche sans regarder. Ce script coche pour de vrai
 * ce qui est mécaniquement vérifiable, et dit clairement ce qui ne l'est
 * pas — un critère qu'un script ne peut pas trancher doit être annoncé
 * comme non vérifié, pas passé sous silence.
 *
 * Il sort en erreur au premier échec, pour qu'il puisse servir de garde
 * avant un déploiement.
 */

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const RACINE = join(import.meta.dirname, '..')
const DIST = join(RACINE, 'dist')
const PAGE = join(DIST, 'index.html')

let echecs = 0
let avertissements = 0

function verifier(intitule, condition, detail = '') {
  const bon = Boolean(condition)
  if (!bon) echecs += 1
  console.log(`  ${bon ? '✓' : '✗'} ${intitule}${detail ? `  — ${detail}` : ''}`)
  return bon
}

function prevenir(intitule, detail) {
  avertissements += 1
  console.log(`  ! ${intitule}${detail ? `  — ${detail}` : ''}`)
}

function nonVerifiable(intitule, pourquoi) {
  console.log(`  ? ${intitule}\n      ${pourquoi}`)
}

function titre(texte) {
  console.log(`\n  ${texte}\n  ${'─'.repeat(64)}`)
}

// ── Le build doit exister ───────────────────────────────────────────

if (!existsSync(PAGE)) {
  console.error('\n✗ dist/index.html est absent. Lancez d’abord : npm run build\n')
  process.exit(1)
}

const html = readFileSync(PAGE, 'utf8')
const source = (chemin) => readFileSync(join(RACINE, chemin), 'utf8')

console.log('\n  Critères d’acceptation — Belya, refonte premium')

// ── 1. Le texte de la page est dans le pré-rendu ────────────────────

titre('1. Le pré-rendu contient tout le texte de la page')

const donnees = source('src/donnees.js')

/*
 * On ne réécrit pas les textes ici : on les extrait de donnees.js et on
 * vérifie que chacun se retrouve dans le HTML. Une liste recopiée à la
 * main se désynchronise au premier changement de discours, et un test
 * qui a tort est pire que pas de test.
 */
const phrases = [...donnees.matchAll(/^\s*(?:reponse|texte|chapo|titreSerif|titreSans|question):\s*\n?\s*'((?:[^'\\]|\\.){25,})',?$/gm)]
  .map((m) => m[1].replace(/\\'/g, "'"))

verifier(
  `${phrases.length} phrases extraites de donnees.js`,
  phrases.length >= 20,
  phrases.length < 20 ? 'extraction suspecte : vérifiez l’expression' : '',
)

/*
 * Une exemption, et une seule, documentée.
 *
 * Les bulles de la branche « Annuler » de la démo S4 n'apparaissent
 * qu'après un clic : elles ne PEUVENT pas être dans le pré-rendu, et
 * elles n'ont pas à y être — sans JavaScript la démo ne se joue pas du
 * tout, et rien d'autre ne dépend de ce texte.
 *
 * Toute autre absence est un défaut : c'est du contenu que ni Google ni
 * une visiteuse en 3G qui coupe ne verraient jamais.
 */
const INTERACTION_SEULE = [
  'Fatou, suite à votre inscription en liste d’attente',
]

const absentes = phrases
  .filter((p) => !INTERACTION_SEULE.some((debut) => p.startsWith(debut)))
  .filter((p) => !html.includes(p))
verifier(
  'chaque phrase de donnees.js figure dans le HTML servi',
  absentes.length === 0,
  absentes.length ? `${absentes.length} absente(s) : « ${absentes[0].slice(0, 50)}… »` : '',
)

// ── 2. Rien n'est caché dans le HTML pré-rendu ──────────────────────

titre('2. Aucun contenu caché dans le HTML (règle du système de mouvement)')

/*
 * La règle : on n'anime jamais depuis un état caché posé dans le HTML.
 * Si le JavaScript ne charge pas, la page doit rester entière. On
 * cherche donc les styles en ligne qui masqueraient du contenu.
 *
 * Exception assumée : l'indicateur de progression part à scaleX(0). Ce
 * n'est pas du contenu, c'est une jauge, et figée à zéro elle serait un
 * mensonge — absente elle ne dit rien.
 */
const masques = [
  ['clip-path en ligne', /style="[^"]*clip-path/],
  ['visibility:hidden en ligne', /style="[^"]*visibility:\s*hidden/],
  ['display:none en ligne', /style="[^"]*display:\s*none/],
]

for (const [nom, motif] of masques) {
  verifier(`aucun ${nom}`, !motif.test(html))
}

/*
 * `opacity:0` en ligne : autorisé uniquement sur un élément qui ne
 * CONTIENT rien. Le voile du héros en est un — un dégradé posé
 * par-dessus la vidéo, invisible tant qu'il n'y a pas de vidéo, ce qui
 * est exactement l'état juste. Un opacity:0 sur un élément qui a des
 * enfants, en revanche, cache du contenu, et c'est un défaut.
 */
const opacitesNulles = [...html.matchAll(
  /<(\w+)(?=[^>]*style="[^"]*opacity:\s*0[;"])[^>]*>/g,
)]

// Vide = la balise est immédiatement refermée. Tout le reste contient
// quelque chose, donc cache quelque chose.
const cachentDuContenu = opacitesNulles.filter((m) => {
  const apres = html.slice(m.index + m[0].length)
  return !apres.startsWith(`</${m[1]}>`)
})

verifier(
  'aucun opacity:0 en ligne sur un élément qui contient quelque chose',
  cachentDuContenu.length === 0,
  `${opacitesNulles.length} au total, ${cachentDuContenu.length} non vide(s)`,
)

const jauges = [...html.matchAll(/style="transform:\s*scaleX\(0\)"/g)]
verifier(
  'le seul scaleX(0) est celui de la jauge de progression',
  jauges.length <= 1,
  `${jauges.length} trouvé(s)`,
)

// ── 3. Les chiffres concordent ──────────────────────────────────────

titre('3. Les chiffres concordent d’une section à l’autre')

for (const [intitule, attendu] of [
  ['43 créneaux sauvés', />43</],
  ['215 000 F de gain mensuel', /215 000 F/],
  ['la mention d’exemple accompagne la maquette', /Exemple calculé pour un salon/],
]) {
  verifier(intitule, attendu.test(html))
}

// 14,3× : le retour sur dépense de l'offre Salon, calculé et non écrit.
const roi = html.match(/(\d+,\d)×/)
verifier(
  'le retour sur dépense est calculé, pas écrit en dur',
  roi && !donnees.includes(`'${roi[1]}×'`),
  roi ? `affiché : ${roi[0]}` : 'aucun « n,n× » trouvé',
)

// ── 4. Aucune preuve inventée ───────────────────────────────────────

titre('4. Aucune preuve inventée')

const inventions = [
  ['aucune note sur 5', /\b[45][.,]\d\s*\/\s*5\b/],
  ['aucun compteur de salons', /\b\d{2,}\s+salons?\b(?!\s*de\s*trois)/i],
  ['aucun « selon nos mesures »', /selon nos (?:mesures|études|données)/i],
  ['aucun « témoignage »', /témoignage/i],
  ['aucun « ils nous font confiance »', /nous font confiance/i],
]

for (const [nom, motif] of inventions) {
  verifier(nom, !motif.test(html))
}

// ── 5. WhatsApp ─────────────────────────────────────────────────────

titre('5. WhatsApp')

const NUMERO = '2250546009666'
verifier(
  `les liens pointent sur wa.me/${NUMERO}`,
  html.includes(`wa.me/${NUMERO}`),
)

const autresNumeros = [...html.matchAll(/wa\.me\/(\d+)/g)]
  .map((m) => m[1])
  .filter((n) => n !== NUMERO)
verifier(
  'aucun autre numéro WhatsApp dans la page',
  autresNumeros.length === 0,
  autresNumeros.length ? `trouvé(s) : ${[...new Set(autresNumeros)].join(', ')}` : '',
)

verifier(
  'le message est pré-rédigé (la gérante n’a rien à expliquer)',
  /wa\.me\/\d+\?text=\S/.test(html),
)

// ── 6. Poids du JavaScript ──────────────────────────────────────────

titre('6. Poids envoyé au navigateur')

const PLAFOND_JS = 200 * 1024
const actifs = join(DIST, 'assets')
let jsTotal = 0
let cssTotal = 0

for (const nom of readdirSync(actifs)) {
  const chemin = join(actifs, nom)
  const gz = gzipSync(readFileSync(chemin)).length
  if (nom.endsWith('.js')) jsTotal += gz
  if (nom.endsWith('.css')) cssTotal += gz
}

verifier(
  `JavaScript initial sous 200 Ko en gzip`,
  jsTotal < PLAFOND_JS,
  `${Math.round(jsTotal / 1024)} Ko`,
)
console.log(`      (CSS : ${Math.round(cssTotal / 1024)} Ko en gzip)`)

// ── 7. Médias et 404 ────────────────────────────────────────────────

titre('7. Médias — aucun cadre vide, aucune 404')

const chemins = [...donnees.matchAll(/^\s*(\w+):\s*'(\/(?:video|medias)\/[^']+)'/gm)]
const manquants = chemins.filter(([, , p]) => !existsSync(join(RACINE, 'public', p)))

verifier(
  'tout chemin renseigné dans MEDIAS existe sur le disque',
  manquants.length === 0,
  manquants.length ? manquants.map(([, c]) => c).join(', ') : `${chemins.length} renseigné(s)`,
)

const balisesVides = [...html.matchAll(/<(?:img|video)[^>]*\ssrc=""/g)]
verifier('aucune balise img ou video à source vide', balisesVides.length === 0)

if (chemins.length === 0) {
  prevenir(
    'aucun média n’est encore branché',
    'chaque section est écrite pour être entière sans média — voir docs/refonte/PROMPTS-HIGGSFIELD.md',
  )
}

// ── 8. Mouvement réduit ─────────────────────────────────────────────

titre('8. prefers-reduced-motion donne une page statique complète')

const composants = readdirSync(join(RACINE, 'src/components'))
  .filter((n) => n.endsWith('.jsx'))

const animes = composants.filter((nom) =>
  /gsap\.(to|from|fromTo|timeline)|ScrollTrigger\.create/.test(
    source(`src/components/${nom}`),
  ),
)

const sansGarde = animes.filter((nom) => {
  const code = source(`src/components/${nom}`)
  // Soit le composant teste lui-même la préférence, soit il ne passe que
  // par les primitives, qui la testent toutes.
  return !/mouvementReduit\(\)/.test(code) &&
    !/\b(reveler|revelerTitre|revelerImage|parallaxe|compteur|basculerFond)\(/.test(code)
})

verifier(
  `les ${animes.length} composants animés respectent la préférence`,
  sansGarde.length === 0,
  sansGarde.length ? `sans garde : ${sansGarde.join(', ')}` : '',
)

verifier(
  'la feuille de style neutralise aussi transitions et animations CSS',
  /prefers-reduced-motion: reduce/.test(source('src/index.css')),
)

// ── 9. Cibles tactiles et focus ─────────────────────────────────────

titre('9. Clavier et pouce')

verifier(
  'un anneau de focus visible est défini',
  /:focus-visible/.test(source('src/index.css')),
)

/*
 * Les boutons et liens du HTML servi doivent tous pouvoir être touchés
 * au pouce. On ne mesure pas des pixels ici — impossible sans
 * navigateur — mais on vérifie qu'aucune cible ne porte de hauteur
 * explicitement inférieure à 44 px.
 */
const petites = [...html.matchAll(/<(?:button|a)\b[^>]*\bclass="([^"]*)"/g)]
  .map((m) => m[1])
  .filter((c) => /\b(?:h|min-h)-\[(\d+)px\]/.test(c))
  .filter((c) => {
    const m = c.match(/\b(?:h|min-h)-\[(\d+)px\]/)
    return Number(m[1]) < 44
  })

verifier(
  'aucune cible tactile déclarée sous 44 px',
  petites.length === 0,
  petites.length ? `${petites.length} trouvée(s)` : '',
)

// ── 10. CSP et origines externes ────────────────────────────────────

titre('10. Aucune origine externe hors Google Fonts')

/*
 * On ne regarde QUE ce que le navigateur va chercher tout seul : les
 * scripts, les feuilles de style, les préchargements et les images.
 * Pas les `href` d'un lien — wa.me est une destination que l'on clique,
 * pas une ressource chargée, et la CSP n'a rien à en dire.
 */
const ressources = [
  ...html.matchAll(/<(?:script|link|img|video|source|iframe)\b[^>]*\b(?:src|href)="(https?:\/\/[^"]+)"/g),
]
  .map((m) => new URL(m[1]).origin)
  .filter((o) => !o.includes('fonts.googleapis.com') && !o.includes('fonts.gstatic.com'))

verifier(
  'aucune ressource chargée depuis une origine tierce',
  ressources.length === 0,
  ressources.length ? [...new Set(ressources)].join(', ') : '',
)

// Les liens sortants, eux, on les liste : ils sont normaux, mais une
// destination inattendue doit sauter aux yeux.
const sorties = [...new Set(
  [...html.matchAll(/<a\b[^>]*href="(https?:\/\/[^"]+)"/g)].map((m) => new URL(m[1]).hostname),
)]
console.log(`      liens sortants : ${sorties.join(', ') || 'aucun'}`)

verifier(
  'vercel.json est intact (le brief l’interdit de modifier)',
  execSync('git diff --stat main -- vercel.json', { cwd: RACINE, encoding: 'utf8' }).trim() === '',
)

verifier(
  'les pages légales sont intactes',
  execSync('git diff --stat main -- public/mentions-legales.html public/confidentialite.html public/conditions.html',
    { cwd: RACINE, encoding: 'utf8' }).trim() === '',
)

// ── Ce qu'un script ne peut pas trancher ────────────────────────────

// ── 11. Le vol ──────────────────────────────────────────────────────

titre('11. Le vol à travers le salon')

{
  // src/vol.js importe le manifeste en JSON, ce que Node refuse sans
  // attribut : on le remplace avant d'évaluer le module.
  const code = source('src/vol.js').replace(/^import manifeste from .*$/m, 'const manifeste = {}')
  const { AUTOPILOTE, BATTEMENTS, CHAPITRES } = await import(
    `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`
  )
  const manifeste = JSON.parse(source('src/vol/manifeste.json'))

  const ruptures = BATTEMENTS.slice(1).filter((b, i) => b.de !== BATTEMENTS[i].a)
  verifier(
    'les battements se suivent sans saut dans le film',
    ruptures.length === 0,
    ruptures.map((b) => b.id).join(', '),
  )
  verifier('chaque battement a une distance de défilement', BATTEMENTS.every((b) => b.vh > 0))
  const inconnus = BATTEMENTS.filter((b) => b.chapitre && !CHAPITRES[b.chapitre])
  verifier('chaque chapitre cité existe', inconnus.length === 0, inconnus.map((b) => b.id).join(', '))
  const total = BATTEMENTS.reduce((t, b) => t + b.vh, 0)
  console.log(`      ${BATTEMENTS.length} battements, ${total} vh de défilement, film de ${BATTEMENTS.at(-1).a} s`)

  /*
   * L'autopilote. Une vitesse nulle figerait le film pour toujours, une
   * tenue nulle supprimerait le temps de lecture ; une reprise trop
   * courte relancerait le film pendant qu'on lit la phrase où l'on vient
   * de s'arrêter. Et on vérifie le calcul lui-même : avancer à 60 images
   * par seconde doit arriver au bout en la durée annoncée.
   */
  const { partition, avancer, dureeAutopilote } = await import(
    pathToFileURL(join(RACINE, 'src', 'lib', 'sequence.js')).href
  )
  verifier(
    'autopilote : vitesse et durée de tenue positives',
    AUTOPILOTE?.vitesse > 0 && AUTOPILOTE?.tenueParVh > 0,
    JSON.stringify(AUTOPILOTE),
  )
  verifier(
    'autopilote : au moins 2 s sans geste avant de reprendre',
    AUTOPILOTE?.repriseApres >= 2,
    `${AUTOPILOTE?.repriseApres} s`,
  )
  const { plages, total: totalVh } = partition(BATTEMENTS)
  const annonce = dureeAutopilote(plages, AUTOPILOTE)
  let position = 0
  let ecoule = 0
  while (position < totalVh && ecoule < 600) {
    position = avancer(plages, position, 1 / 60, AUTOPILOTE)
    ecoule += 1 / 60
  }
  verifier(
    'autopilote : le film va au bout en la durée annoncée',
    Math.abs(ecoule - annonce) < 0.05,
    `${ecoule.toFixed(2)} s mesurées pour ${annonce.toFixed(2)} s annoncées`,
  )
  console.log(`      autopilote : le film dure ${annonce.toFixed(1)} s s'il défile seul`)

  if (!manifeste.images) {
    prevenir('aucune image de vol préparée', 'le héros typographique reste en place (npm run vol -- preparer)')
  } else {
    verifier(
      'la partition tient dans le film',
      BATTEMENTS.at(-1).a <= manifeste.duree + 0.2,
      `${BATTEMENTS.at(-1).a} s pour ${manifeste.duree} s`,
    )
    for (const piste of ['bureau', 'leger', 'portrait']) {
      const m = manifeste[piste]
      if (!m) continue
      const total = m.images ?? manifeste.images
      const echantillon = [0, Math.floor(total / 2), total - 1]
      const manquants = echantillon
        .map((n) => m.motif.replace('{n}', String(n).padStart(4, '0')))
        .filter((u) => !existsSync(join(DIST, u)))
      verifier(`piste ${piste} : première, milieu et dernière image servies`, manquants.length === 0, manquants.join(', '))
      console.log(`      ${piste} : ${total} images à ${m.fps ?? manifeste.fps} i/s, ${(m.poids / 1024 / 1024).toFixed(1)} Mo au total`)
    }
    const affiches = [manifeste.affiche, manifeste.affichePortrait, ...Object.values(manifeste.affiches || {})]
    const absentes = affiches.filter((u) => !u || !existsSync(join(DIST, u)))
    verifier('affiches et images fixes du mode calme servies', absentes.length === 0, absentes.join(', '))
    verifier(
      'une image fixe par chapitre pour le mode calme',
      Object.keys(CHAPITRES).every((c) => manifeste.affiches?.[c]),
    )
  }
}

titre('Non vérifiable ici — à contrôler dans un navigateur')

nonVerifiable(
  'console sans erreur, sur bureau et sur mobile',
  'demande un navigateur réel. À faire avant la mise en ligne.',
)
nonVerifiable(
  'Lighthouse mobile : Performance ≥ 85, Accessibilité ≥ 95, CLS < 0,05, LCP < 2,5 s',
  'demande Chrome. `npx unlighthouse --site <url>` après déploiement de la préproduction.',
)
nonVerifiable(
  'à 375 px : aucun défilement horizontal',
  'les largeurs sont en unités relatives et body a overflow-x:hidden, mais seul un rendu le prouve.',
)
nonVerifiable(
  'la démo S4 se joue au clavier, et le défilement horizontal de S5 ne piège pas le focus',
  'les commandes sont des <button> et des <a>, donc atteignables ; reste à l’essayer.',
)

// ── Verdict ─────────────────────────────────────────────────────────

console.log(`\n  ${'─'.repeat(64)}`)
console.log(
  `\n  ${echecs === 0 ? '✓' : '✗'} ${echecs} échec(s), ${avertissements} avertissement(s).\n`,
)

process.exit(echecs === 0 ? 0 : 1)
