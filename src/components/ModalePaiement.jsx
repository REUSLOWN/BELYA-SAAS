import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ArrowUpRight, X } from 'lucide-react'
import { ACTIVATION, PAIEMENTS, fcfa, lienPaiement } from '../donnees'

/*
 * Règlement direct. Un clic sur un portefeuille ouvre la page de paiement
 * de l'opérateur — aucun passage par WhatsApp, aucun contact préalable.
 *
 * La destination vient de `lienPaiement()` : le lien propre au portefeuille
 * s'il existe, sinon la caisse de l'agrégateur avec l'opérateur pré-choisi.
 * Si rien n'est configuré, le portefeuille s'affiche comme indisponible
 * plutôt que de mener dans le vide.
 */
export default function ModalePaiement({ offre, onFermer }) {
  const racine = useRef(null)
  const boutonFermer = useRef(null)
  const focusPrecedent = useRef(null)

  useEffect(() => {
    focusPrecedent.current = document.activeElement
    const debordement = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    boutonFermer.current?.focus()

    const auClavier = (e) => {
      if (e.key === 'Escape') onFermer()
    }
    window.addEventListener('keydown', auClavier)

    const ctx = gsap.context(() => {
      gsap.from('[data-voile]', { opacity: 0, duration: 0.3, ease: 'power2.out' })
      gsap.from('[data-panneau]', { y: 40, opacity: 0, duration: 0.55, ease: 'power3.out' })
      gsap.from('[data-wallet]', {
        y: 18,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.08,
        delay: 0.1,
      })
    }, racine)

    return () => {
      window.removeEventListener('keydown', auClavier)
      document.body.style.overflow = debordement
      ctx.revert()
      focusPrecedent.current?.focus?.()
    }
  }, [onFermer])

  const regler = (moyen) => {
    const destination = lienPaiement(moyen, offre)
    if (destination) window.open(destination, '_blank', 'noopener,noreferrer')
  }

  const aucunMoyen = PAIEMENTS.every((moyen) => !lienPaiement(moyen, offre))

  return (
    <div
      ref={racine}
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-paiement"
    >
      <div
        data-voile
        onClick={onFermer}
        className="absolute inset-0 bg-encre/70 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div
        data-panneau
        className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-creme p-6 shadow-[0_-20px_80px_-30px_rgba(26,20,32,0.7)] sm:rounded-[2rem] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="micro text-aubergine">Offre {offre.nom}</p>
            <h2
              id="titre-paiement"
              className="mt-2 text-[1.7rem] font-extrabold leading-tight tracking-tresserre text-encre"
            >
              {ACTIVATION.titre}
            </h2>
          </div>

          <button
            ref={boutonFermer}
            onClick={onFermer}
            aria-label="Fermer"
            className="lift shrink-0 rounded-full border border-encre/15 p-2 text-encre/70 hover:text-encre"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 rounded-[1.25rem] border border-encre/12 bg-white/70 px-5 py-4">
          <p className="micro text-aubergine">{ACTIVATION.libelleMontant}</p>
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
            <span className="text-[2.1rem] font-extrabold tabular-nums tracking-tresserre text-encre">
              {fcfa(offre.mensuel)}
            </span>
            <span className="legende text-encre/65">pour le premier mois · {offre.cible}</span>
          </p>
        </div>

        <p className="legende mt-4 rounded-[1rem] border-l-2 border-magenta bg-aubergine/[0.07] px-4 py-3 text-encre/80">
          {ACTIVATION.rappel}
        </p>

        <p className="micro mt-7 text-aubergine">{ACTIVATION.etape1}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PAIEMENTS.map((moyen) => {
            const actif = Boolean(lienPaiement(moyen, offre))

            return (
              <button
                key={moyen.id}
                data-wallet
                onClick={() => regler(moyen)}
                disabled={!actif}
                aria-label={
                  actif
                    ? `Payer ${fcfa(offre.mensuel)} avec ${moyen.nom}`
                    : `${moyen.nom} — indisponible`
                }
                className={`group relative flex items-center gap-3 rounded-[1.25rem] border p-3.5 text-left transition-all duration-300 ${
                  actif
                    ? 'magnetique border-encre/12 bg-white/70 hover:border-magenta hover:shadow-[0_10px_30px_-18px_rgba(26,20,32,0.5)]'
                    : 'cursor-not-allowed border-encre/10 bg-white/30 opacity-50'
                }`}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.8rem] text-[13px] font-extrabold"
                  style={{ backgroundColor: moyen.fond, color: moyen.texte }}
                  aria-hidden="true"
                >
                  {moyen.sigle}
                </span>

                <span className="min-w-0 flex-1 text-[15px] font-semibold leading-tight tracking-serre text-encre">
                  {moyen.nom}
                </span>

                {actif && (
                  <ArrowUpRight
                    size={17}
                    strokeWidth={2.5}
                    className="shrink-0 text-encre/35 transition-colors duration-300 group-hover:text-magenta"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>

        <p className="legende mt-5 text-encre/60">
          {aucunMoyen ? ACTIVATION.indisponible : ACTIVATION.mention}
        </p>
      </div>
    </div>
  )
}
