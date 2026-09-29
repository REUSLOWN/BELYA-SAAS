import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { RotateCcw } from 'lucide-react'
import { DEMO, MEDIAS, fcfa } from '../donnees'
import {
  DUREE_TOUCHE,
  basculerFond,
  mouvementReduit,
  reveler,
  revelerTitre,
} from '../lib/mouvement'

/*
 * S4 — LA DÉMO QU'ON ESSAIE.
 *
 * Toute la page explique le mécanisme anti-absence. Cette section le
 * fait ESSAYER : la visiteuse répond à la place d'Awa et voit ce que sa
 * réponse déclenche. Dix secondes, deux branches, et l'objection « je ne
 * vois pas bien comment ça marche » tombe.
 *
 * C'est aussi le premier grand basculement de la page vers le sombre.
 * Un écran de téléphone se regarde mieux dans le noir, et le contraste
 * avec les sections crème qui l'encadrent fait de cette démo l'endroit
 * où l'œil s'arrête.
 *
 * ────────────────────────────────────────────────────────────────────
 * POURQUOI LA CONVERSATION EST EN HTML ET NON EN IMAGE
 * ────────────────────────────────────────────────────────────────────
 *
 * Une capture d'écran WhatsApp serait plus rapide à produire. Elle
 * serait aussi : floue sur un écran dense, impossible à traduire,
 * impossible à corriger quand le texte du rappel change, illisible pour
 * un lecteur d'écran, et — si on la faisait générer — pleine de lettres
 * déformées, ce qui se voit immédiatement et ruine la crédibilité de
 * toute la page.
 *
 * En HTML, le texte est net partout, sélectionnable, lu correctement à
 * voix haute, et vient de `donnees.js` comme tout le reste. La photo de
 * téléphone, quand elle existe, n'est qu'un support : l'écran est noir,
 * parfaitement de face, et la conversation se pose par-dessus.
 *
 * Sans photo, le boîtier est dessiné en CSS. La section est entière.
 */

/* Les états de la conversation. Le nom dit ce que la gérante y gagne. */
const ATTENTE = 'attente'
const CONFIRME = 'confirme'
const LIBERE = 'libere'
const REVENDU = 'revendu'

