import { useEffect, useMemo, useRef, useState } from 'react'
import { HERO, lienWhatsAppGeneral } from '../donnees'
import {
  ANCRE_APRES_VOL,
  BATTEMENTS,
  CHAPITRES,
  CREDIT_VOL,
  FONDU_VH,
  MANIFESTE_VOL as M,
  SEUIL_PORTRAIT,
} from '../vol'
import { Sequence, opacites, partition, tempsA } from '../lib/sequence'
import { glisserVers } from '../lib/defilement'
import Bouton from './Bouton'

/*
 * LE VOL À TRAVERS LE SALON.
 *
 * Un seul plan, sans coupe : la porte, la salle, l'arrière-boutique, la
 * réserve, la cour, puis le quartier vu d'en haut. Le défilement fait
 * avancer la caméra ; le texte se pose dessus, chapitre par chapitre.
 *
 * ────────────────────────────────────────────────────────────────────
 * CE QUI TIENT L'ENSEMBLE
 * ────────────────────────────────────────────────────────────────────
 *
 * 1. LE TEXTE EST DU HTML, PAS DE L'IMAGE.
 *    Le film est peint sur un <canvas> décoratif ; titres, boutons et
 *    liens sont de vrais éléments, nets, sélectionnables, traduisibles.
 *    Un chapitre masqué est `inert` : il ne prend ni clic ni tabulation.
 *
 * 2. PAS DE DÉTOURNEMENT DU DÉFILEMENT.
 *    La section est simplement haute ; la scène y est `sticky`. On
 *    défile normalement, dans les deux sens, au doigt, à la molette, au
 *    clavier. On ne fait que LIRE la position.
 *
 * 3. LA PAGE SE COMPREND SANS LE FILM.
 *    Le pré-rendu (et le mode « calme ») présente les cinq chapitres
 *    l'un sous l'autre, chacun sur une image fixe. Le vol ne s'active
 *    qu'après coup, si le mouvement est permis et la connexion
 *    généreuse — sur la 3G d'une gérante qui paie au méga-octet, on ne
 *    télécharge pas 20 Mo d'images.
 *
 * 4. LA PARTITION EST DANS `src/vol.js`.
 *    Combien d'écrans pour chaque passage, quelles secondes du film,
 *    quel chapitre : tout se règle là, sans toucher à ce fichier.
 */

function connexionGenereuse() {
  const lien = navigator.connection || navigator.mozConnection
  if (lien?.saveData) return false
  if (lien && ['slow-2g', '2g', '3g'].includes(lien.effectiveType)) return false
  // Moins de 2 Go de mémoire : on épargne l'appareil.
  if (navigator.deviceMemory && navigator.deviceMemory < 2) return false
  return true
}

function choisirMode() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'calme'
  if (!connexionGenereuse()) return 'calme'
  return 'vol'
}

/* ── Le contenu d'un chapitre, commun aux deux modes ── */
function Chapitre({ cle, enVol }) {
  const c = CHAPITRES[cle]
  const whatsapp = c.whatsapp ? lienWhatsAppGeneral() : null

  const reperage = (
    <p className="micro flex items-center gap-4 text-creme/80">
      <span className="h-px w-10 shrink-0 bg-magenta-clair" aria-hidden="true" />
      <span>
        {c.numero} · {c.lieu}
      </span>
    </p>
  )

  if (c.heros) {
    return (
      <>
        <p className="micro flex items-center gap-4 text-creme/80">
          <span className="h-px w-10 shrink-0 bg-magenta-clair" aria-hidden="true" />
          {HERO.surtitre}
        </p>
        <h1 className="mt-7 text-creme">
          <span className="block text-[clamp(1.4rem,3.6vw,2.6rem)] font-extrabold leading-[1.08] tracking-tresserre">
            {HERO.titreSans}
          </span>
          <span className="mt-1 block font-drama text-[clamp(4rem,11vw,9rem)] italic leading-[0.84] tracking-[-0.02em] text-magenta-clair">
            {HERO.titreSerif}
          </span>
        </h1>
        <p className="mt-7 max-w-lg text-[1.02rem] leading-relaxed text-creme/85">
          {HERO.chapo}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Bouton taille="grand" onClick={() => glisserVers('calculateur')}>
            {HERO.cta}
          </Bouton>
          <Bouton variante="contour" taille="grand" onClick={() => glisserVers('methode')}>
            {HERO.ctaSecondaire}
          </Bouton>
        </div>
        <p className="legende mt-4 text-creme/70">{HERO.micro}</p>
        {enVol && (
          <p className="legende mt-8 hidden text-creme/60 lg:block" aria-hidden="true">
            Défilez pour entrer ↓
          </p>
        )}
      </>
    )
  }

  return (
    <>
      {reperage}
      <h2 className="mt-6 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1.04] tracking-tresserre text-creme">
        {c.titre}
      </h2>
      <p className="mt-5 max-w-lg text-[1.02rem] leading-relaxed text-creme/85">{c.texte}</p>
      {(c.action || whatsapp) && (
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {c.action && (
            <Bouton taille="grand" onClick={() => glisserVers(c.action.ancre)}>
              {c.action.libelle}
            </Bouton>
          )}
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="lift rounded-full border border-creme/40 px-9 py-4 text-[16px] font-semibold tracking-serre text-creme hover:bg-creme hover:text-encre"
            >
              Écrire sur WhatsApp
            </a>
          )}
        </div>
      )}
      {cle === 'fin' && <p className="legende mt-4 text-creme/70">{HERO.micro}</p>}
    </>
  )
}

