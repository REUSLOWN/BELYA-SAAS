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
 * DEUX BORNES, PAS UNE
 * ────────────────────────────────────────────────────────────────────
 *
 * Elle apparaît après le héros — avant, l'appel à l'action est déjà à
 * l'écran en grand, et la doubler serait de l'insistance.
 *
 * Elle disparaît sur l'appel final — là aussi le bouton est à l'écran, et
 * deux fois le même appel se lit comme du harcèlement. C'est ce second
 * effacement qui distingue une barre soignée d'un bandeau collant.
 *
 * `env(safe-area-inset-bottom)` tient compte de la barre de gestes des
 * iPhone et des Android récents : sans elle, le bouton passe sous le
 * trait du système et devient intouchable.
 */

export default function BarreFixe() {
  const [passeHero, setPasseHero] = useState(false)
  const [surFinal, setSurFinal] = useState(false)

  useEffect(() => {
    const observateurs = []

    const suivre = (id, regler) => {
      const cible = document.getElementById(id)
      if (!cible) return

      const observateur = new IntersectionObserver(
        ([entree]) => regler(!entree.isIntersecting),
        { threshold: 0 },
      )
      observateur.observe(cible)
      observateurs.push(observateur)
    }

    // Le héros : « dépassé » = la sentinelle n'est plus à l'écran.
    suivre('sentinelle-hero', setPasseHero)
    // L'appel final : on inverse — visible signifie qu'on y est.
    suivre('sentinelle-final', (dehors) => setSurFinal(!dehors))

    return () => observateurs.forEach((o) => o.disconnect())
  }, [])

  const visible = passeHero && !surFinal
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
