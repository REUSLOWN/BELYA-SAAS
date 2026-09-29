import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Plus } from 'lucide-react'
import { FAQ } from '../donnees'
import { mouvementReduit, reveler, revelerTitre } from '../lib/mouvement'

/*
 * S8 — LA FAQ.
 *
 * Six questions. Ce sont les objections réelles d'une gérante qui
 * hésite, dans l'ordre où elles arrivent : est-ce que ça complique la
 * vie de mes clientes, est-ce que ça annule à ma place, est-ce que ça me
 * coupe sans prévenir, combien de temps pour démarrer, suis-je piégée,
 * qui voit mes numéros.
 *
 * ────────────────────────────────────────────────────────────────────
 * LA RÈGLE QUI GOUVERNE CETTE SECTION
 * ────────────────────────────────────────────────────────────────────
 *
 * Chaque réponse est vérifiée dans le code de `belya-app`, en lecture
 * seule, et sa source est citée en commentaire dans `donnees.js`. Une
 * FAQ est le seul endroit d'une page de vente où l'on promet du
 * comportement précis : « il ne l'annule jamais », « rien n'est
 * supprimé ». Promis à tort, c'est un litige. Une réponse qui cesse
 * d'être vraie doit donc être RETIRÉE, pas réécrite au jugé.
 *
 * ────────────────────────────────────────────────────────────────────
 * POURQUOI <details> ET NON UN ACCORDÉON MAISON
 * ────────────────────────────────────────────────────────────────────
 *
 * Un accordéon en div + useState demande de recoder l'ouverture au
 * clavier, `aria-expanded`, le lien entre le bouton et son panneau, et
 * la recherche dans la page (Ctrl+F ne trouve pas un texte masqué en
 * JavaScript). `<details>` fait tout ça nativement, et il s'ouvre même
 * sans JavaScript : c'est donc la seule version où les six réponses sont
 * toujours accessibles. GSAP n'ajoute que la hauteur qui se déplie.
 */

export default function Faq() {
  const racine = useRef(null)
  const titre = useRef(null)

  useEffect(() => {
    let nettoyerTitre = () => {}
    const ctx = gsap.context(() => {
      nettoyerTitre = revelerTitre(titre.current)
      reveler('[data-faq]', { declencheur: racine.current, decalage: 0.06 })
    }, racine)

    return () => {
      nettoyerTitre()
      ctx.revert()
    }
  }, [])

  return (
    <section
      id="questions"
      ref={racine}
      className="bg-creme px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-3xl">
        <p data-faq className="micro flex items-center gap-4 text-magenta">
          <span className="h-px w-10 shrink-0 bg-magenta" aria-hidden="true" />
          Questions
        </p>

        <h2
          ref={titre}
          className="mt-8 text-[clamp(1.9rem,5vw,3.2rem)] font-extrabold leading-[1.05] tracking-tresserre text-encre"
        >
          Ce qu’on nous demande
          <span className="block font-drama italic text-magenta">
            avant de commencer.
          </span>
        </h2>

        <div className="mt-12 divide-y divide-encre/10 border-y border-encre/10">
          {FAQ.map((entree) => (
            <Question key={entree.question} {...entree} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Question({ question, reponse }) {
  const detail = useRef(null)
  const corps = useRef(null)

  useEffect(() => {
    const element = detail.current
    if (!element || mouvementReduit()) return

    /*
     * `<details>` n'anime pas sa hauteur : il affiche ou masque, net.
     * On intercepte donc le clic pour piloter la fermeture nous-mêmes —
     * à l'ouverture, le navigateur pose `open` avant l'animation, donc
     * il n'y a rien à retenir ; à la fermeture, il faut au contraire le
     * garder ouvert le temps du repli.
     */
    const basculer = (evenement) => {
      evenement.preventDefault()

      if (!element.open) {
        element.open = true
        gsap.fromTo(
          corps.current,
          { height: 0, opacity: 0 },
          {
            height: 'auto',
            opacity: 1,
            duration: 0.45,
            ease: 'power2.out',
            clearProps: 'height',
          },
        )
        return
      }

      gsap.to(corps.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          element.open = false
          gsap.set(corps.current, { clearProps: 'all' })
        },
      })
    }

    const resume = element.querySelector('summary')
    resume.addEventListener('click', basculer)
    return () => resume.removeEventListener('click', basculer)
  }, [])

  return (
    <details ref={detail} className="group">
      {/*
        44 px de hauteur minimum, comme toute cible tactile de la page.
        `list-none` retire le triangle du navigateur, qu'on remplace par
        une croix qui pivote — une flèche dirait « aller ailleurs », une
        croix dit « déplier ici ».
      */}
      <summary className="flex min-h-[44px] cursor-pointer list-none items-start justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
        <h3 className="text-[1.05rem] font-semibold leading-snug tracking-serre text-encre">
          {question}
        </h3>
        <Plus
          size={20}
          strokeWidth={2.2}
          className="mt-0.5 shrink-0 text-magenta transition-transform duration-300 group-open:rotate-45"
          aria-hidden="true"
        />
      </summary>

      <div ref={corps} className="overflow-hidden">
        <p className="max-w-2xl pb-7 text-[1rem] leading-relaxed text-encre/70">
          {reponse}
        </p>
      </div>
    </details>
  )
}
