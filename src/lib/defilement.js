import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/*
 * LE DÉFILEMENT — ce qui fait 80 % de la sensation « premium ».
 *
 * Un site primé ne se distingue pas d'abord par ses images : il se
 * distingue parce que la page GLISSE. Le défilement natif est saccadé et
 * s'arrête net ; un défilement inertiel donne du poids à la page, comme
 * une porte de voiture haut de gamme.
 *
 * Lenis fait ça en 3 Ko compressés. Il remplace le défilement du
 * navigateur par une interpolation image par image, et on le branche sur
 * l'horloge de GSAP pour que les deux restent en phase — sans ça, les
 * animations liées au défilement tremblent d'une image.
 *
 * DEUX RÈGLES NON NÉGOCIABLES.
 *
 *   1. `prefers-reduced-motion` désactive tout. Un défilement inertiel
 *      donne la nausée à qui y est sensible, et c'est exactement le
 *      public qui a réglé cette préférence.
 *   2. Au clavier et sur mobile, on ne touche à rien : Lenis laisse le
 *      défilement tactile natif, qui est déjà fluide et que personne ne
 *      fait mieux que le système.
 */

let instance = null

export function demarrerDefilement() {
  if (typeof window === 'undefined') return () => {}

  const doux = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (doux || instance) return () => {}

  instance = new Lenis({
    // 1,1 s pour amortir : assez pour qu'on sente le poids, assez court
    // pour qu'on ne se batte jamais contre la page.
    duration: 1.1,
    // Quartique sortante. Elle décélère plus franchement en fin de course
    // que l'exponentielle qu'on avait : la page s'arrête où l'on visait,
    // au lieu de continuer à ramper pendant un dixième de seconde.
    easing: (t) => 1 - Math.pow(1 - t, 4),
    // Le tactile garde le défilement du système : il est déjà parfait,
    // et l'intercepter casse le rebond natif d'iOS.
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1,
  })

  // Une seule horloge pour les deux, sinon les animations liées au
  // défilement tremblent.
  instance.on('scroll', ScrollTrigger.update)
  const battement = (temps) => instance.raf(temps * 1000)
  gsap.ticker.add(battement)
  gsap.ticker.lagSmoothing(0)

  /*
   * Une poignée sur `window`, et une seule.
   *
   * `allerA()` dans donnees.js s'en sert pour faire glisser les ancres
   * au lieu de sauter. Pourquoi pas un import : donnees.js est chargé
   * par le rendu serveur du build, et importer Lenis l'exécuterait dans
   * Node. Une poignée posée uniquement côté navigateur évite ça — et
   * elle fait glisser AUSSI les ancres de BarreMobile.jsx, fichier que
   * je n'ai pas à modifier.
   */
  window.__belyaDefilement = instance

  return () => {
    gsap.ticker.remove(battement)
    delete window.__belyaDefilement
    instance?.destroy()
    instance = null
  }
}

/* Aller à une ancre en glissant, et non en sautant. */
export function glisserVers(cible, decalage = 0) {
  const element =
    typeof cible === 'string' ? document.getElementById(cible) : cible
  if (!element) return

  if (instance) {
    instance.scrollTo(element, { offset: decalage, duration: 1.3 })
  } else {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/* Utile quand une modale s'ouvre : on gèle la page derrière. */
export function figerDefilement(figer) {
  if (!instance) return
  figer ? instance.stop() : instance.start()
}
