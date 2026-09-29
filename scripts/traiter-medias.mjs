#!/usr/bin/env node
/*
 * TRAITER LES MÉDIAS BRUTS.
 *
 *   npm run medias
 *
 * Vous déposez vos rendus dans `medias-bruts/`. Ce script les encode,
 * les redimensionne, vérifie leur poids et les écrit dans `public/`.
 * `medias-bruts/` est exclu de git : les sources lourdes ne rentrent
 * jamais dans le dépôt, seuls les fichiers servis y entrent.
 *
 * ────────────────────────────────────────────────────────────────────
 * POURQUOI UN SCRIPT ET PAS UNE LIGNE DE COMMANDE À COPIER
 * ────────────────────────────────────────────────────────────────────
 *
 * Trois réglages de cette page ne se devinent pas, et les oublier ne
 * produit pas une erreur — ça produit un site qui a l'air cassé :
 *
 *   1. `-g 6`. La vidéo du héros se déroule au défilement : le
 *      navigateur doit pouvoir sauter à n'importe quelle image. Sans
 *      images-clés rapprochées, il décode depuis la dernière et le
 *      déroulé saccade. Une image toutes les 6, pas toutes les 250.
 *
 *   2. `-an`. Aucune de ces vidéos n'a de son, et une piste audio muette
 *      pèse quand même. On la retire.
 *
 *   3. `faststart`. Les métadonnées passent en tête du fichier, sinon le
 *      navigateur télécharge tout avant d'afficher la première image.
 *      Sur la 3G d'Abidjan, c'est la différence entre trois secondes et
 *      trente.
 *
 * Le script vérifie aussi les plafonds de poids et ÉCHOUE s'ils sont
 * dépassés. Un plafond qu'on ne mesure pas est un souhait.
 */

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'

const RACINE = join(import.meta.dirname, '..')
const BRUTS = join(RACINE, 'medias-bruts')
const PUBLIC = join(RACINE, 'public')

const Ko = 1024
const Mo = 1024 * Ko

/*
 * LE PLAN DE TRAITEMENT.
 *
 * `source` est le nom attendu dans `medias-bruts/`, sans extension : le
 * script accepte n'importe quelle extension vidéo ou image courante, pour
 * que vous n'ayez pas à renommer vos rendus.
 *
 * `plafond` est un maximum, pas une cible. Dépassé, le script s'arrête.
 */
