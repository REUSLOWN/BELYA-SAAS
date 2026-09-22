import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Clock3, MessageCircle, TrendingUp } from 'lucide-react'
import { ARGUMENTS } from '../donnees'

/*
 * Trois artefacts fonctionnels. Ce ne sont pas des cartes marketing :
 * chacune est une micro-interface qui fait réellement ce qu'elle décrit.
 *
 * `font-mono` utilise la pile monospace système — aucune police téléchargée.
 */

/* ---- Carte 1 — la pile de candidates qui tourne ---- */
function CarteListeAttente() {
  const d = ARGUMENTS.listeAttente
  const [pile, setPile] = useState(d.candidates)

  useEffect(() => {
    const minuteur = setInterval(() => {
      setPile((precedent) => {
        const suivant = [...precedent]
        suivant.unshift(suivant.pop())
        return suivant
      })
    }, 3000)
    return () => clearInterval(minuteur)
  }, [])

  return (
    <Coque
      index={d.index}
      etiquette={d.etiquette}
      icone={<Clock3 size={15} />}
      titre={d.titre}
      descriptif={d.descriptif}
      pied={d.pied}
    >
      <div className="mb-4 flex items-center justify-between gap-3 rounded-[1rem] border border-encre/10 bg-creme px-4 py-2.5">
        <span className="micro text-aubergine">Créneau libéré</span>
        <span className="legende font-semibold text-encre">{d.creneau}</span>
      </div>

      <div className="relative h-[184px]">
        {pile.map((candidate, rang) => (
          <div
            key={candidate.nom}
            className="absolute inset-x-0 top-0 rounded-[1.25rem] border border-encre/10 bg-white px-4 py-3.5 shadow-[0_10px_30px_-18px_rgba(26,20,32,0.5)]"
            style={{
              transform: `translateY(${rang * 22}px) scale(${1 - rang * 0.05})`,
              zIndex: pile.length - rang,
              opacity: rang === 0 ? 1 : 0.62 - rang * 0.14,
              transition: 'transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease',
            }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[15px] font-semibold tracking-serre text-encre">
                {candidate.nom}
              </p>
              {rang === 0 && (
                <span className="rounded-full bg-magenta px-2.5 py-0.5 text-[13px] font-semibold text-creme">
                  Proposé
                </span>
              )}
            </div>
            <p className="legende mt-0.5 text-encre/70">{candidate.prestation}</p>
            <p className="legende mt-1 text-aubergine/75">{candidate.attente}</p>
          </div>
        ))}
      </div>
    </Coque>
  )
}

/* ---- Carte 2 — le flux WhatsApp qui se tape en direct ---- */
function CarteWhatsApp() {
  const d = ARGUMENTS.whatsapp
  const [historique, setHistorique] = useState([])
  const [ligne, setLigne] = useState(0)
  const [caractere, setCaractere] = useState(0)

  useEffect(() => {
    const courante = d.lignes[ligne]

    if (caractere < courante.length) {
      const t = setTimeout(() => setCaractere((c) => c + 1), 20)
      return () => clearTimeout(t)
    }

    const t = setTimeout(() => {
      setHistorique((h) => [...h, courante].slice(-3))
      setLigne((l) => (l + 1) % d.lignes.length)
      setCaractere(0)
    }, 950)
    return () => clearTimeout(t)
  }, [ligne, caractere, d.lignes])

  return (
    <Coque
      index={d.index}
      etiquette={d.etiquette}
      icone={<MessageCircle size={15} />}
      titre={d.titre}
      descriptif={d.descriptif}
      pied={d.pied}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-magenta opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-magenta" />
        </span>
        <span className="micro text-aubergine">Flux en direct</span>
      </div>

      <div className="h-[184px] overflow-hidden rounded-[1.25rem] border border-encre/10 bg-encre px-4 py-4">
        <div className="flex h-full flex-col justify-end gap-2">
          {historique.map((texte, i) => (
            <p
              key={`${texte}-${i}`}
              className="font-mono text-[13px] leading-snug text-creme/60"
            >
              {texte}
            </p>
          ))}
          <p className="font-mono text-[13px] leading-snug text-creme">
            {d.lignes[ligne].slice(0, caractere)}
            <span className="ml-0.5 inline-block h-[0.9em] w-[0.5em] translate-y-[0.1em] animate-pulse bg-magenta-clair" />
          </p>
        </div>
      </div>
    </Coque>
  )
}

/* ---- Carte 3 — le curseur qui planifie tout seul ---- */
function CarteTableauBord() {
  const d = ARGUMENTS.tableauBord
  const racine = useRef(null)
  const curseur = useRef(null)
  const [jourActif, setJourActif] = useState(null)
  const [enregistre, setEnregistre] = useState(false)

  useEffect(() => {
    const ctx = gsap.context((self) => {
      const cellules = self.selector('[data-cellule]')
      const bouton = self.selector('[data-bouton]')[0]
      if (!cellules.length || !bouton || !curseur.current) return

      // Coordonnées recalculées à chaque boucle : la carte peut changer de taille.
      const centre = (element) => {
        const base = racine.current.getBoundingClientRect()
        const boite = element.getBoundingClientRect()
        return {
          x: boite.left - base.left + boite.width / 2,
          y: boite.top - base.top + boite.height / 2,
        }
      }

      const cible = cellules[d.jourCible]

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4, repeatRefresh: true })

      tl.call(() => {
        setJourActif(null)
        setEnregistre(false)
      })
        .set(curseur.current, {
          autoAlpha: 0,
          x: () => centre(cellules[0]).x,
          y: () => centre(cellules[0]).y,
        })
        .to(curseur.current, { autoAlpha: 1, duration: 0.3, ease: 'power2.inOut' })
        .to(curseur.current, {
          x: () => centre(cible).x,
          y: () => centre(cible).y,
          duration: 0.95,
          ease: 'power3.inOut',
        })
        .to(cible, { scale: 0.95, duration: 0.12, ease: 'power2.inOut' })
        .call(() => setJourActif(d.jourCible))
        .to(cible, { scale: 1, duration: 0.28, ease: 'power2.out' })
        .to(
          curseur.current,
          {
            x: () => centre(bouton).x,
            y: () => centre(bouton).y,
            duration: 0.9,
            ease: 'power3.inOut',
          },
          '+=0.45',
        )
        .to(bouton, { scale: 0.95, duration: 0.12, ease: 'power2.inOut' })
        .call(() => setEnregistre(true))
        .to(bouton, { scale: 1, duration: 0.28, ease: 'power2.out' })
        .to(curseur.current, { autoAlpha: 0, duration: 0.4, ease: 'power2.inOut' }, '+=0.9')
    }, racine)

    return () => ctx.revert()
  }, [d.jourCible])

  return (
    <Coque
      index={d.index}
      etiquette={d.etiquette}
      icone={<TrendingUp size={15} />}
      titre={d.titre}
      descriptif={d.descriptif}
      pied={d.pied}
    >
      <div ref={racine} className="relative">
        <div className="mb-2 grid grid-cols-7 gap-1.5">
          {d.jours.map((jour, i) => (
            <div
              key={`${jour}-${i}`}
              data-cellule
              className={`flex aspect-square items-center justify-center rounded-[0.7rem] border text-[13px] font-semibold transition-colors duration-300 ${
                jourActif === i
                  ? 'border-magenta bg-magenta text-creme'
                  : 'border-encre/10 bg-creme text-encre/70'
              }`}
            >
              {jour}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {d.releve.map((bloc) => (
            <div
              key={bloc.cle}
              className="rounded-[0.9rem] border border-encre/10 bg-creme px-3 py-2.5"
            >
              <p className="legende text-aubergine/80">{bloc.cle}</p>
              <p className="mt-0.5 text-[16px] font-semibold tabular-nums tracking-serre text-encre">
                {bloc.valeur}
              </p>
            </div>
          ))}
        </div>

        <button
          data-bouton
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className={`micro mt-2 w-full rounded-[0.9rem] py-3 transition-colors duration-300 ${
            enregistre ? 'bg-aubergine text-creme' : 'bg-encre text-creme'
          }`}
        >
          {enregistre ? 'Enregistré ✓' : d.bouton}
        </button>

        {/* Le curseur fantôme */}
        <svg
          ref={curseur}
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-0 top-0 h-5 w-5 drop-shadow-[0_2px_6px_rgba(26,20,32,0.4)]"
          style={{ marginLeft: '-2px', marginTop: '-2px' }}
          aria-hidden="true"
        >
          <path
            d="M5 2.5 L5 18.5 L9.2 14.6 L11.8 20.6 L14.6 19.4 L12 13.5 L18 13.2 Z"
            fill="#1A1420"
            stroke="#FAF6F4"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Coque>
  )
}

/* ---- Coque commune aux trois cartes ---- */
function Coque({ index, etiquette, icone, titre, descriptif, pied, children }) {
  return (
    <article
      data-carte
      className="carte-surface flex flex-col rounded-[2rem] border border-encre/10 bg-creme p-6 sm:p-7"
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <span className="micro flex items-center gap-2 text-aubergine">
          <span className="text-magenta" aria-hidden="true">
            {icone}
          </span>
          {etiquette}
        </span>
        <span className="legende font-semibold text-encre/45">{index}</span>
      </div>

      <div className="flex-1">{children}</div>

      <div className="mt-7 border-t border-encre/10 pt-5">
        <h3 className="text-[1.15rem] font-extrabold leading-snug tracking-tresserre text-encre">
          {titre}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-encre/70">{descriptif}</p>
        <p className="micro mt-4 text-aubergine">{pied}</p>
      </div>
    </article>
  )
}

export default function Fonctionnalites() {
  const racine = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-anim="titre"]', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: racine.current, start: 'top 75%' },
      })

      gsap.from('[data-carte]', {
        y: 50,
        opacity: 0,
        duration: 1.05,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: { trigger: '[data-grille]', start: 'top 82%' },
      })
    }, racine)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="methode"
      ref={racine}
      className="relative bg-creme px-6 pb-28 pt-8 sm:px-10 sm:pb-36 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p data-anim="titre" className="micro text-aubergine">
            La méthode
          </p>
          <h2
            data-anim="titre"
            className="mt-5 text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-[1.06] tracking-tresserre text-encre"
          >
            Trois mécaniques qui tournent
            <span className="font-drama italic"> sans vous.</span>
          </h2>
          <p data-anim="titre" className="mt-5 text-[1rem] leading-relaxed text-encre/70">
            Rien à installer pour vos clientes. Un mot, un clic, ou rien du tout — c’est tout ce que
            Belya leur demande.
          </p>
        </div>

        <div data-grille className="mt-14 grid gap-6 lg:grid-cols-3">
          <CarteListeAttente />
          <CarteWhatsApp />
          <CarteTableauBord />
        </div>
      </div>
    </section>
  )
}
