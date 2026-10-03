import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NAV_LIENS, allerA } from '../donnees'
import Bouton from './Bouton'

/*
 * L'île flottante. Le héros étant désormais crème, le texte est sombre dès
 * le départ : seul le fond flouté et la bordure apparaissent au scroll.
 *
 * Elle se retire aussi quand on descend, et revient quand on remonte.
 * Sur une page longue lue au pouce, une barre qui occupe le haut de
 * l'écran en permanence coûte une ligne de texte à chaque écran ; la
 * faire revenir au moindre geste vers le haut rend la navigation sans
 * qu'on l'ait cherchée. Le seuil de 14 px évite qu'elle clignote au
 * rebond élastique d'iOS, et le menu ouvert la retient toujours —
 * escamoter un menu qu'on vient d'ouvrir serait une trahison.
 */
export default function Navbar() {
  const [pose, setPose] = useState(false)
  const [ouvert, setOuvert] = useState(false)
  const [cachee, setCachee] = useState(false)

  useEffect(() => {
    // Le vol pose sa propre sentinelle, hors écran : sur un film, la
    // navigation garde son fond dès le départ.
    const cible =
      document.getElementById('sentinelle-nav') ||
      document.getElementById('sentinelle-hero')
    if (!cible) return

    const observateur = new IntersectionObserver(([entree]) => setPose(!entree.isIntersecting), {
      rootMargin: '0px',
      threshold: 0,
    })

    observateur.observe(cible)
    return () => observateur.disconnect()
  }, [])

  useEffect(() => {
    let dernier = window.scrollY

    const auDefilement = () => {
      const y = window.scrollY

      // L'autopilote du vol fait avancer le film en déplaçant le
      // défilement, mais la scène est collée : pour la visiteuse, la page
      // ne bouge pas. Cacher la barre ici la ferait disparaître sans
      // raison visible, en plein film. On suit la position sans la cacher.
      //
      // Une exception : « Revoir » remonte au début du film. Remonter
      // montre la barre, comme pour un défilement de la visiteuse — sans
      // ça, une barre cachée par un coup de molette plus tôt resterait
      // absente en haut de page, là où l'on cherche la navigation.
      if (window.__belyaAutopilote) {
        if (y < dernier) setCachee(false)
        dernier = y
        return
      }

      const delta = y - dernier

      // Sous 14 px de mouvement, on ne décide rien : c'est le rebond
      // élastique, pas une intention.
      if (Math.abs(delta) < 14) return
      dernier = y

      // Dans les cent premiers pixels, on ne se cache jamais : le haut
      // de page est l'endroit où l'on cherche la navigation.
      setCachee(delta > 0 && y > 100)
    }

    window.addEventListener('scroll', auDefilement, { passive: true })
    return () => window.removeEventListener('scroll', auDefilement)
  }, [])

  const naviguer = (ancre) => {
    setOuvert(false)
    allerA(ancre)
  }

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] sm:pt-6 ${
        cachee && !ouvert ? '-translate-y-[130%]' : 'translate-y-0'
      }`}
    >
      <nav
        className={`pointer-events-auto w-full max-w-5xl rounded-[2rem] border transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          pose
            ? 'border-encre/10 bg-creme/70 shadow-[0_8px_40px_-16px_rgba(26,20,32,0.28)] backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-3 sm:px-7 sm:py-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="lift text-[22px] font-extrabold tracking-tresserre text-encre"
          >
            Belya
            <span className="text-magenta">.</span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LIENS.map((lien) => (
              <button
                key={lien.ancre}
                onClick={() => naviguer(lien.ancre)}
                className="nav-lien lift souligne-anime text-encre/80 hover:text-encre"
              >
                {lien.libelle}
              </button>
            ))}
          </div>

          <div className="hidden md:block">
            <Bouton taille="petit" onClick={() => naviguer('calculateur')}>
              Calculer ma perte
            </Bouton>
          </div>

          <button
            onClick={() => setOuvert((v) => !v)}
            aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={ouvert}
            className="lift -mr-2.5 flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center text-encre md:hidden"
          >
            {ouvert ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {ouvert && (
          <div className="rounded-b-[2rem] border-t border-encre/10 bg-creme/95 px-5 pb-5 pt-4 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-3">
              {NAV_LIENS.map((lien) => (
                <button
                  key={lien.ancre}
                  onClick={() => naviguer(lien.ancre)}
                  className="nav-lien flex min-h-[44px] items-center text-left text-encre/85"
                >
                  {lien.libelle}
                </button>
              ))}
              <Bouton taille="petit" className="mt-2 w-full" onClick={() => naviguer('calculateur')}>
                Calculer ma perte
              </Bouton>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
