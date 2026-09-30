import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ARGUMENTS, TABLEAU, fcfa, nombre } from '../donnees'
import {
  COURBE,
  compteur,
  mouvementReduit,
  parallaxe,
  reveler,
  revelerTitre,
} from '../lib/mouvement'

/*
 * S6 — LE TABLEAU DE BORD.
 *
 * Le seul écran du produit montré en grand. Une gérante ne se demande
 * pas « à quoi ça ressemble » mais « qu'est-ce que je vais voir le mois
 * prochain » — donc on lui montre ça, et rien d'autre.
 *
 * ────────────────────────────────────────────────────────────────────
 * UNE MAQUETTE, ET QUI LE DIT
 * ────────────────────────────────────────────────────────────────────
 *
 * Aucune de ces valeurs n'est mesurée. Ce sont celles du calculateur,
 * appliquées au profil « Salon » : 43 créneaux et 215 000 F par mois.
 * Le libellé « Exemple calculé pour un salon de trois postes » reste à
 * l'écran en permanence — une capture d'écran de produit sans cette
 * mention se lit comme une preuve, et ce n'en est pas une.
 *
 * La courbe suit la même règle : c'est le cumul (10, 20, 30, 43), donc
 * une droite qui monte. Une courbe en dents de scie serait plus jolie et
 * serait une invention.
 */

const CHIFFRES = [
  { cle: 'Créneaux sauvés', valeur: 43, format: (v) => nombre(v) },
  { cle: 'Gain du mois', valeur: 215000, format: (v) => fcfa(v) },
]

