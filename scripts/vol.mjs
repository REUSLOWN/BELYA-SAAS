#!/usr/bin/env node
/*
 * LE VOL : INSPECTER, ASSEMBLER, PRÉPARER.
 *
 *   npm run vol -- inspecter medias-bruts/vol-a.mp4
 *   npm run vol -- assembler medias-bruts/vol-a.mp4 medias-bruts/vol-b.mp4 medias-bruts/vol-c.mp4
 *   npm run vol -- assembler a.mp4 b-repare.mp4 c.mp4 --fondu 1
 *   npm run vol -- preparer [medias-bruts/vol-master.mp4] [--fps 15]
 *
 * ── inspecter ──
 *   Planche-contact à 2 images/s, détection de coupes cachées
 *   (select='gt(scene,0.3)'), première et dernière image. Tout atterrit
 *   dans medias-bruts/inspection/<nom>/. À REGARDER avant de garder un
 *   extrait : drone visible, voiture qui apparaît, logo, saut de lumière.
 *
 * ── assembler ──
 *   Normalise chaque segment (1920×1080, 24 i/s, yuv420p) et les met
 *   bout à bout en medias-bruts/vol-master.mp4. Les extensions s'enchaînent
 *   déjà image pour image : on les colle franc. `--fondu i` ajoute un
 *   fondu de 0,125 s à la jonction entre le segment i et le suivant
 *   (à réserver aux morceaux réparés). Relance la détection de coupes.
 *
 * ── preparer ──
 *   Découpe le master en images WebP pour le navigateur :
 *     public/vol/<version>/bureau/frame-0000.webp    1280 px, paysage
 *     public/vol/<version>/portrait/frame-0000.webp  540×960, centre recadré
 *   plus les affiches (première image, et une image fixe par chapitre
 *   pour le mode calme), puis écrit src/vol/manifeste.json. Le numéro de
 *   version est dans le chemin : un nouveau film ne se mélange jamais
 *   avec l'ancien dans le cache d'un navigateur.
 *
 * FFmpeg est requis (`winget install Gyan.FFmpeg`). Variable FFMPEG pour
 * un autre chemin.
 */

import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, join } from 'node:path'

const RACINE = join(import.meta.dirname, '..')
const BRUTS = join(RACINE, 'medias-bruts')
const FFMPEG = process.env.FFMPEG || 'ffmpeg'
const FFPROBE = process.env.FFPROBE || FFMPEG.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1')

const Mo = 1024 * 1024

function lancer(outil, args, { silencieux = false } = {}) {
  const r = spawnSync(outil, args, { encoding: 'utf8', maxBuffer: 64 * Mo })
  if (r.status !== 0) {
    console.error(r.stderr?.slice(-2000))
    throw new Error(`${basename(outil)} a échoué`)
  }
  if (!silencieux && r.stdout) process.stdout.write(r.stdout)
  return r
}

/*
 * La durée de la piste VIDÉO, pas celle du fichier : les exports de Flow
 * portent une piste audio plus longue de deux secondes, qui allongerait
 * le film d'images figées.
 */
