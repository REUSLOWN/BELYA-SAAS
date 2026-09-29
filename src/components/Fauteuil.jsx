import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { FAUTEUIL, MEDIAS, fcfa, SCENE } from '../donnees'
import { mouvementReduit } from '../lib/mouvement'

/*
 * S2 — LE CRÉNEAU VIDE, PUIS REMPLI.
 *
 * La promesse du produit en une image : le même fauteuil, à la même
 * heure, vide puis occupé. Un rideau balaie l'écran de gauche à droite
 * et remplace la première scène par la seconde. Pas une ligne
 * d'explication n'est nécessaire — c'est justement l'intérêt.
 *
 * ────────────────────────────────────────────────────────────────────
 * LE PROBLÈME QUE CETTE SECTION POSE, ET SA SOLUTION
 * ────────────────────────────────────────────────────────────────────
 *
 * Un rideau suppose de SUPERPOSER deux panneaux et d'en masquer un.
 * Écrit naïvement, ça donne un `clip-path` dans le HTML — et si le
 * JavaScript ne charge pas, la moitié de la section reste invisible à
 * jamais. C'est le piège exact que le système de mouvement interdit.
 *
 * On fait donc l'inverse : le HTML pré-rendu place les deux panneaux
 * L'UN SOUS L'AUTRE, dans le flux normal. Les deux se lisent, sans
 * JavaScript, sans animation, dans l'ordre du récit. C'est seulement
 * une fois le JavaScript en place, et seulement si le mouvement est
 * autorisé, qu'on bascule en mode superposé pour jouer le rideau.
 *
 * La section est donc complète trois fois : sans JavaScript, sans
 * mouvement, et sans aucune photo.
 */

export default function Fauteuil() {
  const racine = useRef(null)
  const rideau = useRef(null)

  /*
   * `false` = flux normal, les deux panneaux empilés. C'est l'état du
   * pré-rendu, donc l'état que voit quiconque n'exécute pas le script.
   * On ne passe en superposé qu'après montage, et jamais en mouvement
   * réduit : superposer sans animer laisserait un panneau caché.
   */
  const [superpose, setSuperpose] = useState(false)

  useEffect(() => {
    if (!mouvementReduit()) setSuperpose(true)
  }, [])

  useEffect(() => {
    if (!superpose) return

    const ctx = gsap.context(() => {
      /*
       * Le rideau. `inset(0 0 0 100%)` = entièrement rogné par la
       * gauche ; à 0 %, le panneau occupe tout. Le balayage est lié au
       * défilement (`scrub`), donc c'est le doigt qui le commande — on
       * peut revenir en arrière et regarder deux fois.
       */
      gsap.fromTo(
        rideau.current,
        { clipPath: 'inset(0 0 0 100%)' },
        {
          clipPath: 'inset(0 0 0 0%)',
          ease: 'none',
          scrollTrigger: {
            trigger: racine.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
          },
        },
      )

      // Le trait de progression, sous les deux panneaux : on sait
      // toujours où l'on en est dans le balayage.
      gsap.fromTo(
        '[data-jauge]',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          transformOrigin: 'left center',
          scrollTrigger: {
            trigger: racine.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
          },
        },
      )
    }, racine)

    return () => ctx.revert()
  }, [superpose])

  // ── Mode empilé : le flux normal, deux panneaux qui se lisent ──────
  if (!superpose) {
    return (
      <section id="fauteuil" className="bg-creme">
        <Panneau etat={FAUTEUIL.avant} media={MEDIAS.fauteuilVide} />
        <Panneau etat={FAUTEUIL.apres} media={MEDIAS.fauteuilOccupe} sombre />
      </section>
    )
  }

  // ── Mode superposé : le rideau ─────────────────────────────────────
  return (
    <section
      id="fauteuil"
      ref={racine}
      /*
       * Deux écrans et demi de course. C'est la distance pendant
       * laquelle la scène reste collée en haut : assez pour que le
       * balayage soit un geste, pas un clic.
       */
      className="relative h-[250vh] bg-creme"
    >
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <Panneau etat={FAUTEUIL.avant} media={MEDIAS.fauteuilVide} plein />

        <div ref={rideau} className="absolute inset-0">
          <Panneau
            etat={FAUTEUIL.apres}
            media={MEDIAS.fauteuilOccupe}
            sombre
            plein
          />
        </div>

        {/* Le trait de progression. */}
        <div
          className="absolute inset-x-0 bottom-0 h-[3px] bg-encre/10"
          aria-hidden="true"
        >
          <div data-jauge className="h-full w-full origin-left bg-magenta" />
        </div>
      </div>
    </section>
  )
}

/*
 * Un panneau : le surtitre de l'heure, le titre en deux chasses, une
 * phrase, et la photo quand elle existe.
 *
 * Sans photo, la colonne de droite reçoit une composition typographique
 * — le montant en jeu, très grand. Ce n'est pas un bouche-trou : c'est
 * le chiffre dont parle toute la page, et il se tient mieux qu'une
 * image d'illustration générique.
 */
function Panneau({ etat, media, sombre = false, plein = false }) {
  const fond = sombre ? 'bg-encre text-creme' : 'bg-creme text-encre'
  const accent = sombre ? 'text-magenta-clair' : 'text-magenta'
  const trait = sombre ? 'bg-magenta-clair' : 'bg-magenta'
  const secondaire = sombre ? 'text-creme/70' : 'text-encre/70'

  return (
    <div
      className={`${fond} ${
        plein ? 'absolute inset-0 flex items-center' : 'flex items-center py-24 sm:py-32'
      } w-full px-6 sm:px-10 lg:px-16`}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className={`micro flex items-center gap-4 ${accent}`}>
            <span className={`h-px w-10 shrink-0 ${trait}`} aria-hidden="true" />
            {FAUTEUIL.surtitre}
          </p>

          <h2 className="mt-8 text-[clamp(1.9rem,5vw,3.2rem)] font-extrabold leading-[1.05] tracking-tresserre">
            {etat.titreSans}
            <span className={`block font-drama italic ${accent}`}>
              {etat.titreSerif}
            </span>
          </h2>

          <p className={`mt-7 max-w-md text-[1.05rem] leading-relaxed ${secondaire}`}>
            {etat.texte}
          </p>
        </div>

        {media ? (
          <img
            src={media}
            alt={FAUTEUIL.alternative}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full rounded-2xl object-cover"
          />
        ) : (
          <div
            className={`flex aspect-[4/5] w-full items-center justify-center rounded-2xl border ${
              sombre ? 'border-creme/15' : 'border-encre/10'
            }`}
          >
            <p
              className={`montant-perte font-drama italic ${accent}`}
              aria-hidden="true"
            >
              {fcfa(SCENE.gain)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
