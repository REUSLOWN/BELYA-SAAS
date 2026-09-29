import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown } from 'lucide-react'
import { HERO, VIDEO_HERO } from '../donnees'
import { glisserVers } from '../lib/defilement'
import Bouton from './Bouton'

/*
 * LE HERO CINÉMATIQUE.
 *
 * Le principe, celui des pages produit d'Apple : la section se fige à
 * l'écran, et le défilement ne fait plus avancer la page — il avance la
 * VIDÉO, image par image. On ne regarde pas un film, on le déroule. Le
 * texte se compose par-dessus au fil des secondes. Quand la vidéo est
 * terminée, la page reprend son cours normal.
 *
 * ────────────────────────────────────────────────────────────────────
 * TROIS DÉCISIONS QUI TIENNENT TOUT
 * ────────────────────────────────────────────────────────────────────
 *
 * 1. LA PAGE EST ENTIÈRE SANS LA VIDÉO.
 *    `VIDEO_HERO.fichier` vide ⇒ on affiche la composition typographique
 *    seule, qui reste le meilleur élément de la marque. Aucun trou,
 *    aucun cadre noir, aucune erreur de console. La vidéo est un bonus,
 *    jamais une dépendance.
 *
 * 2. LA VIDÉO NE PART QUE SI LA CONNEXION LA SUPPORTE.
 *    Une vidéo scrubbable pèse 4 à 12 Mo. Sur la 3G d'Abidjan, chez une
 *    gérante qui paie son forfait au méga-octet, la télécharger serait
 *    une faute — et c'est précisément la personne qu'on veut convaincre.
 *    On lit `navigator.connection` : en 2g/3g ou en mode économie de
 *    données, on ne la demande même pas.
 *
 * 3. LE TEXTE NE DÉPEND JAMAIS DE LA VIDÉO.
 *    Il est dans le HTML pré-rendu, lisible au premier paquet. La vidéo
 *    se glisse DERRIÈRE lui quand elle arrive.
 */

