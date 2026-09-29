import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

/*
 * LE SYSTÈME DE MOUVEMENT.
 *
 * Six primitives, et rien d'autre. Chaque section de la page s'anime
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

/*
 * LES COURBES DE LA MAISON. Trois, pas trente — c'est ce qui se
 * reconnaît d'une section à l'autre.
 *
 *   ENTREE   `expo.out` : presque toute la distance est parcourue dans
 *            le premier tiers du temps, puis ça se pose. C'est ce qui
 *            donne l'impression que l'élément était déjà en route avant
 *            qu'on le regarde.
 *   LIEE     `none` : quand le défilement commande, toute courbe est un
 *            mensonge — le doigt avance d'un pixel, l'image doit avancer
 *            d'un pixel.
 *   TOUCHE   `power3.out` : pour ce qui répond à un clic. Plus doux
 *            qu'expo, parce qu'on regarde de près.
 */
export const COURBE = 'expo.out'
export const COURBE_LIEE = 'none'
export const COURBE_TOUCHE = 'power3.out'

/* Micro-interaction : 0,35 s. Au-delà, un bouton a l'air lent. */
export const DUREE_TOUCHE = 0.35

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
 * (1,15 s). L'inverse — un grand déplacement rapide — donne une page
 * « qui saute ». Peu de distance et beaucoup de temps, c'est ce qui
 * produit la sensation de poids qu'on paie cher ailleurs.
 */
export function reveler(cibles, options = {}) {
  if (mouvementReduit()) return null

  const {
    y = 32,
    duree = 1.15,
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

  const { duree = 1.25, decalage = 0.08, depart = 'top 85%' } = options

  const coupe = new SplitText(element, {
    type: 'lines',
    linesClass: 'ligne-titre',
    // Le masque, c'est lui : chaque ligne reçoit un parent qui rogne ce
    // qui dépasse, donc la ligne monte « de dessous le papier ».
    mask: 'lines',
  })

  const anim = gsap.from(coupe.lines, {
    // 110 % et non 100 : le masque rogne exactement la hauteur de la
    // ligne, donc à 100 % le haut des majuscules affleure encore.
    yPercent: 110,
    duration: duree,
    ease: COURBE,
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
 * ── 3. RÉVÉLER UNE IMAGE ─────────────────────────────────────────────
 *
 * L'image se découvre du bas vers le haut, et pendant ce temps SON
 * CONTENU se désagrandit de 1,15 à 1. Les deux ensemble donnent
 * l'impression que l'image était déjà là et qu'on lève un cache ; le
 * masque seul donne un store qui monte.
 *
 * Le cadre reçoit le `clip-path`, l'image reçoit l'échelle — c'est
 * pourquoi cette fonction prend DEUX éléments. Mettre les deux sur le
 * même nœud ferait grandir le masque avec l'image, et il ne masquerait
 * plus rien.
 *
 * 1,4 s : une image est plus lourde à l'œil qu'un texte, et se révèle
 * donc plus lentement. À 1 s, l'effet paraît pressé.
 */
export function revelerImage(cadre, image, options = {}) {
  if (!cadre || mouvementReduit()) return null

  const { duree = 1.4, depart = 'top 80%' } = options

  const chrono = gsap.timeline({
    scrollTrigger: { trigger: cadre, start: depart, once: true },
  })

  chrono.fromTo(
    cadre,
    { clipPath: 'inset(100% 0 0 0)' },
    { clipPath: 'inset(0% 0 0 0)', duration: duree, ease: COURBE },
    0,
  )

  if (image) {
    chrono.fromTo(
      image,
      { scale: 1.15 },
      { scale: 1, duration: duree, ease: COURBE },
      0,
    )
  }

  return chrono
}

/*
 * ── 4. PARALLAXE ─────────────────────────────────────────────────────
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
      ease: COURBE_LIEE,
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
 * ── 5. COMPTEUR ──────────────────────────────────────────────────────
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
 * ── 6. BASCULER LE FOND ──────────────────────────────────────────────
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