const PLAN = [
  {
    source: 'salon',
    sortie: 'video/salon.mp4',
    champ: 'heroVideo',
    plafond: 6 * Mo,
    role: 'S1 · la vidéo du héros, déroulée au défilement',
    // 1920 de large, images-clés toutes les 6 images, sans son.
    ffmpeg: (entree, sortie) => [
      '-i', entree,
      '-vf', 'scale=1920:-2:flags=lanczos',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '26',
      '-g', '6', '-keyint_min', '6', '-sc_threshold', '0',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-an', '-y', sortie,
    ],
  },
  {
    source: 'salon',
    sortie: 'video/salon-mobile.mp4',
    champ: 'heroVideoMobile',
    plafond: 2.5 * Mo,
    role: 'S1 · la boucle mobile, lue en continu',
    // 720 de large suffit sur un téléphone, et les images-clés peuvent
    // s'espacer : sur mobile la vidéo n'est pas déroulée, elle tourne.
    ffmpeg: (entree, sortie) => [
      '-i', entree,
      '-vf', 'scale=720:-2:flags=lanczos',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '30',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-an', '-y', sortie,
    ],
  },
  {
    source: 'salon',
    sortie: 'video/salon-affiche.jpg',
    champ: 'heroAffiche',
    plafond: 180 * Ko,
    role: 'S1 · l’affiche, visible avant la vidéo',
    /*
     * Une image, à 1600 de large — mais pas la PREMIÈRE. Un rendu
     * commence presque toujours par un fondu : la première image est
     * noire, et l'affiche du héros serait un rectangle noir. On entre à
     * 1,5 s, ce qui est sûr pour tout plan de 2 s ou plus.
     */
    ffmpeg: (entree, sortie) => [
      '-ss', '00:00:01.5', '-i', entree,
      '-vf', 'scale=1600:-2:flags=lanczos',
      '-frames:v', '1', '-q:v', '4',
      '-y', sortie,
    ],
  },
  {
    source: 'boucle',
    sortie: 'video/boucle.mp4',
    champ: 'boucle',
    plafond: 1.5 * Mo,
    role: 'S9 · le fond de l’appel final, à 35 % d’opacité',
    // Derrière un voile à 35 %, on ne voit pas le détail : on peut
    // compresser fort et personne ne s'en apercevra.
    ffmpeg: (entree, sortie) => [
      '-i', entree,
      '-vf', 'scale=1280:-2:flags=lanczos',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '32',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-an', '-y', sortie,
    ],
  },
  {
    source: 'fauteuil-vide',
    sortie: 'medias/fauteuil-vide.jpg',
    champ: 'fauteuilVide',
    plafond: 260 * Ko,
    role: 'S2 · le fauteuil vide (MÊME cadrage que le suivant)',
    ffmpeg: imageLarge(1400),
  },
  {
    source: 'fauteuil-occupe',
    sortie: 'medias/fauteuil-occupe.jpg',
    champ: 'fauteuilOccupe',
    plafond: 260 * Ko,
    role: 'S2 · le même fauteuil, occupé',
    ffmpeg: imageLarge(1400),
  },
  {
    source: 'telephone',
    sortie: 'medias/telephone.jpg',
    champ: 'telephone',
    plafond: 200 * Ko,
    role: 'S4 · le support de la démo, écran noir de face',
    ffmpeg: imageLarge(1000),
  },
  {
    source: 'mains-tresses',
    sortie: 'medias/mains-tresses.jpg',
    champ: 'mains',
    plafond: 300 * Ko,
    role: 'S5 · le bandeau de parallaxe, entre 02 et 03',
    ffmpeg: imageLarge(1600),
  },
  {
    source: 'gerante',
    sortie: 'medias/gerante.jpg',
    champ: 'gerante',
    plafond: 240 * Ko,
    role: 'S7 · le vis-à-vis du bloc garantie',
    ffmpeg: imageLarge(1200),
  },
  {
    /*
     * L'image de partage : ce qu'on voit quand le lien est collé dans
     * WhatsApp. Elle sort du même plan que l'affiche, recadrée au format
     * imposé par les réseaux : 1200 × 630, exactement, sinon ils
     * recadrent eux-mêmes et coupent n'importe où.
     *
     * ⚠️ Elle ÉCRASE `public/og.jpg`, qui est suivi par git. Si le
     * résultat ne vous plaît pas : `git checkout -- public/og.jpg`
     * rend l'ancienne.
     */
    source: 'salon',
    sortie: 'og.jpg',
    champ: null,
    plafond: 220 * Ko,
    role: 'Aperçu au partage (WhatsApp, Facebook, X)',
    ffmpeg: (entree, sortie) => [
      '-ss', '00:00:01.5', '-i', entree,
      '-vf',
      'scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630',
      '-frames:v', '1', '-q:v', '5',
      '-y', sortie,
    ],
  },
]

/* Une image redimensionnée, qualité 5 : l'œil ne voit pas la différence
 * avec 2, et le fichier pèse trois fois moins. */
function imageLarge(largeur) {
  return (entree, sortie) => [
    '-i', entree,
    '-vf', `scale=${largeur}:-2:flags=lanczos`,
    '-q:v', '5',
    '-y', sortie,
  ]
}

const EXTENSIONS = [
  '.mp4', '.mov', '.webm', '.mkv', '.m4v',
  '.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff',
]

function trouverSource(nom) {
  for (const extension of EXTENSIONS) {
    const chemin = join(BRUTS, nom + extension)
    if (existsSync(chemin)) return chemin
  }
  return null
}

function poids(octets) {
  if (octets >= Mo) return `${(octets / Mo).toFixed(2)} Mo`
  return `${Math.round(octets / Ko)} Ko`
}

/*
 * Le binaire. `FFMPEG=/chemin/vers/ffmpeg npm run medias` permet d'en
 * pointer un autre — une compilation maison, ou une version installée
 * hors du PATH.
 *
 * On l'appelle sans passer par un interpréteur de commandes, pour deux
 * raisons : le chemin de ce projet contient une espace (« GOTO SAAS »),
 * qu'un shell couperait en deux ; et aucun nom de fichier ne peut alors
 * être interprété comme une commande. Conséquence à connaître : sous
 * Windows, un ffmpeg installé en tant que script `.cmd` ne sera pas
 * trouvé, seulement un vrai `ffmpeg.exe`. C'est ce qu'installe
 * `winget install Gyan.FFmpeg`.
 */
