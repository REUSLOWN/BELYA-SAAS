import { Fragment, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MANIFESTE, MEDIAS, PROTOCOLE } from '../donnees'
import { basculerFond, mouvementReduit, reveler } from '../lib/mouvement'

/*
 * S5 — LES TROIS MÉCANIQUES.
 *
 * Cette section remplace à elle seule les anciennes « Philosophie » et
 * « Protocole », et la partie de « Fonctionnalités » que la démo et le
 * tableau de bord disaient déjà. Trois sections disaient la même chose
 * trois fois ; une seule la dit une fois, et bien.
 *
 * Le manifeste ouvre — c'est le POURQUOI, en quatre lignes. Puis les
 * trois mécaniques défilent HORIZONTALEMENT sous un doigt qui continue
 * de descendre : la page se fige, et le défilement vertical devient un
 * déplacement latéral.
 *
 * ────────────────────────────────────────────────────────────────────
 * POURQUOI L'HORIZONTAL ICI, ET NULLE PART AILLEURS
 * ────────────────────────────────────────────────────────────────────
 *
 * Le défilement horizontal est un effet qu'on voit sur les sites primés
 * et qu'on regrette partout ailleurs : il casse la recherche dans la
 * page, il perd le clavier, il déroute. Il n'a de sens que pour un
 * contenu qui EST une séquence — 01, 02, 03 — où l'on veut qu'on sente
 * qu'on avance d'une étape à la suivante plutôt que de faire défiler du
 * texte. C'est le cas exact ici, et c'est le seul de la page.
 *
 * Et seulement sur grand écran. Sur mobile, les trois mécaniques sont
 * des cartes empilées : c'est le CSS qui fait la mise en page (flex-col
 * puis lg:flex-row) et GSAP ne fait que translater la piste. Sans
 * JavaScript, ou en mouvement réduit, la piste reste en place et les
 * trois panneaux se lisent à la suite, horizontalement débordants mais
 * intégralement présents — aucun texte n'est perdu.
 */

/* ---- Motif 1 : anneaux concentriques en rotation lente ---- */
function MotifAnneaux({ actif }) {
  const racine = useRef(null)

  useEffect(() => {
    if (mouvementReduit()) return

    const ctx = gsap.context((self) => {
      self.selector('[data-anneau]').forEach((anneau, i) => {
        gsap.to(anneau, {
          rotation: i % 2 === 0 ? 360 : -360,
          duration: 30 + i * 11,
          ease: 'none',
          repeat: -1,
          transformOrigin: '50% 50%',
        })
      })
    }, racine)
    return () => ctx.revert()
  }, [])

  useAnimationSuspendue(racine, actif)

  return (
    <svg ref={racine} viewBox="0 0 320 320" className="h-full w-full" aria-hidden="true">
      {[
        { r: 148, dash: '3 13' },
        { r: 116, dash: '28 9' },
        { r: 84, dash: '2 9' },
        { r: 52, dash: '48 14' },
      ].map((anneau, i) => (
        <circle
          key={anneau.r}
          data-anneau
          cx="160"
          cy="160"
          r={anneau.r}
          fill="none"
          stroke={i === 1 ? '#E8447F' : '#FAF6F4'}
          strokeOpacity={i === 1 ? 0.75 : 0.3}
          strokeWidth="1.2"
          strokeDasharray={anneau.dash}
        />
      ))}
      <circle cx="160" cy="160" r="4" fill="#E8447F" />
    </svg>
  )
}