export default function HeroCinema() {
  const racine = useRef(null)
  const video = useRef(null)
  const [videoPrete, setVideoPrete] = useState(false)

  // ── La vidéo mérite-t-elle d'être chargée ? ────────────────────────
  useEffect(() => {
    if (!VIDEO_HERO.fichier) return

    const lien = navigator.connection || navigator.mozConnection
    if (lien) {
      const lente = ['slow-2g', '2g', '3g'].includes(lien.effectiveType)
      if (lente || lien.saveData) return // on s'abstient, délibérément
    }

    const v = video.current
    if (!v) return

    const prete = () => setVideoPrete(true)
    v.addEventListener('loadeddata', prete, { once: true })
    v.src = VIDEO_HERO.fichier
    v.load()

    return () => v.removeEventListener('loadeddata', prete)
  }, [])

  // ── Le défilement pilote la scène ─────────────────────────────────
  useEffect(() => {
    const doux = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      /*
       * Mouvement réduit : on ne fige rien et on n'anime rien. Le hero
       * redevient une section normale, entièrement lisible. C'est la
       * bonne réponse — pas une version dégradée, une version calme.
       */
      if (doux) return

      // Le titre glisse sans jamais passer par l'opacité 0 : il est
      // pré-rendu, donc déjà à l'écran. Le faire disparaître pour le
      // faire revenir serait un clignotement, pas une animation.
      gsap.from('[data-entree]', {
        y: 46,
        duration: 1.25,
        ease: 'power3.out',
        stagger: 0.09,
        delay: 0.1,
      })

      const v = video.current

      const chrono = gsap.timeline({
        scrollTrigger: {
          trigger: racine.current,
          start: 'top top',
          // La distance de défilement pendant laquelle la section reste
          // figée. Proportionnelle à la durée de la vidéo : une seconde
          // de film pour un écran de défilement.
          end: () => `+=${window.innerHeight * VIDEO_HERO.ecrans}`,
          pin: true,
          scrub: 0.6,
          // Sans vidéo, on fige beaucoup moins : il n'y a rien à
          // dérouler, seulement la composition à faire respirer.
          invalidateOnRefresh: true,
        },
      })

      // La vidéo se déroule au doigt : on n'appelle jamais play(), on
      // déplace `currentTime`. C'est ce qui donne le contrôle total.
      if (v) {
        chrono.to(
          { t: 0 },
          {
            t: 1,
            ease: 'none',
            onUpdate() {
              if (!v.duration) return
              v.currentTime = v.duration * this.targets()[0].t
            },
          },
          0,
        )
      }

      // Le texte se retire pendant que l'image prend toute la place.
      chrono
        .to('[data-titre]', { y: -70, opacity: 0.12, ease: 'none' }, 0)
        .to('[data-secondaire]', { y: -40, opacity: 0, ease: 'none' }, 0)
        // Le voile s'épaissit : le texte reste lisible jusqu'au bout.
        .to('[data-voile]', { opacity: 0.82, ease: 'none' }, 0)
        // Les chiffres montent en dernier, seuls sur l'image.
        .fromTo(
          '[data-chiffre]',
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, ease: 'none', stagger: 0.12 },
          0.45,
        )
    }, racine)

    return () => ctx.revert()
  }, [videoPrete])

  return (
    <section
      ref={racine}
      className="relative flex min-h-[100dvh] w-full items-center overflow-hidden bg-creme"
    >
      {/* ── Le film, derrière tout ── */}
      {VIDEO_HERO.fichier && (
        <video
          ref={video}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            videoPrete ? 'opacity-100' : 'opacity-0'
          }`}
          muted
          playsInline
          preload="none"
          poster={VIDEO_HERO.affiche || undefined}
          aria-hidden="true"
        />
      )}

      {/*
        Le voile. Crème dense en bas, transparent en haut : le texte pose
        sur une matière, pas sur un rectangle gris. C'est ce détail qui
        sépare une page soignée d'une page où l'on a « mis une vidéo ».
      */}
      <div
        data-voile
        className="absolute inset-0"
        style={{
          background: videoPrete
            ? 'linear-gradient(180deg, rgba(250,246,244,0.94) 0%, rgba(250,246,244,0.72) 38%, rgba(250,246,244,0.88) 100%)'
            : 'transparent',
          opacity: videoPrete ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* ── La composition ── */}
      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 lg:px-16">
        <div className="max-w-4xl">
          <p
            data-entree
            className="micro flex items-center gap-4 text-aubergine"
          >
            <span className="h-px w-10 shrink-0 bg-magenta" aria-hidden="true" />
            {HERO.surtitre}
          </p>

          <h1 data-titre className="mt-9 text-encre">
            <span
              data-entree
              className="block text-[clamp(1.5rem,4.4vw,2.9rem)] font-extrabold leading-[1.08] tracking-tresserre"
            >
              {HERO.titreSans}
            </span>
            <span
              data-entree
              className="mt-1 block font-drama text-[clamp(4.5rem,15.5vw,11rem)] italic leading-[0.82] tracking-[-0.02em] text-magenta"
            >
              {HERO.titreSerif}
            </span>
          </h1>

          <div data-secondaire>
            <p
              data-entree
              className="mt-10 max-w-xl text-[1.05rem] leading-relaxed text-encre/75"
            >
              {HERO.chapo}
            </p>

            <div
              data-entree
              className="mt-11 flex flex-wrap items-center gap-3"
            >
              <Bouton taille="grand" onClick={() => glisserVers('calculateur')}>
                {HERO.cta}
              </Bouton>
              <Bouton
                variante="contourSombre"
                taille="grand"
                onClick={() => glisserVers('methode')}
              >
                {HERO.ctaSecondaire}
              </Bouton>
            </div>
          </div>

          {/*
            Les trois chiffres. Ils restent quand le reste s'efface : ce
            sont eux qui doivent rester à l'écran sur l'image du salon.
          */}
          <ul className="mt-12 flex flex-wrap items-baseline gap-x-8 gap-y-3">
            {HERO.stats.map((stat) => (
              <li
                key={stat}
                data-chiffre
                className="legende font-semibold tracking-serre text-aubergine"
              >
                {stat}
              </li>
            ))}
          </ul>

          <button
            data-entree
            onClick={() => glisserVers('calculateur')}
            className="micro lift mt-16 hidden w-fit items-center gap-3 text-aubergine/70 hover:text-aubergine lg:flex"
          >
            <ArrowDown
              size={14}
              className="animate-bounce text-magenta"
              aria-hidden="true"
            />
            Ce que vous perdez, en chiffres
          </button>
        </div>
      </div>

      <div id="sentinelle-hero" className="absolute bottom-0 h-px w-full" />
    </section>
  )
}
