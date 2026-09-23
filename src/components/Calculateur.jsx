import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ChevronDown, Minus, Plus } from 'lucide-react'
import {
  AHA,
  PROFILS,
  REGLAGES,
  SEMAINES_PAR_MOIS,
  TARIFS,
  TAUX_RECUPERATION,
  fcfa,
  nombre,
} from '../donnees'
import Bouton from './Bouton'
import ModalePaiement from './ModalePaiement'

/* Compteur animé : la valeur roule de l'ancienne à la nouvelle. */
function Compteur({ valeur, format, className = '' }) {
  const element = useRef(null)
  const precedent = useRef(valeur)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const proxy = { v: precedent.current }
      gsap.to(proxy, {
        v: valeur,
        duration: 0.75,
        ease: 'power2.inOut',
        onUpdate: () => {
          precedent.current = proxy.v
          if (element.current) element.current.textContent = format(proxy.v)
        },
      })
    })
    return () => ctx.revert()
  }, [valeur, format])

  return (
    <span ref={element} className={className}>
      {format(valeur)}
    </span>
  )
}

/* Réglage fin : boutons de 44 px, jamais de glissement précis exigé. */
function Reglage({ libelle, valeur, min, max, pas = 1, suffixe = '', onChange }) {
  const borner = (v) => Math.min(max, Math.max(min, v))

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="curseur-libelle text-aubergine">{libelle}</label>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onChange(borner(valeur - pas))}
            disabled={valeur <= min}
            aria-label={`Diminuer : ${libelle}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-encre/15 text-encre/70 transition-colors duration-200 hover:border-magenta hover:text-magenta disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus size={16} strokeWidth={2.5} />
          </button>

          <span className="curseur-valeur min-w-[4.5rem] text-center text-encre">
            {suffixe === ' F' ? nombre(valeur) : valeur}
            {suffixe}
          </span>

          <button
            type="button"
            onClick={() => onChange(borner(valeur + pas))}
            disabled={valeur >= max}
            aria-label={`Augmenter : ${libelle}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-encre/15 text-encre/70 transition-colors duration-200 hover:border-magenta hover:text-magenta disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={pas}
        value={valeur}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full"
        aria-label={libelle}
      />
    </div>
  )
}

