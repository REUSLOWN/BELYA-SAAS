import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SCENE, fcfa } from '../donnees'
import { mouvementReduit } from '../lib/mouvement'

/*
 * LA SCÈNE — le produit en huit secondes, sans une seule vidéo.
 *
 * Tout le site explique le mécanisme anti-absence. Aucune section ne le
 * MONTRE. C'est pourtant le seul argument qui se comprend sans lire :
 * une place se vide, Belya la remplit, l'argent revient.
 *
 * Pourquoi du SVG animé et pas une vidéo. Une gérante d'Abidjan ouvre
 * cette page en 3G, sur un forfait qu'elle paie au méga-octet. Une vidéo
 * de fond, même courte et compressée, pèse 1 à 3 Mo — cent à trois cents
 * fois cette scène, qui tient dans le bundle déjà chargé. Elle serait
 * aussi le premier élément à ne pas s'afficher sur une connexion lente,
 * c'est-à-dire exactement chez la personne qu'on veut convaincre.
 *
 * Ce qui remplace la vidéo : du mouvement dessiné. Rien à télécharger,
 * net à toutes les tailles, et modifiable en une ligne quand le discours
 * change.
 *
 * Trois exigences tenues :
 *   - la scène est lisible À L'ARRÊT. Le HTML pré-rendu montre déjà
 *     l'état final, donc rien ne clignote avant l'hydratation ;
 *   - `prefers-reduced-motion` coupe l'animation et laisse l'état final ;
 *   - l'animation ne tourne que visible à l'écran — pas de cycle CPU
 *     brûlé dans le pied de page.
 */

const COLONNES = ['L', 'M', 'M', 'J', 'V', 'S']
const LIBRE = '#2B1B2E'
const PRIS = '#C2185B'

