import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { IMAGES, MANIFESTE } from '../donnees'

/* Découpe un texte en mots animables un par un. */
function Mots({ texte, className = '' }) {
  return texte.split(' ').map((mot, i) => (
    <span key={`${mot}-${i}`} data-mot className={`inline-block ${className}`}>
      {mot}
      {' '}
    </span>
  ))
}

export default function Philosophie() {
  const racine = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('[data-parallaxe]', {
        yPercent: 16,
        ease: 'none',
        scrollTrigger: {
          trigger: racine.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.from('[data-mot]', {
        y: 30,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '[data-declaration]', start: 'top 78%' },
      })

      gsap.from('[data-appui]', {
        y: 26,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-appui]', start: 'top 88%' },
      })
    }, racine)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={racine}
      className="relative overflow-hidden bg-encre px-6 py-28 sm:px-10 sm:py-36 lg:px-16"
    >
      {/* Texture organique en parallaxe, chargée en différé à 9 % d'opacité. */}
      <img
        data-parallaxe
        src={IMAGES.texture}
        alt=""
        aria-hidden="true"
        width="1200"
        height="800"
        className="pointer-events-none absolute inset-x-0 -top-[10%] h-[125%] w-full object-cover opacity-[0.09]"
        loading="lazy"
        decoding="async"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-encre via-transparent to-encre" />

      <div className="relative mx-auto max-w-5xl">
        <p className="micro text-creme/75">Le parti pris</p>

        <div data-declaration className="mt-12">
          <p className="max-w-2xl text-[1.1rem] leading-relaxed text-creme/60">
            <Mots texte={MANIFESTE.commun} />
          </p>

          <p className="mt-10 font-drama text-[clamp(2.4rem,7.5vw,5.6rem)] italic leading-[0.98] tracking-[-0.015em] text-creme">
            <Mots texte={MANIFESTE.notreSans} />
            <Mots texte={MANIFESTE.notreSerifAvant} className="text-magenta-clair" />
            <Mots texte={MANIFESTE.notreSerifApres} />
          </p>
        </div>

        <blockquote
          data-appui
          className="mt-16 max-w-xl border-l-2 border-magenta-clair pl-6 text-[1rem] leading-relaxed text-creme/70"
        >
          {MANIFESTE.appui}
        </blockquote>
      </div>
    </section>
  )
}