function duree(fichier) {
  const r = lancer(
    FFPROBE,
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=duration', '-of', 'csv=p=0', fichier],
    { silencieux: true },
  )
  const video = Number(r.stdout.trim())
  if (Number.isFinite(video) && video > 0) return video
  const f = lancer(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', fichier], { silencieux: true })
  return Number(f.stdout.trim())
}

/* Les instants où FFmpeg voit un changement de plan brutal. */
function coupes(fichier) {
  const r = spawnSync(
    FFMPEG,
    ['-hide_banner', '-i', fichier, '-vf', "select='gt(scene,0.3)',showinfo", '-an', '-f', 'null', '-'],
    { encoding: 'utf8', maxBuffer: 64 * Mo },
  )
  return [...(r.stderr || '').matchAll(/pts_time:([\d.]+)/g)].map((m) => Number(m[1]))
}

function options(args) {
  const o = { _: [] }
  for (let i = 0; i < args.length; i += 1) {
    if (args[i].startsWith('--')) o[args[i].slice(2)] = args[i + 1] ?? true, (i += 1)
    else o._.push(args[i])
  }
  return o
}

// ── inspecter ────────────────────────────────────────────────────────
function inspecter(fichier) {
  if (!fichier || !existsSync(fichier)) throw new Error(`Fichier introuvable : ${fichier}`)
  const dossier = join(BRUTS, 'inspection', basename(fichier).replace(/\.\w+$/, ''))
  mkdirSync(dossier, { recursive: true })
  const d = duree(fichier)

  const colonnes = 6
  const lignes = Math.ceil((d * 2) / colonnes)
  lancer(FFMPEG, [
    '-y', '-v', 'error', '-i', fichier,
    '-vf', `fps=2,scale=320:-2,tile=${colonnes}x${lignes}:padding=4:margin=4`,
    '-frames:v', '1', join(dossier, 'planche.jpg'),
  ])
  lancer(FFMPEG, ['-y', '-v', 'error', '-i', fichier, '-frames:v', '1', join(dossier, 'premiere.jpg')])
  lancer(FFMPEG, ['-y', '-v', 'error', '-sseof', '-0.1', '-i', fichier, '-frames:v', '1', join(dossier, 'derniere.jpg')])
  // Les deux dernières secondes, image par image : là où les modèles
  // dérapent le plus souvent.
  lancer(FFMPEG, [
    '-y', '-v', 'error', '-sseof', '-2', '-i', fichier,
    '-vf', 'fps=6,scale=480:-2,tile=4x3:padding=4', '-frames:v', '1', join(dossier, 'fin-zoom.jpg'),
  ])

  const c = coupes(fichier)
  console.log(`\n${basename(fichier)} — ${d.toFixed(2)} s`)
  console.log(c.length ? `  ✗ coupes probables à : ${c.map((t) => t.toFixed(2) + ' s').join(', ')}` : '  ✓ aucune coupe détectée')
  console.log(`  → ${dossier}`)
}

// ── assembler ────────────────────────────────────────────────────────
function assembler(segments, o) {
  if (segments.length < 1) throw new Error('Donnez les segments dans l’ordre.')
  for (const s of segments) if (!existsSync(s)) throw new Error(`Introuvable : ${s}`)

  // `settb` aligne les bases de temps : xfade refuse sinon de lier un
  // morceau déjà concaténé à un segment neuf.
  const normaliser = 'scale=1920:1080:flags=lanczos,fps=24,format=yuv420p,setsar=1,settb=1/24'
  const fondus = new Set(
    String(o.fondu ?? '')
      .split(',')
      .filter(Boolean)
      .map(Number),
  )
  const sortie = join(BRUTS, 'vol-master.mp4')

  const args = ['-y', '-v', 'error']
  for (const s of segments) args.push('-i', s)
  const filtres = segments.map((_, i) => `[${i}:v]${normaliser}[n${i}]`)

  // Chaînage : collure franche, ou fondu très court là où on l'a demandé.
  let courant = 'n0'
  let position = duree(segments[0])
  for (let i = 1; i < segments.length; i += 1) {
    const suivant = `j${i}`
    if (fondus.has(i)) {
      const f = 0.125
      filtres.push(`[${courant}][n${i}]xfade=transition=fade:duration=${f}:offset=${(position - f).toFixed(3)},settb=1/24[${suivant}]`)
      position += duree(segments[i]) - f
    } else {
      filtres.push(`[${courant}][n${i}]concat=n=2:v=1:a=0,settb=1/24[${suivant}]`)
      position += duree(segments[i])
    }
    courant = suivant
  }

  args.push(
    '-filter_complex', filtres.join(';'),
    '-map', `[${courant}]`, '-an',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', sortie,
  )
  lancer(FFMPEG, args)
  console.log(`✓ ${sortie} — ${duree(sortie).toFixed(2)} s`)
  inspecter(sortie)
}

// ── preparer ─────────────────────────────────────────────────────────
async function lireVol() {
  // src/vol.js importe le manifeste en JSON, ce que Node n'accepte pas
  // sans attribut : on remplace cette ligne avant de l'évaluer.
  const code = readFileSync(join(RACINE, 'src', 'vol.js'), 'utf8').replace(
    /^import manifeste from .*$/m,
    'const manifeste = {}',
  )
  return import(`data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`)
}

function poidsDossier(dossier) {
  return readdirSync(dossier).reduce((t, f) => t + statSync(join(dossier, f)).size, 0)
}

async function preparer(o) {
  const master = o._[0] || join(BRUTS, 'vol-master.mp4')
  if (!existsSync(master)) throw new Error(`Introuvable : ${master}`)
  const fps = Number(o.fps || 15)
  const { BATTEMENTS, CHAPITRES } = await lireVol()

  const version = 'v' + new Date().toISOString().replace(/\D/g, '').slice(0, 12)
  const base = join(RACINE, 'public', 'vol')
  // On ne garde qu'une version servie : l'ancienne partirait sinon en
  // production avec la nouvelle.
  if (existsSync(base)) rmSync(base, { recursive: true, force: true })
  const ici = join(base, version)
  const pistes = {
    bureau: { vf: `fps=${fps},scale=1280:-2:flags=lanczos`, qualite: 74 },
    // Le centre du cadre 16:9, en portrait : c'est pour ça que les
    // prompts gardent l'action entre 40 % et 65 % de la largeur.
    portrait: { vf: `fps=${fps},crop=ih*9/16:ih,scale=540:960:flags=lanczos`, qualite: 72 },
  }

  const manifeste = { version, fps, duree: Number(duree(master).toFixed(3)), images: 0 }
  for (const [nom, p] of Object.entries(pistes)) {
    const dossier = join(ici, nom)
    mkdirSync(dossier, { recursive: true })
    lancer(FFMPEG, [
      '-y', '-v', 'error', '-i', master, '-an', '-t', String(manifeste.duree), '-vf', p.vf,
      '-c:v', 'libwebp', '-quality', String(p.qualite), '-compression_level', '6',
      '-start_number', '0', join(dossier, 'frame-%04d.webp'),
    ])
    const images = readdirSync(dossier).filter((f) => f.endsWith('.webp')).length
    const poids = poidsDossier(dossier)
    manifeste.images = manifeste.images ? Math.min(manifeste.images, images) : images
    manifeste[nom] = {
      motif: `/vol/${version}/${nom}/frame-{n}.webp`,
      poids,
      ...(nom === 'bureau' ? { largeur: 1280, hauteur: 720 } : { largeur: 540, hauteur: 960 }),
    }
    console.log(`  ${nom.padEnd(9)} ${images} images · ${(poids / Mo).toFixed(1)} Mo · ${((poids / images) / 1024).toFixed(0)} Ko/image`)
  }

  // Les images fixes : première image, et une par chapitre (sa tenue si
  // elle en a une, sinon le milieu de sa plage).
  const extraire = (temps, sortie, vf) =>
    lancer(FFMPEG, [
      '-y', '-v', 'error', '-ss', String(temps), '-i', master, '-frames:v', '1',
      '-vf', vf, '-c:v', 'libwebp', '-quality', '80', sortie,
    ])
  extraire(0, join(ici, 'affiche.webp'), 'scale=1600:-2:flags=lanczos')
  extraire(0, join(ici, 'affiche-portrait.webp'), 'crop=ih*9/16:ih,scale=720:1280:flags=lanczos')
  manifeste.affiche = `/vol/${version}/affiche.webp`
  manifeste.affichePortrait = `/vol/${version}/affiche-portrait.webp`

  manifeste.affiches = {}
  for (const cle of Object.keys(CHAPITRES)) {
    const siens = BATTEMENTS.filter((b) => b.chapitre === cle)
    if (!siens.length) continue
    const tenue = siens.find((b) => b.de === b.a)
    const t = tenue ? tenue.de : (siens[0].de + siens[siens.length - 1].a) / 2
    const sortie = join(ici, `chapitre-${cle}.webp`)
    extraire(Math.min(t, manifeste.duree - 0.05), sortie, 'scale=1600:-2:flags=lanczos')
    manifeste.affiches[cle] = `/vol/${version}/chapitre-${cle}.webp`
  }

  // La partition doit tenir dans le film.
  const fin = BATTEMENTS[BATTEMENTS.length - 1].a
  if (fin > manifeste.duree + 0.1) {
    console.warn(`  ! la partition va jusqu'à ${fin} s mais le film dure ${manifeste.duree} s — ajustez src/vol.js`)
  }

  writeFileSync(join(RACINE, 'src', 'vol', 'manifeste.json'), JSON.stringify(manifeste, null, 2) + '\n')
  const bureau = manifeste.bureau.poids / Mo
  console.log(`✓ src/vol/manifeste.json — ${manifeste.images} images, ${fps} i/s, version ${version}`)
  if (bureau > 30) console.warn(`  ! ${bureau.toFixed(0)} Mo au bureau : baissez --fps ou la qualité`)
}

// ── aiguillage ───────────────────────────────────────────────────────
const [commande, ...reste] = process.argv.slice(2)
const o = options(reste)
try {
  if (commande === 'inspecter') o._.forEach((f) => inspecter(f))
  else if (commande === 'assembler') assembler(o._, o)
  else if (commande === 'preparer') await preparer(o)
  else {
    console.log('Usage : npm run vol -- inspecter|assembler|preparer …  (voir l’en-tête de scripts/vol.mjs)')
    process.exit(1)
  }
} catch (e) {
  console.error(`✗ ${e.message}`)
  process.exit(1)
}
