import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Check, ShieldCheck } from 'lucide-react'
import {
  BADGE_OFFRE,
  CTA_TARIF,
  GARANTIE,
  PROFILS,
  TARIFS,
  centaine,
  fcfa,
  formatRoi,
  potentiel,
} from '../donnees'

/* Retour et potentiel d'une offre, calculés sur son profil de référence. */
function chiffresOffre(offre) {
  const profil = PROFILS.find((p) => p.id === offre.profil)
  const p = potentiel(profil.absencesSemaine, profil.valeurs.ticket, offre.mensuel)
  return {
    roi: formatRoi(p.roi),
    gain: `Potentiel calculé : ${fcfa(centaine(p.recuperableMois))} par mois`,
  }
}
import Bouton from './Bouton'
import ModalePaiement from './ModalePaiement'

export default function Tarifs() {
  const racine = useRef(null)
  const [offreChoisie, setOffreChoisie] = useState(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-anim="tarif-titre"]', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: racine.current, start: 'top 75%' },
      })

      gsap.from('[data-offre]', {
        y: 50,
        opacity: 0,
        duration: 1.05,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: { trigger: '[data-grille-tarifs]', start: 'top 82%' },
      })
    }, racine)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="tarifs"
      ref={racine}
      className="relative bg-creme px-6 py-28 sm:px-10 sm:py-36 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p data-anim="tarif-titre" className="micro text-aubergine">
            Tarifs
          </p>
          <h2
            data-anim="tarif-titre"
            className="mt-5 text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-[1.06] tracking-tresserre text-encre"
          >
            Un crédit prépayé,
            <span className="font-drama italic"> pas un abonnement.</span>
          </h2>
          <p data-anim="tarif-titre" className="mt-5 text-[1rem] leading-relaxed text-encre/70">
            Vous ne payez que les jours où vous ouvrez. Le compte se décompte au prorata, se recharge
            quand vous voulez, et ne se coupe jamais du jour au lendemain.
          </p>
        </div>

        <div data-grille-tarifs className="mt-16 grid items-start gap-6 lg:grid-cols-3">
          {TARIFS.map((offre) => {
            const enAvant = offre.misEnAvant
            const chiffres = chiffresOffre(offre)
            return (
              <article
                key={offre.nom}
                data-offre
                className={`magnetique flex h-full flex-col rounded-[2rem] p-7 sm:p-8 ${
                  enAvant
                    ? 'bg-aubergine text-creme shadow-[0_30px_90px_-45px_rgba(43,27,46,0.95)] ring-1 ring-magenta-clair/50 lg:-mt-6 lg:pb-11 lg:pt-11'
                    : 'carte-surface border border-encre/10 bg-white/60 text-encre'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className={`text-[1.45rem] font-extrabold tracking-tresserre ${
                        enAvant ? 'text-creme' : 'text-encre'
                      }`}
                    >
                      {offre.nom}
                    </h3>
                    <p className={`micro mt-1.5 ${enAvant ? 'text-creme/75' : 'text-aubergine'}`}>
                      {offre.cible}
                    </p>
                  </div>

                  {enAvant && (
                    <span className="rounded-full bg-magenta px-3 py-1 text-[13px] font-semibold text-creme">
                      {BADGE_OFFRE}
                    </span>
                  )}
                </div>

                <div className="mt-8">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span
                      className={`text-[clamp(2.2rem,5vw,2.9rem)] font-extrabold tabular-nums tracking-tresserre ${
                        enAvant ? 'text-creme' : 'text-encre'
                      }`}
                    >
                      {fcfa(offre.mensuel)}
                    </span>
                    <span className={`legende ${enAvant ? 'text-creme/75' : 'text-encre/60'}`}>
                      / mois
                    </span>
                  </p>
                  <p className={`legende mt-2 ${enAvant ? 'text-creme/70' : 'text-encre/60'}`}>
                    {offre.prorata} · {offre.recharge}
                  </p>
                </div>

                <div
                  className={`mt-6 rounded-[1.1rem] px-4 py-4 ${
                    enAvant ? 'bg-creme/10 ring-1 ring-creme/20' : 'bg-aubergine/[0.07]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`micro ${enAvant ? 'text-creme/75' : 'text-aubergine'}`}>
                      Retour sur dépense
                    </span>
                    <span className="rounded-full bg-magenta px-3 py-1 text-[15px] font-extrabold tabular-nums text-creme">
                      {chiffres.roi}
                    </span>
                  </div>
                  <p className={`legende mt-2 ${enAvant ? 'text-creme/75' : 'text-encre/65'}`}>
                    {chiffres.gain}
                  </p>
                </div>

                <ul className="mt-7 flex-1 space-y-3">
                  {offre.inclus.map((ligne) => (
                    <li key={ligne} className="flex items-start gap-2.5">
                      <Check
                        size={16}
                        className={`mt-0.5 shrink-0 ${enAvant ? 'text-creme' : 'text-magenta'}`}
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                      <span
                        className={`text-[15px] leading-snug ${
                          enAvant ? 'text-creme/85' : 'text-encre/75'
                        }`}
                      >
                        {ligne}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Bouton
                    variante={enAvant ? 'accent' : 'contourSombre'}
                    className="w-full"
                    onClick={() => setOffreChoisie(offre)}
                  >
                    {CTA_TARIF}
                  </Bouton>
                  <p
                    className={`legende mt-3 text-center ${
                      enAvant ? 'text-creme/70' : 'text-encre/60'
                    }`}
                  >
                    {/* Montants insécables : « 90 000 F » ne doit jamais se couper. */}
                    Pack 3 mois : <span className="whitespace-nowrap">{fcfa(offre.pack3)}</span> au lieu
                    de <span className="whitespace-nowrap">{fcfa(offre.mensuel * 3)}</span>
                    <br />
                    Pack 12 mois : <span className="whitespace-nowrap">{fcfa(offre.pack12)}</span> au
                    lieu de <span className="whitespace-nowrap">{fcfa(offre.mensuel * 12)}</span>
                  </p>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mx-auto mt-12 flex max-w-3xl items-start gap-4 rounded-[1.5rem] border border-magenta/30 bg-white/60 p-6 sm:p-7">
          <ShieldCheck size={26} strokeWidth={2} className="mt-0.5 shrink-0 text-magenta" aria-hidden="true" />
          <div>
            <p className="micro text-aubergine">{GARANTIE.titre}</p>
            <p className="mt-2 text-[1rem] font-semibold leading-snug text-encre">{GARANTIE.texte}</p>
            <p className="legende mt-2 text-encre/65">{GARANTIE.detail}</p>
          </div>
        </div>

        <p className="micro mt-10 text-center text-aubergine">
          Crédit prépayé · Aucun engagement de durée · Vous ne payez que les jours où vous ouvrez
        </p>
      </div>

      {offreChoisie && (
        <ModalePaiement offre={offreChoisie} onFermer={() => setOffreChoisie(null)} />
      )}
    </section>
  )
}