export default function DemoWhatsApp() {
  const racine = useRef(null)
  const titre = useRef(null)
  const minuteurs = useRef([])

  const [etat, setEtat] = useState(ATTENTE)

  // ── Le titre, l'entrée de section et la bascule de fond ────────────
  useEffect(() => {
    let nettoyerTitre = () => {}
    const ctx = gsap.context(() => {
      nettoyerTitre = revelerTitre(titre.current)
      reveler('[data-demo-entree]', { declencheur: racine.current })
      basculerFond(racine.current, { sombre: true })
    }, racine)

    return () => {
      nettoyerTitre()
      ctx.revert()
    }
  }, [])

  // Les minuteurs de la branche « annuler » doivent mourir avec le
  // composant, sinon un setEtat tombe sur un composant démonté.
  useEffect(() => () => minuteurs.current.forEach(clearTimeout), [])

  function attendre(delai, action) {
    minuteurs.current.push(setTimeout(action, delai))
  }

  function repondre(choix) {
    minuteurs.current.forEach(clearTimeout)
    minuteurs.current = []

    if (choix === 'oui') {
      setEtat(CONFIRME)
      return
    }

    setEtat(LIBERE)
    // Le délai n'est pas de la décoration : il dit que la revente prend
    // un moment, et qu'elle se fait sans la gérante. En mouvement
    // réduit, on ne fait pas attendre — on montre le résultat.
    attendre(mouvementReduit() ? 0 : 1600, () => setEtat(REVENDU))
  }

  function rejouer() {
    minuteurs.current.forEach(clearTimeout)
    minuteurs.current = []
    setEtat(ATTENTE)
  }

  // ── Ce qui est à l'écran, selon l'état ─────────────────────────────
  const { branches } = DEMO
  const bulles = [DEMO.rappel]
  let etiquette = null
  let note = null
  let etape = -1

  if (etat === CONFIRME) {
    bulles.push(branches.oui.reponse)
    etiquette = branches.oui.etat
    note = branches.oui.note
    etape = branches.oui.etape
  } else if (etat === LIBERE || etat === REVENDU) {
    bulles.push(branches.annuler.reponse)
    etiquette = branches.annuler.etat
    note = branches.annuler.note
    etape = branches.annuler.etape

    if (etat === REVENDU) {
      bulles.push(...branches.annuler.suite)
      etiquette = branches.annuler.final
      note = branches.annuler.noteFinale
      etape = branches.annuler.etapeFinale
    }
  }

  return (
    <section
      id="demo"
      ref={racine}
      className="bg-encre px-6 py-24 text-creme sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-20">
        {/* ── Le propos ── */}
        <div>
          <p
            data-demo-entree
            className="micro flex items-center gap-4 text-magenta-clair"
          >
            <span
              className="h-px w-10 shrink-0 bg-magenta-clair"
              aria-hidden="true"
            />
            {DEMO.surtitre}
          </p>

          <h2
            ref={titre}
            className="mt-8 text-[clamp(1.9rem,5vw,3.2rem)] font-extrabold leading-[1.05] tracking-tresserre"
          >
            {DEMO.titreSans}
            <span className="block font-drama italic text-magenta-clair">
              {DEMO.titreSerif}
            </span>
          </h2>

          <p
            data-demo-entree
            className="mt-7 max-w-md text-[1.05rem] leading-relaxed text-creme/70"
          >
            {DEMO.chapo}
          </p>

          {/* Les trois temps du mécanisme, allumés au fil de l'essai. */}
          <ol data-demo-entree className="mt-9 space-y-3">
            {DEMO.legende.map((texte, i) => (
              <li
                key={texte}
                className={`flex items-center gap-3 text-[15px] leading-snug transition-colors duration-500 ${
                  i <= etape ? 'text-creme' : 'text-creme/35'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500 ${
                    i <= etape ? 'bg-magenta-clair' : 'bg-creme/25'
                  }`}
                  aria-hidden="true"
                />
                {texte}
              </li>
            ))}
          </ol>

          {/*
            Qui a été prévenu. Trois prénoms, pas un compteur : « 3
            clientes » est une statistique, trois prénoms sont une scène.
          */}
          {(etat === LIBERE || etat === REVENDU) && (
            <ul
              className="mt-8 flex flex-wrap gap-2"
              aria-label="Clientes prévenues"
            >
              {DEMO.attente.map((nom, i) => (
                <li
                  key={nom}
                  className={`legende rounded-full border px-3 py-1 transition-colors duration-500 ${
                    etat === REVENDU && i === 0
                      ? 'border-magenta-clair bg-magenta/20 font-semibold text-magenta-clair'
                      : 'border-creme/20 text-creme/55'
                  }`}
                >
                  {nom}
                </li>
              ))}
            </ul>
          )}

          {/*
            Le gain, révélé seulement quand la place est reprise. On ne
            l'annonce jamais avant de l'avoir montré.
          */}
          {etat === REVENDU && (
            <p className="mt-6 text-[15px] text-creme/70">
              Récupéré sur ce seul créneau :{' '}
              <strong className="font-drama text-[1.6em] italic text-magenta-clair">
                {fcfa(DEMO.gain)}
              </strong>
            </p>
          )}
        </div>

        {/* ── Le téléphone ── */}
        <div className="mx-auto w-full max-w-[340px]">
          <Telephone>
            <Conversation bulles={bulles} etiquette={etiquette} />
          </Telephone>

          {/*
            Les commandes, hors du téléphone : on ne feint pas un
            clavier, on propose un essai. 44 px de haut au minimum, comme
            toutes les cibles tactiles de la page.
          */}
          <div className="mt-7">
            {etat === ATTENTE ? (
              <>
                <p className="micro text-creme/50">{DEMO.invite}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    onClick={() => repondre('oui')}
                    className="magnetique min-h-[44px] rounded-full bg-magenta px-6 text-[15px] font-semibold tracking-serre text-creme"
                  >
                    {DEMO.choixOui}
                  </button>
                  <button
                    onClick={() => repondre('annuler')}
                    className="magnetique min-h-[44px] rounded-full border border-creme/30 px-6 text-[15px] font-semibold tracking-serre text-creme"
                  >
                    {DEMO.choixAnnuler}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p
                  className="text-[15px] leading-relaxed text-creme/70"
                  aria-live="polite"
                >
                  {note}
                </p>
                <button
                  onClick={rejouer}
                  className="lift mt-4 flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-magenta-clair"
                >
                  <RotateCcw size={15} aria-hidden="true" />
                  {DEMO.rejouer}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/*
 * Le cadre. Avec photo, c'est elle ; sans photo, un boîtier dessiné en
 * CSS. Le boîtier est en aubergine et l'écran en encre : sur une section
 * encre, c'est ce léger écart qui fait lire un objet posé là plutôt
 * qu'un rectangle découpé dans le fond.
 */
function Telephone({ children }) {
  return (
    <div className="relative">
      {MEDIAS.telephone && (
        <img
          src={MEDIAS.telephone}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full rounded-[2.6rem] object-cover"
          aria-hidden="true"
        />
      )}

      <div className="relative overflow-hidden rounded-[2.6rem] border border-creme/15 bg-aubergine p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.75)]">
        {/* L'encoche. Deux pixels de crédibilité pour rien. */}
        <div
          className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-creme/20"
          aria-hidden="true"
        />
        <div className="min-h-[420px] rounded-[1.9rem] bg-encre p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

/*
 * La conversation.
 *
 * `aria-live` annonce chaque nouvelle bulle à voix haute : la démo est
 * jouable sans voir l'écran, ce qui est le minimum pour une section dont
 * tout l'intérêt est d'être essayée.
 */
function Conversation({ bulles, etiquette }) {
  const liste = useRef(null)
  const compte = useRef(bulles.length)

  useEffect(() => {
    // On n'anime que les bulles VRAIMENT nouvelles. Rejouer l'entrée de
    // toute la conversation à chaque ajout donnerait un clignotement.
    const nouvelles = bulles.length - compte.current
    compte.current = bulles.length
    if (nouvelles <= 0 || mouvementReduit() || !liste.current) return

    const elements = Array.from(liste.current.children).slice(-nouvelles)

    // Un contexte, même pour un tween : il meurt avec le composant. Sans
    // lui, une bulle animée pendant qu'on quitte la section laisse un
    // tween qui écrit dans un nœud démonté.
    const ctx = gsap.context(() => {
      gsap.from(elements, {
        y: 14,
        opacity: 0,
        scale: 0.96,
        duration: DUREE_TOUCHE,
        ease: 'back.out(1.6)',
        stagger: 0.18,
      })
    }, liste)

    return () => ctx.revert()
  }, [bulles.length])

  return (
    <>
      {etiquette && (
        <p className="micro mb-3 inline-block rounded-full bg-magenta/25 px-3 py-1 text-magenta-clair">
          {etiquette}
        </p>
      )}

      <div ref={liste} className="space-y-3" aria-live="polite">
        {bulles.map((bulle, i) => (
          <Bulle key={`${bulle.heure}-${i}`} {...bulle} />
        ))}
      </div>
    </>
  )
}

function Bulle({ sens, texte, heure }) {
  const envoye = sens === 'envoye'

  return (
    <div className={`flex ${envoye ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-snug ${
          envoye
            ? 'rounded-br-md bg-magenta text-creme'
            : 'rounded-bl-md border border-creme/10 bg-creme/[0.07] text-creme'
        }`}
      >
        {texte}
        <span
          className={`mt-1 block text-[11px] ${
            envoye ? 'text-creme/65' : 'text-creme/45'
          }`}
        >
          {heure}
        </span>
      </div>
    </div>
  )
}
