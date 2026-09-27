import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { CTA_TARIF, allerA } from '../donnees'

/*
 * Barre d'action collée en bas sur mobile.
 *
 * Sans elle, agir suppose de retrouver la section Tarifs en faisant défiler
 * une page longue. Ici l'action reste à portée de pouce en permanence, dès
 * qu'on a dépassé le héros.
 */
export default function BarreMobile() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const cible = document.getElementById('sentinelle-hero')
    if (!cible) return

    const observateur = new IntersectionObserver(([entree]) => setVisible(!entree.isIntersecting), {
      threshold: 0,
    })

    observateur.observe(cible)
    return () => observateur.disconnect()
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-4 transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] lg:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))', paddingTop: '0.5rem' }}
    >
      <button
        type="button"
        onClick={() => allerA('tarifs')}
        className="magnetique flex w-full items-center justify-center gap-2 rounded-full bg-magenta py-4 text-[16px] font-semibold tracking-serre text-creme shadow-[0_12px_40px_-12px_rgba(194,24,91,0.8)]"
      >
        {CTA_TARIF}
        <ArrowRight size={17} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  )
}
