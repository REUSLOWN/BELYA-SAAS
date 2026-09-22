import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ArrowDown } from 'lucide-react'
import { HERO, allerA } from '../donnees'
import Bouton from './Bouton'

/*
 * Direction Tech Organique : fond crème, aucune photo derrière le titre.
 * Le contraste vient de l'échelle typographique, pas d'un voile sombre.
 */
export default function Hero() {
  const racine = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-anim="entree"]', {
        y: 40,
        opacity: 0,
        duration: 1.15,
        ease: 'power3.out',
        stagger: 0.08,
        delay: 0.15,
      })
    }, racine)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={racine}
      className="relative flex min-h-[100dvh] w-full items-center overflow-hidden bg-creme px-6 pb-20 pt-32 sm:px-10 sm:pt-36 lg:px-16"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-4xl">
          <p data-anim="entree" className="micro flex items-center gap-4 text-aubergine">
            <span className="h-px w-10 shrink-0 bg-magenta" aria-hidden="true" />
            {HERO.surtitre}
          </p>

          <h1 className="mt-9 text-encre">
            <span
              data-anim="entree"
              className="block text-[clamp(1.5rem,4.4vw,2.9rem)] font-extrabold leading-[1.08] tracking-tresserre"
            >
              {HERO.titreSans}
            </span>
            <span
              data-anim="entree"
              className="mt-1 block font-drama text-[clamp(4.5rem,15.5vw,11rem)] italic leading-[0.82] tracking-[-0.02em] text-magenta"
            >
              {HERO.titreSerif}
            </span>
          </h1>

          <p
            data-anim="entree"
            className="mt-10 max-w-xl text-[1.05rem] leading-relaxed text-encre/75"
          >
            {HERO.chapo}
          </p>

          <div
            data-anim="entree"
            className="legende mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-semibold text-aubergine"
          >
            {HERO.stats.map((stat, i) => (
              <span key={stat} className="flex items-center gap-4">
                {i > 0 && (
                  <span className="text-magenta" aria-hidden="true">
                    ·
                  </span>
                )}
                {stat}
              </span>
            ))}
          </div>

          <div data-anim="entree" className="mt-11 flex flex-wrap items-center gap-3">
            <Bouton taille="grand" onClick={() => allerA('calculateur')}>
              {HERO.cta}
            </Bouton>
            <Bouton variante="contourSombre" taille="grand" onClick={() => allerA('methode')}>
              {HERO.ctaSecondaire}
            </Bouton>
          </div>

          <button
            data-anim="entree"
            onClick={() => allerA('calculateur')}
            className="micro lift mt-16 hidden w-fit items-center gap-3 text-aubergine/70 hover:text-aubergine lg:flex"
          >
            <ArrowDown size={14} className="animate-bounce text-magenta" aria-hidden="true" />
            Ce que vous perdez, en chiffres
          </button>
        </div>
      </div>

      {/* Repère invisible : la navbar se pose dès qu'il sort du champ. */}
      <div id="sentinelle-hero" className="absolute bottom-0 h-px w-full" />
    </section>
  )
}
