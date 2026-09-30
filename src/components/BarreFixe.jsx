import { useEffect, useState } from 'react'
import { BARRE_MOBILE, lienWhatsAppGeneral } from '../donnees'

/*
 * LA BARRE FIXE DU BAS, SUR MOBILE.
 *
 * Sans elle, agir suppose de retrouver la section tarifs en faisant
 * défiler une page longue au pouce. Ici, le prix et l'action restent à
 * portée en permanence.
 *
 * ⚠️ NOTE POUR LE PROPRIÉTAIRE
 * `src/components/BarreMobile.jsx` est votre travail en cours, non suivi
 * par git. Je n'y ai pas touché, ni pour le lire autrement qu'en lecture
 * seule, ni pour le committer. Ce fichier-ci est SÉPARÉ et porte la
 * spécification du brief (prix à gauche, WhatsApp à droite, effacement
 * sur S9). Si vous préférez garder le vôtre, il suffit de rebrancher
 * `BarreMobile` dans `App.jsx` et de supprimer celui-ci.
 *
 * ────────────────────────────────────────────────────────────────────
 * DEUX BORNES, ET LE PIÈGE QU'ELLES CACHENT
 * ────────────────────────────────────────────────────────────────────
 *
 * Elle apparaît quand le bas du héros est SORTI PAR LE HAUT — avant,
 * l'appel à l'action est déjà à l'écran en grand, et le doubler serait
 * de l'insistance.
 *
 * Elle disparaît dès que l'appel final entre à l'écran : là aussi le
 * bouton est visible, et deux fois le même appel se lit comme du
 * harcèlement. Et elle reste cachée dans le pied de page, qui vient
 * après.
 *
 * ⚠️ LE PIÈGE. « La sentinelle n'est pas à l'écran » ne dit pas si elle
 * est AU-DESSUS ou EN DESSOUS. La version précédente s'y prenait, et
 * produisait exactement les deux défauts constatés :
 *
 *   · au chargement, le bas du héros est sous la ligne de flottaison
 *     dès que le héros dépasse la hauteur de l'écran — donc « pas à
 *     l'écran », donc la barre s'affichait tout de suite ;
 *   · dans le pied de page, l'appel final est repassé au-dessus — donc
 *     « pas à l'écran » là aussi, donc la barre revenait.
 *
 * On lit donc `boundingClientRect` que l'observateur fournit déjà :
 * `bottom <= 0` pour « sorti par le haut », `top > 0` pour « encore en
 * dessous ». Les deux états partent à faux, donc la barre est cachée au
 * chargement quoi qu'il arrive, et l'observateur corrige aussitôt.
 *
 * `env(safe-area-inset-bottom)` tient compte de la barre de gestes des
 * iPhone et des Android récents : sans elle, le bouton passe sous le
 * trait du système et devient intouchable.
 */

export default function BarreFixe() {
  // Le bas du héros est-il sorti par le haut ?
  const [heroSorti, setHeroSorti] = useState(false)
  // L'appel final est-il encore entièrement sous l'écran ?
  const [finalEnDessous, setFinalEnDessous] = useState(false)

  useEffect(() => {
    const observateurs = []

    const suivre = (id, lire) => {
      const cible = document.getElementById(id)
      if (!cible) return

      const observateur = new IntersectionObserver(
        ([entree]) => lire(entree),
        { threshold: 0 },
      )
      observateur.observe(cible)
      observateurs.push(observateur)
    }

    suivre('sentinelle-hero', (entree) =>
      setHeroSorti(!entree.isIntersecting && entree.boundingClientRect.bottom <= 0),
    )

    suivre('sentinelle-final', (entree) =>
      setFinalEnDessous(!entree.isIntersecting && entree.boundingClientRect.top > 0),
    )

    return () => observateurs.forEach((o) => o.disconnect())
  }, [])

  const visible = heroSorti && finalEnDessous
  const destination = lienWhatsAppGeneral()

  if (!destination) return null

  return (
    <div
      /*
        Fond crème OPAQUE, et pas de flou. Le brief réserve le verre
        dépoli à la navbar, et il a raison : un `backdrop-blur` sur un
        élément fixe force le navigateur à recomposer la zone à chaque
        image du défilement, ce qui se voit sur un Android modeste. Ici
        un fond plein coûte zéro.
      */
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-encre/10 bg-creme px-4 shadow-[0_-8px_30px_-12px_rgba(26,20,32,0.18)] transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] lg:hidden ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-full opacity-0'
      }`}
      style={{
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        paddingTop: '0.75rem',
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-[15px] font-semibold leading-tight tracking-serre text-encre">
          {BARRE_MOBILE.prix}
        </p>

        <a
          href={destination}
          target="_blank"
          rel="noopener noreferrer"
          className="magnetique flex min-h-[44px] shrink-0 items-center rounded-full bg-magenta px-7 text-[15px] font-semibold tracking-serre text-creme shadow-[0_10px_30px_-12px_rgba(194,24,91,0.8)]"
        >
          {BARRE_MOBILE.action}
        </a>
      </div>
    </div>
  )
}