const FFMPEG = process.env.FFMPEG || 'ffmpeg'

function ffmpegPresent() {
  const essai = spawnSync(FFMPEG, ['-version'], { encoding: 'utf8' })
  return essai.status === 0
}

// ── Vérifications préalables ────────────────────────────────────────

if (!existsSync(BRUTS)) {
  console.error(`\n✗ Le dossier ${BRUTS} n'existe pas.\n`)
  process.exit(1)
}

if (!ffmpegPresent()) {
  console.error(`
✗ ffmpeg est introuvable (cherché : ${FFMPEG}).

  Windows   winget install Gyan.FFmpeg
            (puis rouvrez le terminal pour que le PATH soit relu)
  macOS     brew install ffmpeg
  Debian    sudo apt install ffmpeg

  Ou, s'il est déjà installé ailleurs :
    FFMPEG="C:/chemin/vers/ffmpeg.exe" npm run medias

Rien n'a été modifié.
`)
  process.exit(1)
}

// ── Traitement ──────────────────────────────────────────────────────

console.log('\n  Traitement des médias\n  ' + '─'.repeat(60) + '\n')

const faits = []
const absents = []
const troplourds = []

for (const etape of PLAN) {
  const entree = trouverSource(etape.source)

  if (!entree) {
    absents.push(etape)
    continue
  }

  const sortie = join(PUBLIC, etape.sortie)
  mkdirSync(dirname(sortie), { recursive: true })

  process.stdout.write(`  ${etape.sortie.padEnd(30)}`)

  try {
    execFileSync(FFMPEG, ['-loglevel', 'error', ...etape.ffmpeg(entree, sortie)], {
      stdio: ['ignore', 'ignore', 'pipe'],
    })
  } catch (erreur) {
    console.log('✗')
    console.error(`\n✗ ffmpeg a échoué sur ${basename(entree)} :\n`)
    console.error(String(erreur.stderr || erreur.message).trim())
    process.exit(1)
  }

  const taille = statSync(sortie).size
  const depasse = taille > etape.plafond

  console.log(
    `${depasse ? '✗' : '✓'} ${poids(taille).padStart(9)}` +
      (depasse ? `  (plafond ${poids(etape.plafond)})` : ''),
  )

  if (depasse) troplourds.push({ etape, taille })
  else faits.push(etape)
}

// ── Compte rendu ────────────────────────────────────────────────────

if (absents.length) {
  console.log('\n  Sources absentes de medias-bruts/ :\n')
  for (const etape of absents) {
    console.log(`  · ${etape.source.padEnd(18)} ${etape.role}`)
  }
  console.log(
    '\n  Ce n’est pas une erreur : chaque section de la page est écrite\n' +
      '  pour être entière sans son média. Voir docs/refonte/PROMPTS-HIGGSFIELD.md\n' +
      '  pour ce qu’il faut produire.',
  )
}

if (troplourds.length) {
  console.log('\n  ' + '─'.repeat(60))
  console.log('\n✗ Plafond de poids dépassé :\n')
  for (const { etape, taille } of troplourds) {
    console.log(
      `  · public/${etape.sortie} — ${poids(taille)} pour ${poids(etape.plafond)} permis`,
    )
  }
  console.log(`
  Le fichier est écrit, mais NE LE METTEZ PAS EN LIGNE tel quel : une
  gérante d'Abidjan paie son forfait au méga-octet, et c'est la personne
  qu'on veut convaincre.

  Ce qu'il faut faire, dans cet ordre :
    1. raccourcir la source (6 à 10 s suffisent pour le héros) ;
    2. monter le -crf de 2 dans ce script — 26 → 28 divise le poids par
       environ 1,6 et se voit à peine derrière un voile ;
    3. en dernier recours seulement, baisser la résolution.
`)
}

// Les chemins à recopier. Le script ne touche pas à donnees.js :
// une réécriture automatique de fichier source est exactement le genre
// d'outil qui écrase un jour un commentaire qu'on avait écrit à la main.
const aBrancher = faits.filter((e) => e.champ)

if (aBrancher.length) {
  console.log('\n  ' + '─'.repeat(60))
  console.log('\n  À recopier dans MEDIAS, dans src/donnees.js :\n')
  for (const etape of aBrancher) {
    console.log(`    ${etape.champ}: '/${etape.sortie}',`)
  }
  console.log('\n  Puis : npm run build')
}

console.log()
process.exit(troplourds.length ? 1 : 0)
