import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

/*
 * LE SYSTÈME DE MOUVEMENT.
 *
 * Cinq primitives, et rien d'autre. Chaque section de la page s'anime
 * en les appelant, jamais en écrivant sa propre timeline : c'est ce qui
 * fait qu'une page a l'air dessinée par une seule main plutôt que par
 * huit composants qui bougent chacun à sa façon. Un site primé n'a pas
 * plus d'animations qu'un autre — il a les MÊMES partout.
 *
 * ────────────────────────────────────────────────────────────────────
 * TROIS RÈGLES QUI NE SE NÉGOCIENT PAS
 * ────────────────────────────────────────────────────────────────────
 *
 * 1. ON N'ANIME JAMAIS DEPUIS UN ÉTAT CACHÉ EN CSS.
 *    Tout part de `gsap.from()`, qui pose l'état de départ au moment
 *    d'animer. Si le JavaScript ne charge pas — 3G qui coupe, greffon
 *    bloqué, robot d'indexation — la page reste entièrement lisible,
 *    parce qu'elle n'a jamais été cachée. Une classe `.invisible` dans
 *    le HTML pré-rendu produirait l'inverse : une page blanche.
 *
 * 2. `prefers-reduced-motion` NE DÉGRADE PAS, IL CALME.
 *    Chaque primitive sort immédiatement si la préférence est posée, et
 *    laisse l'état final. Pas de version amoindrie : la même page, sans
 *    mouvement. C'est la bonne réponse pour qui a des vertiges — et le
 *    seul moyen de ne pas lui offrir une page à moitié construite.
 *
 * 3. RIEN NE TOURNE HORS DE L'ÉCRAN.
 *    Tout est accroché à ScrollTrigger, donc rien ne consomme de cycle
 *    dans le pied de page. Sur un Android milieu de gamme — le téléphone
 *    de la gérante qu'on veut convaincre — c'est la différence entre une
 *    page fluide et une page qui chauffe.
 */

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText)
}

/* La courbe de la maison. Une seule, partout : c'est elle qu'on reconnaît. */
export const COURBE = 'power3.out'