const ORDRE = Object.keys(CHAPITRES)

export default function VolSalon() {
  // Le premier rendu est TOUJOURS le mode calme : c'est celui du
  // pré-rendu, identique pour tous, donc rien ne diverge à l'hydratation.
  const [mode, setMode] = useState('calme')
  const [portrait, setPortrait] = useState(false)
  const [filmPret, setFilmPret] = useState(false)

  const section = useRef(null)
  const scene = useRef(null)
  const toile = useRef(null)
  const blocs = useRef({})

  const { plages, total } = useMemo(() => partition(BATTEMENTS), [])

  useEffect(() => {
    setMode(choisirMode())
    const requete = window.matchMedia(`(max-width: ${SEUIL_PORTRAIT - 1}px)`)
    const lire = () => setPortrait(requete.matches)
    lire()
    requete.addEventListener('change', lire)
    return () => requete.removeEventListener('change', lire)
  }, [])

  const piste = portrait && M.portrait ? M.portrait : M.bureau
  const affiche = portrait && M.affichePortrait ? M.affichePortrait : M.affiche

  // ── Le moteur : défilement → image → peinture ──────────────────────
  useEffect(() => {
    if (mode !== 'vol' || !piste) return

    const canvas = toile.current
    const contexte = canvas.getContext('2d', { alpha: false })
    let derniereVh = -1
    let derniereImage = -1
    let peinte = null
    let demande = 0

    const dimensionner = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const l = Math.round(canvas.clientWidth * ratio)
      const h = Math.round(canvas.clientHeight * ratio)
      if (canvas.width !== l || canvas.height !== h) {
        canvas.width = l
        canvas.height = h
        peinte = null // forcer la repeinture
      }
    }

    const peindre = (image) => {
      if (!image || image === peinte) return
      // « cover » : remplir l'écran, recadrer au centre.
      const echelle = Math.max(canvas.width / image.width, canvas.height / image.height)
      const l = image.width * echelle
      const h = image.height * echelle
      contexte.drawImage(image, (canvas.width - l) / 2, (canvas.height - h) / 2, l, h)
      if (!peinte) setFilmPret(true)
      peinte = image
    }

    const sequence = new Sequence({
      motif: piste.motif,
      total: M.images,
      memoire: portrait ? 16 : 24,
      surArrivee: () => planifierRendu(),
    })

    const rendre = () => {
      demande = 0
      const s = section.current
      const st = scene.current
      if (!s || !st) return
      const course = s.offsetHeight - st.offsetHeight
      const fait = Math.min(Math.max(-s.getBoundingClientRect().top, 0), course)
      const vh = course > 0 ? (fait / course) * total : 0

      const n = Math.min(M.images - 1, Math.round(tempsA(plages, vh) * M.fps))
      if (n !== derniereImage) {
        sequence.viser(n, n >= derniereImage ? 1 : -1)
        derniereImage = n
      }
      peindre(sequence.meilleure(n))
      // Lisible par les tests et dans l'inspecteur : l'image visée, et
      // si c'est bien elle qui est peinte (ou une voisine en attendant).
      canvas.dataset.image = String(n)
      canvas.dataset.exacte = sequence.images.has(n) ? 'oui' : 'non'

      if (vh !== derniereVh) {
        derniereVh = vh
        const o = opacites(plages, vh, FONDU_VH)
        for (const cle of ORDRE) {
          const el = blocs.current[cle]
          if (!el) continue
          const op = o[cle] ?? 0
          el.style.opacity = String(op)
          el.style.transform = `translate3d(0, ${(1 - op) * 18}px, 0)`
          const cache = op < 0.04
          el.style.visibility = cache ? 'hidden' : 'visible'
          el.inert = cache
          el.setAttribute('aria-hidden', cache ? 'true' : 'false')
        }
      }
    }

    function planifierRendu() {
      if (!demande) demande = requestAnimationFrame(rendre)
    }

    const auRedimensionnement = () => {
      dimensionner()
      derniereVh = -1
      planifierRendu()
    }

    dimensionner()
    rendre()
    window.addEventListener('scroll', planifierRendu, { passive: true })
    window.addEventListener('resize', auRedimensionnement)

    return () => {
      window.removeEventListener('scroll', planifierRendu)
      window.removeEventListener('resize', auRedimensionnement)
      if (demande) cancelAnimationFrame(demande)
      sequence.fermer()
      setFilmPret(false)
    }
  }, [mode, piste, portrait, plages, total])

  const eviter = (e) => {
    e.preventDefault()
    glisserVers(ANCRE_APRES_VOL)
  }

  // ── Mode calme : cinq chapitres, chacun sur une image fixe ─────────
  const calme = mode !== 'vol' && (
      <section aria-label="Visite d’un salon, en cinq étapes" className="relative bg-encre">
        {ORDRE.map((cle, i) => {
          const image = M.affiches?.[cle]
          return (
            <div
              key={cle}
              className={`relative flex w-full items-end overflow-hidden lg:items-center ${
                i === 0 ? 'min-h-[100svh]' : 'min-h-[80svh]'
              }`}
            >
              {image && (
                <img
                  src={image}
                  alt=""
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="voile-vol absolute inset-0" aria-hidden="true" />
              <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-32 sm:px-10 lg:px-16 lg:py-32">
                <div className="max-w-xl">
                  <Chapitre cle={cle} enVol={false} />
                </div>
              </div>
            </div>
          )
        })}
        <p className="legende absolute bottom-4 right-6 text-creme/55">{CREDIT_VOL}</p>
      </section>
  )

  // ── Mode vol ───────────────────────────────────────────────────────
  const vol = mode === 'vol' && (
    <section
      ref={section}
      aria-label="Visite d’un salon, en un seul plan"
      className="relative bg-encre"
      style={{ height: `calc(${total}vh + 100svh)` }}
    >
      <div ref={scene} className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {affiche && (
          <img
            src={affiche}
            alt=""
            decoding="async"
            fetchpriority="high"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              filmPret ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}
        <canvas
          ref={toile}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
            filmPret ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="voile-vol absolute inset-0" aria-hidden="true" />

        {/* Avant les chapitres dans le DOM : le lien d'évitement est la
            première chose qu'on atteint au clavier. */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-4 px-6 pb-4 sm:px-10 lg:px-16">
          <p className="legende text-creme/55">{CREDIT_VOL}</p>
          <a
            href={`#${ANCRE_APRES_VOL}`}
            onClick={eviter}
            className="legende lift font-semibold text-creme/80 underline decoration-creme/30 underline-offset-4 hover:text-creme"
          >
            Passer la visite
          </a>
        </div>

        {ORDRE.map((cle, i) => (
          <div
            key={cle}
            ref={(el) => {
              blocs.current[cle] = el
            }}
            className="pointer-events-none absolute inset-0 flex items-end will-change-transform lg:items-center"
            style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden' }}
            inert={i === 0 ? undefined : true}
          >
            <div className="mx-auto w-full max-w-6xl px-6 pb-20 sm:px-10 lg:px-16 lg:pb-0">
              <div className="pointer-events-auto max-w-xl">
                <Chapitre cle={cle} enVol />
              </div>
            </div>
          </div>
        ))}

      </div>
    </section>
  )

  /*
   * Les deux sentinelles restent HORS des deux modes : ce sont les mêmes
   * éléments avant et après le passage au vol, et la navigation et la
   * barre fixe, qui les observent dès le premier rendu, ne perdent pas
   * leur cible.
   *
   *   sentinelle-nav   au-dessus de l'écran, donc jamais visible : la
   *                    navigation prend son fond crème dès le départ et
   *                    reste lisible sur n'importe quelle image du film.
   *   sentinelle-hero  au bas de la section : la barre fixe n'apparaît
   *                    qu'après le vol, sans recouvrir « Passer la visite ».
   */
  return (
    <div className="relative">
      <div id="sentinelle-nav" className="absolute -top-4 h-px w-full" aria-hidden="true" />
      {calme || vol}
      <div id="sentinelle-hero" className="absolute bottom-0 h-px w-full" aria-hidden="true" />
    </div>
  )
}
