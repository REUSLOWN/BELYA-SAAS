import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROTOCOLE } from '../donnees'

/* ---- Motif 1 : anneaux concentriques en rotation lente ---- */
function MotifAnneaux() {
  const racine = useRef(null)

  useEffect(() => {
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
function MotifBalayage() {
  const racine = useRef(null)
  const colonnes = 14
  const rangees = 14

  useEffect(() => {
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
function MotifOnde() {
  const racine = useRef(null)
  const trace =
    'M0 160 L58 160 L72 160 L84 116 L98 208 L112 142 L126 160 L188 160 L200 160 L212 128 L224 190 L236 160 L320 160'

  useEffect(() => {
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

const MOTIFS = [MotifAnneaux, MotifBalayage, MotifOnde]

export default function Protocole() {
  const racine = useRef(null)

  useEffect(() => {
    let mm
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia()

      // L'empilement n'a de sens qu'au-dessus du pli desktop.
      mm.add('(min-width: 1024px)', () => {
        const cartes = gsap.utils.toArray('[data-carte-protocole]', racine.current)

        cartes.forEach((carte, i) => {
          ScrollTrigger.create({
            trigger: carte,
            start: 'top top',
            end: 'bottom top',
            pin: true,
            pinSpacing: false,
          })

          if (i < cartes.length - 1) {
            gsap.to(carte, {
              scale: 0.9,
              filter: 'blur(20px)',
              opacity: 0.5,
              ease: 'none',
              scrollTrigger: {
                trigger: cartes[i + 1],
                start: 'top bottom',
                end: 'top top',
                scrub: true,
              },
            })
          }
        })
      })
    }, racine)

    return () => {
      mm?.revert()
      ctx.revert()
    }
  }, [])

  return (
    <section id="protocole" ref={racine} className="relative bg-encre">
      {PROTOCOLE.map((etape, i) => {
        const Motif = MOTIFS[i]
        return (
          <div
            key={etape.numero}
            data-carte-protocole
            className="flex min-h-screen w-full items-center overflow-hidden border-t border-creme/10 bg-encre px-6 py-20 sm:px-10 lg:px-16"
          >
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
                <Motif />
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}