export function mouvementReduit() {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/*
 * ── 1. RÉVÉLER ───────────────────────────────────────────────────────
 *
 * Le mouvement de base : l'élément monte de quelques pixels en
 * apparaissant, quand il croise le bas de l'écran.
 *
 * La montée est volontairement courte (32 px) et la durée longue
 * (0,95 s). L'inverse — un grand déplacement rapide — donne une page
 * « qui saute ». Peu de distance et beaucoup de temps, c'est ce qui
 * produit la sensation de poids qu'on paie cher ailleurs.
 */
export function reveler(cibles, options = {}) {
  if (mouvementReduit()) return null

  const {
    y = 32,
    duree = 0.95,
    decalage = 0.08,
    depart = 'top 85%',
    declencheur = null,
  } = options

  return gsap.from(cibles, {
    y,
    opacity: 0,
    duration: duree,
    ease: COURBE,
    stagger: decalage,
    scrollTrigger: {
      trigger: declencheur || cibles,
      start: depart,
      once: true,
    },
  })
}

/*
 * ── 2. RÉVÉLER UN TITRE ──────────────────────────────────────────────
 *
 * Les titres méritent mieux qu'un fondu : chaque ligne monte de derrière
 * une ligne invisible, comme un rideau. C'est le seul effet du site
 * qu'on remarque consciemment, et il ne sert qu'aux titres de section —
 * l'appliquer aux paragraphes rendrait la page illisible.
 *
 * SplitText est gratuit depuis GSAP 3.13, donc rien à acheter ici.
 *
 * ⚠️ `revert()` est obligatoire au démontage. SplitText réécrit le DOM
 * en découpant le texte en `<div>` ; sans la remise en état, React
 * retrouve un arbre qu'il n'a pas écrit et le texte peut se dupliquer à
 * la navigation. La fonction rend donc toujours de quoi nettoyer.
 */
export function revelerTitre(element, options = {}) {
  if (!element) return () => {}
  if (mouvementReduit()) return () => {}

  const { duree = 1.05, decalage = 0.1, depart = 'top 85%' } = options

  const coupe = new SplitText(element, {
    type: 'lines',
    linesClass: 'ligne-titre',
    // Le masque, c'est lui : chaque ligne reçoit un parent qui rogne ce
    // qui dépasse, donc la ligne monte « de dessous le papier ».
    mask: 'lines',
  })

  const anim = gsap.from(coupe.lines, {
    yPercent: 108,
    duration: duree,
    ease: 'power4.out',
    stagger: decalage,
    scrollTrigger: {
      trigger: element,
      start: depart,
      once: true,
    },
  })

  return () => {
    anim.scrollTrigger?.kill()
    anim.kill()
    coupe.revert()
  }
}

/*
 * ── 3. PARALLAXE ─────────────────────────────────────────────────────
 *
 * L'élément se déplace moins vite que la page. Le cerveau lit ça comme
 * de la profondeur, et c'est ce qui sépare une page « plate » d'une page
 * qui a du volume.
 *
 * L'intensité est en POURCENTAGE de la hauteur de l'élément, pas en
 * pixels : sur un téléphone de 360 px et sur un écran de 1 440 px,
 * l'effet a la même force. Au-delà de 15 %, l'image se décolle
 * visiblement de son cadre et l'illusion tombe.
 */
export function parallaxe(element, options = {}) {
  if (!element || mouvementReduit()) return null

  const { intensite = 10, declencheur = null } = options

  return gsap.fromTo(
    element,
    { yPercent: -intensite / 2 },
    {
      yPercent: intensite / 2,
      ease: 'none',
      scrollTrigger: {
        trigger: declencheur || element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    },
  )
}

/*
 * ── 4. COMPTEUR ──────────────────────────────────────────────────────
 *
 * Un montant qui grimpe jusqu'à sa valeur en entrant à l'écran. Sur une
 * page qui parle d'argent perdu, c'est le seul endroit où l'animation
 * porte du sens plutôt que de la décoration : on VOIT la somme monter.
 *
 * Deux précautions :
 *   - le texte final est déjà dans le HTML pré-rendu. On ne l'écrase
 *     qu'au moment de compter, donc sans JavaScript on lit le bon
 *     chiffre tout de suite ;
 *   - `snap` à l'entier, sinon on affiche des décimales qui clignotent.
 */
export function compteur(element, valeur, format, options = {}) {
  if (!element) return null

  const texteFinal = format(valeur)

  if (mouvementReduit()) {
    element.textContent = texteFinal
    return null
  }

  const { duree = 1.6, depart = 'top 85%', de = 0 } = options
  const etat = { v: de }

  return gsap.to(etat, {
    v: valeur,
    duration: duree,
    ease: 'power2.out',
    snap: { v: 1 },
    onUpdate: () => {
      element.textContent = format(Math.round(etat.v))
    },
    onComplete: () => {
      element.textContent = texteFinal
    },
    scrollTrigger: {
      trigger: element,
      start: depart,
      once: true,
    },
  })
}

/*
 * ── 5. BASCULER LE FOND ──────────────────────────────────────────────
 *
 * La page alterne entre crème et encre au fil des sections. Si chaque
 * section peint son propre fond, on voit une couture au changement — un
 * liseré clair d'un pixel qui traverse l'écran au défilement.
 *
 * On peint donc le fond sur le `body`, et chaque section sombre demande
 * la bascule en entrant. La transition dure 0,6 s : assez pour qu'on la
 * sente, assez peu pour qu'on ne l'attende pas.
 *
 * Les couleurs sont les deux de la palette, écrites en dur ici et nulle
 * part ailleurs — aucune couleur nouvelle n'entre par cette porte.
 */
const FOND_CLAIR = '#FAF6F4'
const FOND_SOMBRE = '#1A1420'

export function basculerFond(section, options = {}) {
  if (!section || mouvementReduit()) return null

  const { sombre = true, depart = 'top 60%', fin = 'bottom 40%' } = options
  const couleur = sombre ? FOND_SOMBRE : FOND_CLAIR
  const retour = sombre ? FOND_CLAIR : FOND_SOMBRE

  const peindre = (vers) =>
    gsap.to(document.body, {
      backgroundColor: vers,
      duration: 0.6,
      ease: 'power2.inOut',
      overwrite: 'auto',
    })

  return ScrollTrigger.create({
    trigger: section,
    start: depart,
    end: fin,
    onEnter: () => peindre(couleur),
    onEnterBack: () => peindre(couleur),
    onLeave: () => peindre(retour),
    onLeaveBack: () => peindre(retour),
  })
}
