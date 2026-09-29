import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Check, ShieldCheck } from 'lucide-react'
import {
  BADGE_OFFRE,
  CTA_TARIF,
  GARANTIE,
  MEDIAS,
  PROFILS,
  TARIFS,
  centaine,
  fcfa,
  formatRoi,
  potentiel,
} from '../donnees'
import { reveler, revelerImage, revelerTitre } from '../lib/mouvement'

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
  const titre = useRef(null)
  const [offreChoisie, setOffreChoisie] = useState(null)

  useEffect(() => {
    let nettoyerTitre = () => {}

    const ctx = gsap.context(() => {
      nettoyerTitre = revelerTitre(titre.current, { depart: 'top 80%' })

      reveler('[data-anim="tarif-titre"]', { declencheur: racine.current })

      /*
       * Les trois cartes arrivent avec un léger décalage, et sans
       * rotation. Une carte qui pivote en entrant a l'air d'un modèle de
       * diaporama ; une carte qui monte de trente pixels a l'air d'avoir
       * été posée là.
       */
      reveler('[data-offre]', {
        y: 44,
        decalage: 0.13,
        depart: 'top 82%',
        declencheur: '[data-grille-tarifs]',
      })
    }, racine)

    return () => {
      nettoyerTitre()
      ctx.revert()
    }
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
            ref={titre}
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

        <Garantie />

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

/*
 * LE BLOC GARANTIE.
 *
 * La phrase la plus sensible de tout le site. Le remède est un CRÉDIT de
 * trente jours, pas un remboursement : `evaluer_la_garantie()` dans
 * belya-app/paiements/credit.py ajoute JOURS_GARANTIE = 30 au solde, et
 * aucun argent ne ressort. Écrire « remboursée » promettrait un versement
 * qui n'existe pas et qu'il faudrait honorer à la main. Le texte vit dans
 * `donnees.js` et se relit à chaque modification du code.
 *
 * L'image, quand elle existe, se dévoile du bas vers le haut. Elle n'est
 * JAMAIS présentée comme une cliente, ni accompagnée d'un témoignage :
 * une photo d'illustration qui se fait passer pour une preuve est
 * exactement ce que le brief interdit. Sans image, le bloc occupe toute
 * la largeur et se lit aussi bien.
 */
function Garantie() {
  const bloc = useRef(null)
  const cadre = useRef(null)
  const image = useRef(null)

  useEffect(() => {
    if (!cadre.current) return

    /*
     * Le cadre est rogné, l'image désagrandie : voir `revelerImage`. Le
     * `clip-path` est posé par GSAP au moment d'animer, jamais dans le
     * HTML — sans script, l'image reste entière.
     */
    const ctx = gsap.context(() => {
      revelerImage(cadre.current, image.current)
    }, bloc)

    return () => ctx.revert()
  }, [])

  const avecImage = Boolean(MEDIAS.gerante)

  return (
    <div
      ref={bloc}
      className={`mt-12 grid gap-8 rounded-[1.5rem] border border-magenta/30 bg-white/60 p-6 sm:p-8 ${
        avecImage
          ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-center'
          : 'mx-auto max-w-3xl'
      }`}
    >
      <div className="flex items-start gap-4">
        <ShieldCheck
          size={26}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-magenta"
          aria-hidden="true"
        />
        <div>
          <p className="micro text-aubergine">{GARANTIE.titre}</p>
          <p className="mt-2 text-[1.15rem] font-semibold leading-snug text-encre">
            {GARANTIE.texte}
          </p>
          <p className="legende mt-3 text-encre/65">{GARANTIE.detail}</p>
        </div>
      </div>

      {avecImage && (
        <div
          ref={cadre}
          className="aspect-[4/5] w-full overflow-hidden rounded-[1.1rem]"
        >
          <img
            ref={image}
            src={MEDIAS.gerante}
            alt="Une gérante de salon consulte son agenda."
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </div>
  )
}
