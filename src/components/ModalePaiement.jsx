import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ArrowUpRight, X } from 'lucide-react'
import {
  ACTIVATION,
  GARANTIE,
  PAIEMENTS,
  fcfa,
  lienInscription,
  lienWhatsApp,
} from '../donnees'
import { COURBE_TOUCHE, DUREE_TOUCHE, mouvementReduit } from '../lib/mouvement'

/*
 * Deux chemins, dans cet ordre.
 *
 *   1. **WhatsApp**, en principal : le message part déjà écrit, avec
 *      l'offre et le montant. C'est le canal que les gérantes d'Abidjan
 *      utilisent déjà, et il ne demande ni compte ni mot de passe.
 *   2. **L'inscription en ligne**, en secondaire, quand APP_URL est
 *      renseignée.
 *
 * Chaque bouton disparaît si sa destination n'est pas configurée : un
 * bouton grisé n'apprend rien à personne. Si les deux manquent, la
 * fenêtre le dit en toutes lettres.
 *
 * Les quatre pastilles restent de l'information, pas des boutons : un
 * paiement encaissé avant l'inscription n'aurait personne à créditer, et
 * c'est la page de l'agrégateur qui fait choisir l'opérateur.
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

    /*
     * En mouvement réduit, la fenêtre s'affiche sans entrer. C'est le
     * cas où la garde compte le plus : une modale qui glisse et se
     * remplit par vagues, au moment précis où l'on s'apprête à payer,
     * est le pire endroit de la page pour donner le tournis.
     */
    const ctx = gsap.context(() => {
      if (mouvementReduit()) return

      gsap.from('[data-voile]', {
        opacity: 0,
        duration: DUREE_TOUCHE,
        ease: COURBE_TOUCHE,
      })
      gsap.from('[data-panneau]', {
        y: 40,
        opacity: 0,
        duration: 0.55,
        ease: COURBE_TOUCHE,
      })
      gsap.from('[data-moyen]', {
        y: 14,
        opacity: 0,
        duration: 0.45,
        ease: COURBE_TOUCHE,
        stagger: 0.06,
        delay: 0.15,
      })
    }, racine)

    return () => {
      window.removeEventListener('keydown', auClavier)
      document.body.style.overflow = debordement
      ctx.revert()
      focusPrecedent.current?.focus?.()
    }
  }, [onFermer])

  // Même onglet : l'inscription est la suite du parcours, pas un aparté.
  const destination = lienInscription(offre)

  // WhatsApp, lui, s'ouvre à côté : on ne fait pas quitter la page à
  // quelqu'un qui bascule vers une application de messagerie.
  const whatsapp = lienWhatsApp(offre)

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

        <p className="legende mt-3 font-semibold text-encre/80">{GARANTIE.courte}</p>

        {/*
          Chemin principal : WhatsApp. Le message part déjà écrit, avec
          l'offre et le montant — la gérante n'a ni à expliquer ce
          qu'elle veut, ni à retrouver le prix qu'elle vient de lire.
        */}
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="magnetique group mt-7 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[1.25rem] bg-magenta px-5 py-4 text-[15px] font-extrabold tracking-serre text-creme transition-all duration-300 hover:shadow-[0_14px_40px_-18px_rgba(194,24,91,0.8)]"
          >
            {ACTIVATION.ctaWhatsApp}
            <ArrowUpRight
              size={18}
              strokeWidth={2.5}
              className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        )}

        {/*
          Chemin secondaire : l'inscription en ligne. Elle n'apparaît que
          si APP_URL est renseignée — un bouton désactivé sous un bouton
          actif n'apprend rien.
        */}
        {destination && (
          <a
            href={destination}
            className={`lift flex min-h-[44px] w-full items-center justify-center rounded-[1.25rem] border border-encre/15 px-5 py-4 text-[15px] font-semibold tracking-serre text-encre/80 transition-colors duration-300 hover:border-magenta hover:text-encre ${
              whatsapp ? 'mt-3' : 'mt-7'
            }`}
          >
            {ACTIVATION.cta}
          </a>
        )}

        <p className="legende mt-4 text-encre/60">
          {whatsapp || destination ? ACTIVATION.mention : ACTIVATION.indisponible}
        </p>

        <p className="micro mt-7 text-aubergine">{ACTIVATION.moyensAcceptes}</p>

        <ul className="mt-3 flex flex-wrap gap-2" aria-label={ACTIVATION.moyensAcceptes}>
          {PAIEMENTS.map((moyen) => (
            <li
              key={moyen.id}
              data-moyen
              className="flex items-center gap-2 rounded-full border border-encre/10 bg-white/60 py-1.5 pl-1.5 pr-3.5"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold"
                style={{ backgroundColor: moyen.fond, color: moyen.texte }}
                aria-hidden="true"
              >
                {moyen.sigle}
              </span>
              <span className="text-[13px] font-semibold leading-none tracking-serre text-encre/80">
                {moyen.nom}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