/* ---- Motif 2 : ligne laser balayant une grille de points ---- */
function MotifBalayage({ actif }) {
  const racine = useRef(null)
  const colonnes = 14
  const rangees = 14

  useEffect(() => {
    if (mouvementReduit()) return

    const ctx = gsap.context((self) => {
      const laser = self.selector('[data-laser]')[0]
      gsap.fromTo(
        laser,
        { attr: { y1: 18, y2: 18 }, opacity: 0 },
        {
          attr: { y1: 302, y2: 302 },
          opacity: 1,
          duration: 3.4,
          ease: 'power1.inOut',
          repeat: -1,
          repeatDelay: 0.5,
          yoyo: true,
        },
      )
    }, racine)
    return () => ctx.revert()
  }, [])

  useAnimationSuspendue(racine, actif)

  return (
    <svg ref={racine} viewBox="0 0 320 320" className="h-full w-full" aria-hidden="true">
      {Array.from({ length: rangees }).map((_, r) =>
        Array.from({ length: colonnes }).map((__, c) => (
          <circle
            key={`${r}-${c}`}
            cx={18 + c * 22}
            cy={18 + r * 22}
            r="1.6"
            fill="#FAF6F4"
            fillOpacity="0.26"
          />
        )),
      )}
      <line
        data-laser
        x1="6"
        x2="314"
        y1="18"
        y2="18"
        stroke="#E8447F"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ---- Motif 3 : onde pulsée type ECG, tracée au stroke-dashoffset ---- */
function MotifOnde({ actif }) {
  const racine = useRef(null)
  const trace =
    'M0 160 L58 160 L72 160 L84 116 L98 208 L112 142 L126 160 L188 160 L200 160 L212 128 L224 190 L236 160 L320 160'

  useEffect(() => {
    if (mouvementReduit()) return

    const ctx = gsap.context((self) => {
      const chemin = self.selector('[data-onde]')[0]
      const longueur = chemin.getTotalLength()

      gsap.set(chemin, { strokeDasharray: longueur, strokeDashoffset: longueur })
      gsap.to(chemin, {
        strokeDashoffset: 0,
        duration: 2.6,
        ease: 'power2.inOut',
        repeat: -1,
        repeatDelay: 0.7,
      })

      gsap.to(self.selector('[data-halo]'), {
        scale: 1.35,
        opacity: 0,
        duration: 2,
        ease: 'power2.out',
        repeat: -1,
        transformOrigin: '50% 50%',
      })
    }, racine)
    return () => ctx.revert()
  }, [])

  useAnimationSuspendue(racine, actif)

  return (
    <svg ref={racine} viewBox="0 0 320 320" className="h-full w-full" aria-hidden="true">
      <circle
        data-halo
        cx="160"
        cy="160"
        r="72"
        fill="none"
        stroke="#E8447F"
        strokeOpacity="0.45"
        strokeWidth="1.2"
      />
      <path d={trace} fill="none" stroke="#FAF6F4" strokeOpacity="0.16" strokeWidth="1.4" />
      <path
        data-onde
        d={trace}
        fill="none"
        stroke="#E8447F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/*
 * Les trois motifs tournent en boucle infinie. Hors de l'écran, c'est de
 * la batterie brûlée pour personne — et sur l'Android milieu de gamme de
 * la gérante, trois boucles SVG qui tournent dans le pied de page se
 * sentent. On les suspend donc dès que la section sort du champ.
 *
 * ScrollTrigger ne peut pas s'en charger ici : les motifs vivent dans une
 * piste translatée horizontalement, dont il lit mal la position. C'est
 * donc la section parente qui dit « actif », et chaque motif met ses
 * propres tweens en pause.
 */
function useAnimationSuspendue(racine, actif) {
  useEffect(() => {
    const element = racine.current
    if (!element) return

    // `getTweensOf` ne regarde qu'une cible : on balaie les enfants
    // animés, qui sont les seuls que ces motifs touchent.
    const cibles = element.querySelectorAll('[data-anneau], [data-laser], [data-onde], [data-halo]')
    cibles.forEach((cible) => {
      gsap.getTweensOf(cible).forEach((tween) => {
        actif ? tween.play() : tween.pause()
      })
    })
  }, [racine, actif])
}

const MOTIFS = [MotifAnneaux, MotifBalayage, MotifOnde]

export default function Mecaniques() {
  const section = useRef(null)
  const cadre = useRef(null)
  const piste = useRef(null)
  const bande = useRef(null)

  // Les boucles des motifs ne tournent que sous les yeux de quelqu'un.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let mm
    const ctx = gsap.context(() => {
      reveler('[data-manifeste]', { declencheur: section.current })
      basculerFond(section.current, { sombre: true })

      ScrollTrigger.create({
        trigger: section.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => setVisible(self.isActive),
      })

      if (mouvementReduit()) return

      mm = gsap.matchMedia()

      /*
       * Le défilement horizontal, sur grand écran seulement.
       *
       * `end` est recalculé à chaque rafraîchissement (`invalidateOnRefresh`)
       * parce que la largeur de la piste dépend des polices : mesurée avant
       * que Cormorant soit chargé, elle est fausse de plusieurs centaines de
       * pixels et la dernière mécanique n'est jamais atteinte.
       */
      mm.add('(min-width: 1024px)', () => {
        const course = () => piste.current.scrollWidth - window.innerWidth

        const glissement = gsap.to(piste.current, {
          x: () => -course(),
          ease: 'none',
          scrollTrigger: {
            trigger: cadre.current,
            start: 'top top',
            end: () => `+=${course()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })

        // Le bandeau photographique respire verticalement pendant que la
        // piste avance : deux mouvements perpendiculaires, donc une
        // sensation de profondeur plutôt qu'un simple carrousel.
        if (bande.current) {
          gsap.fromTo(
            bande.current,
            { yPercent: -12 },
            {
              yPercent: 12,
              ease: 'none',
              scrollTrigger: {
                trigger: cadre.current,
                start: 'top top',
                end: () => `+=${course()}`,
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          )
        }

        return () => glissement.scrollTrigger?.kill()
      })
    }, section)

    return () => {
      mm?.revert()
      ctx.revert()
    }
  }, [])

  return (
    <section id="protocole" ref={section} className="bg-encre text-creme">
      {/* ── Le pourquoi, avant le comment ── */}
      <div className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <p data-manifeste className="text-[1.05rem] leading-relaxed text-creme/55">
            {MANIFESTE.commun}
          </p>

          <h2
            data-manifeste
            className="mt-8 text-[clamp(1.9rem,5vw,3.2rem)] font-extrabold leading-[1.05] tracking-tresserre"
          >
            {MANIFESTE.notreSans}
            <span className="block font-drama italic text-magenta-clair">
              {MANIFESTE.notreSerifAvant} {MANIFESTE.notreSerifApres}
            </span>
          </h2>

          <p
            data-manifeste
            className="mt-8 max-w-2xl border-l-2 border-magenta-clair pl-6 text-[1.05rem] leading-relaxed text-creme/75"
          >
            {MANIFESTE.appui}
          </p>
        </div>
      </div>

      {/* ── Les trois mécaniques ── */}
      <div ref={cadre} className="relative lg:h-[100dvh] lg:overflow-hidden">
        <div
          ref={piste}
          className="flex flex-col lg:h-full lg:flex-row lg:flex-nowrap lg:will-change-transform"
        >
          {PROTOCOLE.map((etape, i) => (
            /*
              Un fragment, pas un div : un conteneur intermédiaire
              deviendrait l'élément flexible de la piste et les panneaux
              cesseraient de faire 100 vw chacun.
            */
            <Fragment key={etape.numero}>
              <Panneau etape={etape} Motif={MOTIFS[i]} actif={visible} />

              {/*
                Le bandeau photographique, entre 02 et 03. Sans photo, il
                n'existe pas : on n'affiche jamais un panneau vide pour
                tenir une maquette.
              */}
              {i === 1 && MEDIAS.mains && (
                <div className="relative w-full overflow-hidden lg:h-full lg:w-[42vw] lg:shrink-0">
                  <img
                    ref={bande}
                    src={MEDIAS.mains}
                    alt="Des mains tressent les cheveux d’une cliente."
                    loading="lazy"
                    decoding="async"
                    className="h-[132%] w-full object-cover lg:-mt-[16%]"
                  />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}

function Panneau({ etape, Motif, actif }) {
  return (
    <div className="flex w-full shrink-0 items-center border-t border-creme/10 px-6 py-20 sm:px-10 lg:h-full lg:w-screen lg:border-t-0 lg:px-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <div className="flex items-center gap-5">
            <span className="text-[3.2rem] font-extrabold leading-none tabular-nums tracking-tresserre text-magenta-clair">
              {etape.numero}
            </span>
            <span className="micro text-creme/75">{etape.etiquette}</span>
          </div>

          <h3 className="mt-8 font-drama text-[clamp(3.2rem,10vw,7rem)] italic leading-[0.88] tracking-[-0.02em] text-creme">
            {etape.titre}
          </h3>

          <div className="mt-8 max-w-lg space-y-3">
            {etape.lignes.map((ligne) => (
              <p key={ligne} className="text-[1rem] leading-relaxed text-creme/75">
                {ligne}
              </p>
            ))}
          </div>

          <p className="micro mt-8 inline-block rounded-full border border-magenta-clair/50 bg-magenta-clair/10 px-4 py-2.5 text-creme/85">
            {etape.exigence}
          </p>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[380px] rounded-[2.5rem] border border-creme/10 bg-creme/[0.03] p-8">
          <Motif actif={actif} />
        </div>
      </div>
    </div>
  )
}
