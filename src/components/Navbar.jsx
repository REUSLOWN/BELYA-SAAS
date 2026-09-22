import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NAV_LIENS, allerA } from '../donnees'
import Bouton from './Bouton'

/*
 * L'île flottante. Le héros étant désormais crème, le texte est sombre dès
 * le départ : seul le fond flouté et la bordure apparaissent au scroll.
 */
export default function Navbar() {
  const [pose, setPose] = useState(false)
  const [ouvert, setOuvert] = useState(false)

  useEffect(() => {
    const cible = document.getElementById('sentinelle-hero')
    if (!cible) return

    const observateur = new IntersectionObserver(([entree]) => setPose(!entree.isIntersecting), {
      rootMargin: '0px',
      threshold: 0,
    })

    observateur.observe(cible)
    return () => observateur.disconnect()
  }, [])

  const naviguer = (ancre) => {
    setOuvert(false)
    allerA(ancre)
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-6">
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
            className="lift text-encre md:hidden"
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
                  className="nav-lien text-left text-encre/85"
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