export default function Calculateur() {
  const racine = useRef(null)
  const [profil, setProfil] = useState(PROFILS[1].id)
  const [absences, setAbsences] = useState(PROFILS[1].absencesSemaine)
  const [valeurs, setValeurs] = useState(PROFILS[1].valeurs)
  const [reglagesOuverts, setReglagesOuverts] = useState(false)
  const [offreChoisie, setOffreChoisie] = useState(null)

  const choisirProfil = (p) => {
    setProfil(p.id)
    setAbsences(p.absencesSemaine)
    setValeurs(p.valeurs)
  }

  const modifier = (cle) => (v) => {
    setValeurs((precedent) => ({ ...precedent, [cle]: v }))
    setProfil(null)
  }

  /*
   * Le calcul part des absences réellement vécues, pas d'un modèle de
   * capacité : c'est SON chiffre qui produit la révélation.
   */
  const calcul = useMemo(() => {
    const { ticket, postes } = valeurs
    const semaine = absences * ticket
    const annee = semaine * 52
    const offre = postes <= 1 ? TARIFS[0] : postes <= 4 ? TARIFS[1] : TARIFS[2]
    const recuperableAn = annee * TAUX_RECUPERATION

    return {
      semaine,
      mois: semaine * SEMAINES_PAR_MOIS,
      annee,
      recuperableAn,
      recuperableMois: (recuperableAn / 12),
      creneauxSauves: Math.round(absences * TAUX_RECUPERATION),
      offre,
      roi: offre.mensuel > 0 ? recuperableAn / 12 / offre.mensuel : 0,
    }
  }, [absences, valeurs])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-anim="aha"]', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: racine.current, start: 'top 72%' },
      })
    }, racine)
    return () => ctx.revert()
  }, [])

  const roiTexte = `${calcul.roi.toFixed(1).replace('.', ',')}×`

  return (
    <section
      id="calculateur"
      ref={racine}
      className="relative bg-creme px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <div data-anim="aha" className="max-w-3xl">
          <p className="micro text-aubergine">{AHA.micro}</p>
          <h2 className="mt-5 text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-[1.06] tracking-tresserre text-encre">
            {AHA.titreSans}
            <span className="font-drama italic"> {AHA.titreSerif}</span>
          </h2>
          <p className="mt-5 text-[1rem] leading-relaxed text-encre/70">{AHA.aide}</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
          {/* Ce qu'elle sait déjà */}
          <div data-anim="aha" className="flex flex-col gap-6">
            <div className="rounded-[2rem] border border-encre/10 bg-white/60 p-6 sm:p-7">
              <p className="micro text-aubergine">{REGLAGES.invite}</p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {PROFILS.map((p) => {
                  const actif = profil === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => choisirProfil(p)}
                      aria-pressed={actif}
                      className={`magnetique rounded-[1.25rem] border p-4 text-left transition-colors duration-300 ${
                        actif
                          ? 'border-magenta bg-magenta text-creme'
                          : 'border-encre/12 bg-white/70 text-encre hover:border-encre/30'
                      }`}
                    >
                      <span className="block text-[15px] font-extrabold leading-tight tracking-serre">
                        {p.nom}
                      </span>
                      <span
                        className={`legende mt-0.5 block ${actif ? 'text-creme/80' : 'text-encre/60'}`}
                      >
                        {p.detail}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* LE compteur : la seule chose qu'on lui demande vraiment */}
            <div className="rounded-[2rem] border border-encre/10 bg-white/60 p-6 sm:p-7">
              <p className="micro text-aubergine">{AHA.compteurLibelle}</p>

              <div className="mt-5 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setAbsences((v) => Math.max(0, v - 1))}
                  disabled={absences <= 0}
                  aria-label="Une absence de moins"
                  className="magnetique flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-encre/15 text-encre/70 hover:border-magenta hover:text-magenta disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={24} strokeWidth={2.5} />
                </button>

                <span
                  className="flex-1 text-center text-[clamp(3.5rem,13vw,5.5rem)] font-extrabold leading-none tabular-nums tracking-tresserre text-encre"
                  aria-live="polite"
                >
                  {absences}
                </span>

                <button
                  type="button"
                  onClick={() => setAbsences((v) => Math.min(200, v + 1))}
                  disabled={absences >= 200}
                  aria-label="Une absence de plus"
                  className="magnetique flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-encre/15 text-encre/70 hover:border-magenta hover:text-magenta disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus size={24} strokeWidth={2.5} />
                </button>
              </div>

              <p className="micro mt-8 text-aubergine">{AHA.ticketLibelle}</p>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {AHA.ticketsRapides.map((montant) => {
                  const actif = valeurs.ticket === montant
                  return (
                    <button
                      key={montant}
                      type="button"
                      onClick={() => modifier('ticket')(montant)}
                      aria-pressed={actif}
                      className={`magnetique rounded-full border py-3 text-[15px] font-semibold tabular-nums tracking-serre transition-colors duration-300 ${
                        actif
                          ? 'border-magenta bg-magenta text-creme'
                          : 'border-encre/12 bg-white/70 text-encre hover:border-encre/30'
                      }`}
                    >
                      {nombre(montant)} F
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Les réglages fins, repliés */}
            <div>
              <button
                type="button"
                onClick={() => setReglagesOuverts((v) => !v)}
                aria-expanded={reglagesOuverts}
                aria-controls="reglages-calculateur"
                className="lift flex w-full items-center justify-between gap-3 rounded-[1.25rem] border border-encre/12 bg-white/50 px-5 py-4 text-left"
              >
                <span>
                  <span className="block text-[15px] font-semibold tracking-serre text-encre">
                    {reglagesOuverts ? REGLAGES.fermer : REGLAGES.ouvrir}
                  </span>
                  {!reglagesOuverts && (
                    <span className="legende mt-0.5 block text-encre/60">{REGLAGES.aide}</span>
                  )}
                </span>
                <ChevronDown
                  size={18}
                  strokeWidth={2.5}
                  className={`shrink-0 text-aubergine transition-transform duration-300 ${
                    reglagesOuverts ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {reglagesOuverts && (
                <div
                  id="reglages-calculateur"
                  className="mt-6 flex flex-col gap-7 rounded-[1.5rem] border border-encre/10 bg-white/50 p-6"
                >
                  <Reglage
                    libelle="Postes de travail"
                    valeur={valeurs.postes}
                    min={1}
                    max={12}
                    onChange={modifier('postes')}
                  />
                  <Reglage
                    libelle="Ticket moyen"
                    valeur={valeurs.ticket}
                    min={1500}
                    max={40000}
                    pas={500}
                    suffixe=" F"
                    onChange={modifier('ticket')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* LA RÉVÉLATION, puis l'offre dans le même souffle */}
          <div
            data-anim="aha"
            className="flex flex-col justify-between rounded-[2rem] bg-encre p-6 text-creme sm:p-8"
          >
            <div>
              <div className="flex items-baseline justify-between gap-4 border-b border-creme/12 pb-4">
                <span className="legende text-creme/65">{AHA.lignes.semaine}</span>
                <span className="text-[1.15rem] font-semibold tabular-nums tracking-serre">
                  <Compteur valeur={calcul.semaine} format={fcfa} />
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-4 border-b border-creme/12 py-4">
                <span className="legende text-creme/65">{AHA.lignes.mois}</span>
                <span className="text-[1.15rem] font-semibold tabular-nums tracking-serre">
                  <Compteur valeur={calcul.mois} format={fcfa} />
                </span>
              </div>

              <div className="pt-7">
                <p className="micro text-magenta-clair">{AHA.revelation}</p>
                <p className="mt-3 font-drama text-[clamp(3rem,11vw,5.5rem)] italic leading-[0.88] tabular-nums text-magenta-clair">
                  <Compteur valeur={calcul.annee} format={fcfa} />
                </p>
              </div>

              <div className="mt-8 rounded-[1.25rem] border border-creme/15 bg-creme/[0.06] p-5">
                <p className="micro text-creme/75">{AHA.recuperation}</p>
                <p className="mt-2 text-[1.5rem] font-extrabold tabular-nums tracking-tresserre text-creme">
                  <Compteur valeur={calcul.recuperableAn} format={fcfa} />
                  <span className="legende ml-2 font-normal text-creme/65">par an</span>
                </p>
                <p className="legende mt-2 text-creme/70">
                  Sur {absences} créneau{absences > 1 ? 'x' : ''} perdu
                  {absences > 1 ? 's' : ''} par semaine, Belya en rend {calcul.creneauxSauves}{' '}
                  vendable{calcul.creneauxSauves > 1 ? 's' : ''}.
                </p>
              </div>
            </div>

            {/* Le paiement, immédiatement après l'aha */}
            <div className="mt-8 border-t border-creme/12 pt-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="micro text-creme/75">Offre {calcul.offre.nom}</p>
                <p className="legende text-creme/65">
                  {fcfa(calcul.offre.mensuel)} / mois · retour {roiTexte}
                </p>
              </div>

              <Bouton
                taille="grand"
                className="mt-4 w-full"
                onClick={() => setOffreChoisie(calcul.offre)}
              >
                {AHA.cta}
              </Bouton>

              <p className="legende mt-3 text-creme/60">{AHA.note}</p>
            </div>
          </div>
        </div>
      </div>

      {offreChoisie && (
        <ModalePaiement offre={offreChoisie} onFermer={() => setOffreChoisie(null)} />
      )}
    </section>
  )
}