export default function SceneRevente() {
  const racine = useRef(null)
  const [etape, setEtape] = useState(SCENE.etapes.length - 1)

  useEffect(() => {
    // Mouvement réduit : on ne touche à rien. Le SVG est écrit dans son
    // état FINAL — place reprise, « OUI » reçu, gain affiché — donc la
    // scène se lit entièrement sans une seule animation. C'est aussi ce
    // que voit quelqu'un dont le JavaScript n'a pas encore chargé.
    //
    // La question passe par `mouvementReduit()` et non par un
    // matchMedia local : une seule façon de la poser dans toute la base,
    // et le script de vérification peut la trouver.
    if (mouvementReduit()) return

    const ctx = gsap.context(() => {
      // On recule au premier plan de la séquence. La section est sous la
      // ligne de flottaison : personne ne voit ce retour en arrière.
      const auDepart = () => {
        gsap.set('[data-place="cible"]', { attr: { fill: PRIS } })
        gsap.set('[data-vide]', { opacity: 0 })
        gsap.set('[data-bulle]', { opacity: 0, x: 0, y: 0 })
        gsap.set('[data-candidate]', { opacity: 0.25 })
        gsap.set('[data-oui]', { opacity: 0, scale: 0.6 })
        gsap.set('[data-gain]', { opacity: 0, y: 8 })
      }
      auDepart()

      const chrono = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.6,
        paused: true,
        onRepeat: auDepart,
      })

      chrono
        .call(() => setEtape(0))

        // 2. Samedi 14 h : la cliente annule. La place se vide.
        .to('[data-place="cible"]', {
          attr: { fill: 'transparent' },
          duration: 0.45,
          ease: 'power2.inOut',
        }, '+=0.9')
        .fromTo('[data-vide]',
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' },
          '<')
        .call(() => setEtape(1), null, '<')

        // 3. Belya prévient la liste d'attente.
        .to('[data-candidate]', {
          opacity: 1,
          duration: 0.3,
          stagger: 0.12,
          ease: 'power2.out',
        }, '+=0.35')
        .call(() => setEtape(2), null, '<')
        .fromTo('[data-bulle]',
          { opacity: 0, x: 0, y: 0, scale: 0.7 },
          { opacity: 1, x: 96, y: 54, scale: 1,
            duration: 0.75, ease: 'power2.inOut' },
          '<0.2')

        // 4. « OUI ». La place repart.
        .to('[data-bulle]', { opacity: 0, duration: 0.25 })
        .fromTo('[data-oui]',
          { opacity: 0, scale: 0.6 },
          { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.5)' },
          '<0.1')
        .call(() => setEtape(3), null, '<')
        .to('[data-vide]', { opacity: 0, duration: 0.25 }, '<')
        .to('[data-place="cible"]', {
          attr: { fill: PRIS },
          duration: 0.45,
          ease: 'power2.out',
        }, '<')

        // 5. Le gain apparaît. C'est le seul chiffre qui compte.
        .to('[data-gain]', {
          opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
        }, '+=0.2')
        .call(() => setEtape(4), null, '<')
        .to({}, { duration: 1.6 })

      // Elle ne tourne que sous les yeux de quelqu'un.
      ScrollTrigger.create({
        trigger: racine.current,
        start: 'top 75%',
        end: 'bottom 25%',
        onEnter: () => chrono.play(),
        onEnterBack: () => chrono.play(),
        onLeave: () => chrono.pause(),
        onLeaveBack: () => chrono.pause(),
      })
    }, racine)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={racine}
      id="scene"
      className="bg-encre px-6 py-24 text-creme sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
        <div>
          <p className="micro flex items-center gap-4 text-magenta-clair">
            <span className="h-px w-10 shrink-0 bg-magenta-clair" aria-hidden="true" />
            {SCENE.surtitre}
          </p>

          <h2 className="mt-8 text-[clamp(1.9rem,5vw,3.2rem)] font-extrabold leading-[1.05] tracking-tresserre">
            {SCENE.titreSans}
            <span className="block font-drama text-magenta-clair italic">
              {SCENE.titreSerif}
            </span>
          </h2>

          <p className="mt-7 max-w-md text-[1.05rem] leading-relaxed text-creme/70">
            {SCENE.chapo}
          </p>

          {/*
            La légende suit la scène. Un lecteur d'écran n'a pas besoin de
            l'animation : la liste complète lui est lue d'un coup.
          */}
          <ol className="mt-9 space-y-3">
            {SCENE.etapes.map((texte, i) => (
              <li
                key={texte}
                className={`flex items-start gap-3 text-[15px] leading-snug transition-colors duration-500 ${
                  i === etape ? 'text-creme' : 'text-creme/35'
                }`}
              >
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500 ${
                    i === etape ? 'bg-magenta-clair' : 'bg-creme/25'
                  }`}
                  aria-hidden="true"
                />
                {texte}
              </li>
            ))}
          </ol>
        </div>

        <ScenarioDessine />
      </div>
    </section>
  )
}

/*
 * Le dessin. Une semaine d'agenda, trois clientes en attente, une bulle
 * qui traverse. Tout est en coordonnées fixes dans un viewBox : la scène
 * est nette sur un téléphone comme sur un écran de bureau, et elle ne
 * pèse que le texte qui la décrit.
 */
function ScenarioDessine() {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 400 300"
        className="w-full"
        role="img"
        aria-label={SCENE.alternative}
      >
        {/* ── L'agenda de la semaine ── */}
        <text x="14" y="26" className="fill-creme/45" fontSize="11"
              fontWeight="600" letterSpacing="1.4">
          {SCENE.agenda}
        </text>

        {COLONNES.map((jour, c) => (
          <text
            key={`${jour}-${c}`}
            x={30 + c * 58} y="50"
            textAnchor="middle"
            className="fill-creme/40"
            fontSize="11" fontWeight="600"
          >
            {jour}
          </text>
        ))}

        {COLONNES.map((_, c) =>
          [0, 1, 2].map((r) => {
            const cible = c === 5 && r === 1
            return (
              <rect
                key={`${c}-${r}`}
                data-place={cible ? 'cible' : 'normale'}
                x={30 + c * 58 - 22} y={62 + r * 34}
                width="44" height="26" rx="7"
                fill={cible || (c + r) % 3 !== 2 ? PRIS : LIBRE}
                opacity={cible || (c + r) % 3 !== 2 ? 1 : 0.35}
                stroke={cible ? '#E8447F' : 'none'}
                strokeWidth={cible ? 1.5 : 0}
              />
            )
          }),
        )}

        {/* La place qui se libère, quand elle est vide. */}
        <g data-vide opacity="0">
          <rect x={30 + 5 * 58 - 22} y={62 + 34} width="44" height="26"
                rx="7" fill="none" stroke="#E8447F" strokeWidth="1.5"
                strokeDasharray="4 3" />
          <text x={30 + 5 * 58} y={62 + 34 + 17} textAnchor="middle"
                className="fill-magenta-clair" fontSize="9" fontWeight="700">
            libre
          </text>
        </g>

        {/* Le « OUI » qui revient. */}
        <g data-oui opacity="1" style={{ transformOrigin: '318px 96px' }}>
          <rect x="296" y="84" width="44" height="22" rx="11"
                fill="#E8447F" />
          <text x="318" y="99" textAnchor="middle" fill="#1A1420"
                fontSize="11" fontWeight="800">OUI</text>
        </g>

        {/* ── La liste d'attente ── */}
        <text x="14" y="196" className="fill-creme/45" fontSize="11"
              fontWeight="600" letterSpacing="1.4">
          {SCENE.attente}
        </text>

        {SCENE.candidates.map((nom, i) => (
          <g key={nom} data-candidate opacity="1">
            <circle cx={32} cy={218 + i * 28} r="10"
                    fill="none" stroke="#E8447F" strokeWidth="1.5" />
            <text x={32} y={222 + i * 28} textAnchor="middle"
                  className="fill-magenta-clair" fontSize="10"
                  fontWeight="700">
              {nom.slice(0, 1)}
            </text>
            <text x={52} y={222 + i * 28} className="fill-creme/75"
                  fontSize="12">
              {nom}
            </text>
          </g>
        ))}

        {/* La bulle WhatsApp qui part de la place vers la première cliente. */}
        <g data-bulle opacity="0" style={{ transformOrigin: '288px 96px' }}>
          <rect x="262" y="84" width="52" height="24" rx="12"
                fill="#E8447F" opacity="0.9" />
          <circle cx="276" cy="96" r="2.5" fill="#1A1420" />
          <circle cx="288" cy="96" r="2.5" fill="#1A1420" />
          <circle cx="300" cy="96" r="2.5" fill="#1A1420" />
        </g>

        {/* ── Le gain ── */}
        <g data-gain opacity="1">
          <rect x="196" y="196" width="190" height="72" rx="16"
                fill="#C2185B" opacity="0.14" stroke="#E8447F"
                strokeWidth="1" />
          <text x="214" y="222" className="fill-creme/60" fontSize="10"
                fontWeight="600" letterSpacing="1.2">
            {SCENE.gainLibelle}
          </text>
          <text x="214" y="252" className="fill-creme" fontSize="26"
                fontWeight="800" letterSpacing="-0.5">
            {fcfa(SCENE.gain)}
          </text>
        </g>
      </svg>
    </div>
  )
}
