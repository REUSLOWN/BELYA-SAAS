import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { mouvementReduit } from '../lib/mouvement'

/*
 * L'INDICATEUR DE PROGRESSION.
 *
 * Deux pixels de magenta en haut de l'écran, qui avancent avec la page.
 * Sur une page longue avec des sections épinglées, la barre de
 * défilement du navigateur devient trompeuse : elle n'avance pas pendant
 * que le héros ou les mécaniques se déroulent, et on croit être bloqué.
 * Ce trait-là, lui, avance toujours.
 *
 * Il ne remplace rien et ne reçoit pas le focus : c'est une information,
 * pas une commande, donc `aria-hidden`. Un lecteur d'écran a déjà la
 * structure de la page par ses titres.
 *
 * En mouvement réduit, on ne l'anime pas — et comme il part à
 * `scaleX(0)`, ne pas l'animer revient à ne pas l'afficher. Un élément
 * qui bouge en permanence au bord du champ est précisément ce que cette
 * préférence demande d'éviter. C'est aussi l'état sans JavaScript, et
 * c'est le bon : un indicateur de progression figé à zéro serait un
 * mensonge, alors qu'absent il ne dit rien.
 */

export default function Progression() {
  const trait = useRef(null)

  useEffect(() => {
    if (mouvementReduit() || !trait.current) return

    const declencheur = ScrollTrigger.create({
      // Le document entier, et non une section : c'est la progression
      // dans la page qu'on montre.
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        gsap.set(trait.current, { scaleX: self.progress })
      },
    })

    return () => declencheur.kill()
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]"
      aria-hidden="true"
    >
      <div
        ref={trait}
        className="h-full w-full origin-left bg-magenta"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}
