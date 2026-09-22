import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ArrowRight, Check, X } from 'lucide-react'
import { ACTIVATION, CHECKOUT_URL, PAIEMENTS, fcfa, lienWhatsApp } from '../donnees'
import Bouton from './Bouton'

/*
 * Choix du portefeuille mobile puis règlement immédiat de l'offre.
 *
 * Tant que CHECKOUT_URL est vide — c'est-à-dire tant que le RCCM et le compte
 * marchand agrégateur ne sont pas ouverts (cahier, section 11, phase G) — le
 * choix part sur WhatsApp avec l'offre, le montant et le wallet pré-remplis.
 * Dès que la constante porte une URL, le même bouton va au checkout.
 */
export default function ModalePaiement({ offre, onFermer }) {
  const [choisi, setChoisi] = useState(null)
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

  const wallet = PAIEMENTS.find((p) => p.id === choisi)

  const partir = () => {
    if (!wallet) return

    const destination = CHECKOUT_URL
      ? `${CHECKOUT_URL}${CHECKOUT_URL.includes('?') ? '&' : '?'}offre=${encodeURIComponent(
          offre.nom,
        )}&wallet=${encodeURIComponent(wallet.id)}`
      : lienWhatsApp(
          `Bonjour, je souhaite activer mon compte Belya.\n` +
            `Offre : ${offre.nom} (${offre.cible}).\n` +
            `Montant à régler : ${fcfa(offre.mensuel)} pour le premier mois.\n` +
            `Moyen de paiement : ${wallet.nom}.`,
        )

    window.open(destination, '_blank', 'noopener,noreferrer')
  }

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
            <span className="legende text-encre/65">
              pour le premier mois · {offre.cible}
            </span>
          </p>
        </div>

        <p className="legende mt-4 rounded-[1rem] border-l-2 border-magenta bg-aubergine/[0.07] px-4 py-3 text-encre/80">
          {ACTIVATION.rappel}
        </p>

        <p className="micro mt-7 text-aubergine">{ACTIVATION.etape1}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {PAIEMENTS.map((moyen) => {
            const actif = choisi === moyen.id
            return (
              <button
                key={moyen.id}
                data-wallet
                onClick={() => setChoisi(moyen.id)}
                aria-pressed={actif}
                className={`magnetique relative flex items-center gap-3 rounded-[1.25rem] border p-3.5 text-left transition-colors duration-300 ${
                  actif
                    ? 'border-magenta bg-white shadow-[0_10px_30px_-18px_rgba(26,20,32,0.5)] ring-2 ring-magenta'
                    : 'border-encre/12 bg-white/60 hover:border-encre/25'
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
                  <Check size={16} strokeWidth={3} className="shrink-0 text-magenta" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>

        <Bouton taille="grand" className="mt-7 w-full" onClick={partir} desactive={!wallet}>
          <span className="inline-flex items-center gap-2">
            {CHECKOUT_URL ? ACTIVATION.boutonCheckout : ACTIVATION.bouton}
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </Bouton>

        {!wallet && (
          <p className="legende mt-3 text-center text-encre/60">
            Sélectionnez d’abord un moyen de paiement.
          </p>
        )}

        <p className="legende mt-5 text-encre/60">{ACTIVATION.mention}</p>
      </div>
    </div>
  )
}