export default function TableauBord() {
  const racine = useRef(null)
  const titre = useRef(null)
  const maquette = useRef(null)
  const courbe = useRef(null)
  const valeurs = useRef([])

  useEffect(() => {
    let nettoyerTitre = () => {}

    const ctx = gsap.context(() => {
      nettoyerTitre = revelerTitre(titre.current)
      reveler('[data-tb-entree]', { declencheur: racine.current })

      // La maquette respire plus lentement que la page : 8 %, à peine
      // perceptible. Au-delà, elle se décolle de son cadre et l'illusion
      // de profondeur devient un défaut d'alignement.
      parallaxe(maquette.current, { intensite: 8, declencheur: racine.current })

      // Les deux chiffres montent jusqu'à leur valeur. C'est le seul
      // endroit de la page où compter porte du sens : on voit la somme
      // se constituer.
      CHIFFRES.forEach(({ valeur, format }, i) => {
        compteur(valeurs.current[i], valeur, format, { depart: 'top 80%' })
      })

      // La courbe se trace. `getTotalLength` doit être lu après la mise
      // en page, sinon il rend 0 et le tracé n'apparaît jamais.
      const trace = courbe.current
      if (trace && !mouvementReduit()) {
        const longueur = trace.getTotalLength()
        gsap.fromTo(
          trace,
          { strokeDasharray: longueur, strokeDashoffset: longueur },
          {
            strokeDashoffset: 0,
            duration: 1.8,
            ease: COURBE,
            scrollTrigger: { trigger: racine.current, start: 'top 70%', once: true },
          },
        )
      }
    }, racine)

    return () => {
      nettoyerTitre()
      ctx.revert()
    }
  }, [])

  return (
    <section
      id="methode"
      ref={racine}
      className="overflow-hidden bg-creme px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-20">
        <div>
          <p data-tb-entree className="micro flex items-center gap-4 text-magenta">
            <span className="h-px w-10 shrink-0 bg-magenta" aria-hidden="true" />
            {TABLEAU.surtitre}
          </p>

          <h2
            ref={titre}
            className="mt-8 text-[clamp(1.9rem,5vw,3.2rem)] font-extrabold leading-[1.05] tracking-tresserre text-encre"
          >
            {TABLEAU.titreSans}
            <span className="block font-drama italic text-magenta">
              {TABLEAU.titreSerif}
            </span>
          </h2>

          <p
            data-tb-entree
            className="mt-7 max-w-md text-[1.05rem] leading-relaxed text-encre/70"
          >
            {TABLEAU.chapo}
          </p>

          {/*
            Les deux chiffres, en grand, hors de la maquette. Dans la
            maquette ils feraient partie du décor ; dehors, ce sont des
            affirmations, et ils portent leur mention d'exemple.
          */}
          <dl data-tb-entree className="mt-10 grid grid-cols-2 gap-6">
            {CHIFFRES.map(({ cle, valeur, format }, i) => (
              <div key={cle}>
                <dt className="micro text-aubergine">{cle}</dt>
                <dd className="mt-2 text-[clamp(1.8rem,4.5vw,2.6rem)] font-extrabold tabular-nums tracking-tresserre text-encre">
                  {/*
                    LA LARGEUR EST RÉSERVÉE D'AVANCE.

                    Le compteur écrit « 0 », puis « 12 400 F », puis
                    « 215 000 F » : le texte s'allonge de trois
                    caractères pendant qu'il monte. Sans réservation, la
                    colonne s'élargit à chaque image et la mise en page
                    tremble — sur une page qui se vend sur son soin,
                    c'est le genre de détail qu'on remarque sans savoir
                    le nommer.

                    On empile donc la valeur FINALE, invisible, qui
                    donne sa largeur au bloc, et on pose la valeur
                    animée par-dessus en absolu. `tabular-nums` garantit
                    que tous les chiffres ont la même largeur, donc
                    qu'aucune étape intermédiaire ne dépasse.
                    `whitespace-nowrap` empêche « 215 000 F » de se
                    couper entre le nombre et le franc.

                    L'élément invisible est `aria-hidden` : la valeur est
                    déjà annoncée une fois par celui du dessus.
                  */}
                  <span className="relative inline-block whitespace-nowrap">
                    <span aria-hidden="true" className="invisible">
                      {format(valeur)}
                    </span>
                    <span
                      ref={(el) => (valeurs.current[i] = el)}
                      className="absolute left-0 top-0 whitespace-nowrap tabular-nums"
                    >
                      {format(valeur)}
                    </span>
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <p data-tb-entree className="legende mt-5 text-encre/50">
            {ARGUMENTS.tableauBord.exemple}
          </p>
        </div>

        {/*
          La maquette n'est pas marquée `data-tb-entree` : `reveler` et
          `parallaxe` écriraient tous deux dans son translation, l'un en
          une fois, l'autre au défilement — et se battraient. La
          parallaxe suffit à la faire entrer.
        */}
        <div ref={maquette}>
          <Maquette courbeRef={courbe} />
        </div>
      </div>
    </section>
  )
}

/*
 * La maquette. Dessinée, pas capturée : une capture d'écran serait floue
 * sur un écran dense, illisible sur un petit, et périmée à la première
 * modification du produit. Ici, chaque chiffre vient de `donnees.js`.
 */
function Maquette({ courbeRef }) {
  const d = ARGUMENTS.tableauBord
  const [survol, setSurvol] = useState(null)

  // La géométrie de la courbe. Coordonnées fixes dans un viewBox : net
  // sur un téléphone comme sur un écran de bureau, et le poids du texte
  // qui la décrit.
  const largeur = 400
  const hauteur = 150
  const marge = { haut: 16, bas: 30, gauche: 10, droite: 10 }
  const maxi = Math.max(...d.cumul)

  const points = d.cumul.map((valeur, i) => {
    const pas =
      (largeur - marge.gauche - marge.droite) / Math.max(1, d.cumul.length - 1)
    return {
      x: marge.gauche + i * pas,
      y:
        hauteur -
        marge.bas -
        (valeur / maxi) * (hauteur - marge.haut - marge.bas),
      valeur,
      semaine: d.semaines[i],
    }
  })

  const chemin = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  return (
    <div className="carte-surface overflow-hidden rounded-[1.75rem] border border-encre/10 bg-white/70">
      {/* La barre de fenêtre. Trois points, et on lit « logiciel ». */}
      <div className="flex items-center gap-2 border-b border-encre/10 px-5 py-3.5">
        <span className="h-2.5 w-2.5 rounded-full bg-encre/15" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-encre/15" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-magenta/40" aria-hidden="true" />
        <p className="micro ml-2 text-aubergine/70">{d.etiquette}</p>
      </div>

      <div className="p-5 sm:p-7">
        {/* ── La courbe ── */}
        <p className="micro text-aubergine">{TABLEAU.legendeCourbe}</p>

        <svg
          viewBox={`0 0 ${largeur} ${hauteur}`}
          className="mt-3 w-full"
          role="img"
          aria-label={`${TABLEAU.legendeCourbe} : ${d.cumul
            .map((v, i) => `${d.semaines[i]} ${v}`)
            .join(', ')}.`}
        >
          {/* Les lignes de fond. Trois, pas dix : on lit une tendance. */}
          {[0, 0.5, 1].map((part) => {
            const y =
              hauteur - marge.bas - part * (hauteur - marge.haut - marge.bas)
            return (
              <line
                key={part}
                x1={marge.gauche}
                x2={largeur - marge.droite}
                y1={y}
                y2={y}
                stroke="#1A1420"
                strokeOpacity="0.08"
                strokeWidth="1"
              />
            )
          })}

          {/* Le tracé, puis les points. */}
          <path
            ref={courbeRef}
            d={chemin}
            fill="none"
            stroke="#C2185B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p) => (
            <g
              key={p.semaine}
              onMouseEnter={() => setSurvol(p.semaine)}
              onMouseLeave={() => setSurvol(null)}
            >
              {/* Cible tactile généreuse, invisible. */}
              <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
              <circle
                cx={p.x}
                cy={p.y}
                r={survol === p.semaine ? 6 : 4}
                fill="#FAF6F4"
                stroke="#C2185B"
                strokeWidth="2.5"
                className="transition-all duration-200"
              />
              <text
                x={p.x}
                y={hauteur - 8}
                textAnchor="middle"
                fill="#2B1B2E"
                fillOpacity="0.55"
                fontSize="11"
                fontWeight="600"
              >
                {p.semaine}
              </text>
              {survol === p.semaine && (
                <text
                  x={p.x}
                  y={p.y - 14}
                  textAnchor="middle"
                  fill="#C2185B"
                  fontSize="13"
                  fontWeight="800"
                >
                  {p.valeur}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* ── La semaine ── */}
        <div className="mt-8 grid grid-cols-7 gap-1.5">
          {d.jours.map((jour, i) => (
            <div
              key={`${jour}-${i}`}
              className={`flex aspect-square items-center justify-center rounded-[0.7rem] border text-[13px] font-semibold ${
                i === d.jourCible
                  ? 'border-magenta bg-magenta text-creme'
                  : 'border-encre/10 bg-creme text-encre/70'
              }`}
            >
              {jour}
            </div>
          ))}
        </div>

        {/* ── Le relevé ── */}
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {d.releve.map((bloc) => (
            <div
              key={bloc.cle}
              className="rounded-[0.9rem] border border-encre/10 bg-creme px-4 py-3"
            >
              <p className="legende text-aubergine/80">{bloc.cle}</p>
              <p className="mt-0.5 text-[17px] font-semibold tabular-nums tracking-serre text-encre">
                {bloc.valeur}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
