import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { REFERENCE, TARIFS, TAUX_RECUPERATION, fcfa, nombre, allerA } from '../donnees'
import Bouton from './Bouton'

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

function Curseur({ libelle, valeur, min, max, pas = 1, suffixe = '', onChange }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label className="curseur-libelle text-aubergine">{libelle}</label>
        <span className="curseur-valeur text-encre">
          {suffixe === ' F' ? nombre(valeur) : valeur}
          {suffixe}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={pas}
        value={valeur}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3.5 w-full"
        aria-label={libelle}
      />
    </div>
  )
}

export default function Calculateur() {
  const racine = useRef(null)
  const [postes, setPostes] = useState(REFERENCE.postes)
  const [creneauxJour, setCreneauxJour] = useState(REFERENCE.creneauxJour)
  const [joursOuvres, setJoursOuvres] = useState(REFERENCE.joursOuvres)
  const [remplissage, setRemplissage] = useState(REFERENCE.remplissage)
  const [noShow, setNoShow] = useState(REFERENCE.noShow)
  const [ticket, setTicket] = useState(REFERENCE.ticket)

  const calcul = useMemo(() => {
    const capacite = postes * creneauxJour * joursOuvres
    const rdv = Math.floor(capacite * (remplissage / 100))
    const manques = Math.round(rdv * (noShow / 100))
    const perteMois = manques * ticket
    const recuperable = perteMois * TAUX_RECUPERATION
    const offre = postes <= 1 ? TARIFS[0] : postes <= 4 ? TARIFS[1] : TARIFS[2]

    return {
      capacite,
      rdv,
      manques,
      perteMois,
      perteAn: perteMois * 12,
      recuperable,
      perteApres: perteMois - recuperable,
      offre,
      roi: offre.mensuel > 0 ? recuperable / offre.mensuel : 0,
    }
  }, [postes, creneauxJour, joursOuvres, remplissage, noShow, ticket])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-anim="calc"]', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.15,
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
        <div data-anim="calc" className="max-w-2xl">
          <p className="micro text-aubergine">Le coût réel</p>
          <h2 className="mt-5 text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-[1.06] tracking-tresserre text-encre">
            Ce que votre agenda perd
            <span className="font-drama italic"> pendant que vous travaillez.</span>
          </h2>
          <p className="mt-5 text-[1rem] leading-relaxed text-encre/70">
            Les valeurs de départ sont celles du salon de référence d’Abidjan : trois postes, huit
            créneaux par jour, 69 % de remplissage. Bougez les curseurs pour retrouver le vôtre.
          </p>
        </div>

        <div
          data-anim="calc"
          className="mt-14 grid gap-6 rounded-[2.5rem] border border-encre/10 bg-white/50 p-6 shadow-[0_24px_80px_-40px_rgba(26,20,32,0.35)] sm:p-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12"
        >
          {/* Les entrées */}
          <div className="flex flex-col gap-7">
            <p className="micro text-aubergine/75">Votre établissement</p>
            <Curseur
              libelle="Postes de travail"
              valeur={postes}
              min={1}
              max={12}
              onChange={setPostes}
            />
            <Curseur
              libelle="Créneaux par poste et par jour"
              valeur={creneauxJour}
              min={3}
              max={16}
              onChange={setCreneauxJour}
            />
            <Curseur
              libelle="Jours ouvrés par mois"
              valeur={joursOuvres}
              min={18}
              max={31}
              onChange={setJoursOuvres}
            />
            <Curseur
              libelle="Taux de remplissage"
              valeur={remplissage}
              min={30}
              max={100}
              suffixe=" %"
              onChange={setRemplissage}
            />
            <Curseur
              libelle="Taux de no-show"
              valeur={noShow}
              min={2}
              max={45}
              suffixe=" %"
              onChange={setNoShow}
            />
            <Curseur
              libelle="Ticket moyen"
              valeur={ticket}
              min={1500}
              max={40000}
              pas={500}
              suffixe=" F"
              onChange={setTicket}
            />
          </div>

          {/* La lecture */}
          <div className="flex flex-col justify-between rounded-[2rem] bg-encre p-6 text-creme sm:p-8">
            <div>
              <p className="micro text-creme/70">Perte directe, aujourd’hui</p>
              <p className="montant-perte mt-4 font-drama italic text-magenta-clair">
                <Compteur valeur={calcul.perteMois} format={fcfa} />
              </p>
              <p className="legende mt-3 text-creme/65">
                par mois · soit <Compteur valeur={calcul.perteAn} format={fcfa} /> par an
              </p>

              <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[1.25rem] border border-creme/15 bg-creme/15">
                {[
                  { cle: 'Capacité', valeur: calcul.capacite, format: nombre, unite: 'créneaux/mois' },
                  { cle: 'Rendez-vous pris', valeur: calcul.rdv, format: nombre, unite: 'par mois' },
                  {
                    cle: 'Rendez-vous manqués',
                    valeur: calcul.manques,
                    format: nombre,
                    unite: 'par mois',
                  },
                  {
                    cle: 'Perte résiduelle',
                    valeur: calcul.perteApres,
                    format: fcfa,
                    unite: 'modèle Belya',
                  },
                ].map((bloc) => (
                  <div key={bloc.cle} className="bg-encre px-4 py-4">
                    <p className="legende text-creme/65">{bloc.cle}</p>
                    <p className="mt-1 text-[1.2rem] font-semibold tabular-nums tracking-serre">
                      <Compteur valeur={bloc.valeur} format={bloc.format} />
                    </p>
                    <p className="legende text-creme/60">{bloc.unite}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-[1.25rem] border border-magenta-clair/40 bg-magenta-clair/10 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="micro text-creme/75">Récupérable avec Belya {calcul.offre.nom}</p>
                <p className="legende text-creme/65">{fcfa(calcul.offre.mensuel)} / mois</p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="text-[clamp(1.7rem,4.5vw,2.4rem)] font-extrabold tabular-nums tracking-tresserre text-creme">
                  <Compteur valeur={calcul.recuperable} format={fcfa} />
                </p>
                <span className="rounded-full bg-magenta px-3 py-1 text-[13px] font-semibold tabular-nums text-creme">
                  retour {roiTexte}
                </span>
              </div>

              <p className="legende mt-3 text-creme/65">
                Chiffre issu du modèle à cinq couches du cahier des charges — 50,9 % de la perte
                rendue vendable — et non d’une mesure terrain. Le seuil de rentabilité tient en trois
                créneaux sauvés.
              </p>

              <Bouton className="mt-5 w-full" onClick={() => allerA('tarifs')}>
                Voir l’offre {calcul.offre.nom}
              </Bouton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
