import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ArrowDown } from 'lucide-react'
import { HERO, VIDEO_HERO } from '../donnees'
import { glisserVers } from '../lib/defilement'
// L'import enregistre aussi ScrollTrigger et SplitText, une fois pour tous.
import { mouvementReduit, revelerTitre } from '../lib/mouvement'
import Bouton from './Bouton'

/*
 * LE HERO CINÉMATIQUE.
 *
 * Sur grand écran, le principe est celui des pages produit d'Apple : la
 * section se fige, et le défilement ne fait plus avancer la page — il
 * avance la VIDÉO, image par image. On ne regarde pas un film, on le
 * déroule. Le texte se compose par-dessus au fil des secondes, puis la
 * page reprend son cours.
 *
 * ────────────────────────────────────────────────────────────────────
 * QUATRE DÉCISIONS QUI TIENNENT TOUT
 * ────────────────────────────────────────────────────────────────────
 *
 * 1. LA PAGE EST ENTIÈRE SANS LA VIDÉO.
 *    Aucun chemin renseigné ⇒ on affiche la composition typographique
 *    seule, qui reste le meilleur élément de la marque. Aucun trou,
 *    aucun cadre noir, aucune erreur de console. La vidéo est un bonus,
 *    jamais une dépendance.
 *
 * 2. LA VIDÉO NE PART QUE SI LA CONNEXION LA SUPPORTE.
 *    Une vidéo scrubbable pèse 3 à 6 Mo. Sur la 3G d'Abidjan, chez une
 *    gérante qui paie son forfait au méga-octet, la télécharger serait
 *    une faute — et c'est précisément la personne qu'on veut convaincre.
 *    On lit `navigator.connection` : en 2g/3g ou en mode économie de
 *    données, on ne la demande même pas.
 *
 * 3. MOBILE ET BUREAU NE FONT PAS LA MÊME CHOSE.
 *    Le déroulé au doigt suppose de sauter dans la vidéo à volonté. Sur
 *    iOS, le chargement attend un geste et les sauts saccadent : l'effet
 *    qui impressionne sur un grand écran devient un défaut sur un
 *    téléphone. Le mobile reçoit donc une boucle courte et légère, sans
 *    épingle — et le même texte, au même endroit.
 *
 * 4. LE TEXTE NE DÉPEND JAMAIS DE LA VIDÉO.
 *    Il est dans le HTML pré-rendu, lisible au premier paquet. La vidéo
 *    se glisse DERRIÈRE lui quand elle arrive.
 */

/* La connexion mérite-t-elle qu'on lui envoie plusieurs mégaoctets ? */
function connexionGenereuse() {
  const lien = navigator.connection || navigator.mozConnection
  if (!lien) return true // information absente : on ne punit personne
  if (lien.saveData) return false
  return !['slow-2g', '2g', '3g'].includes(lien.effectiveType)
}

export default function HeroCinema() {
  const racine = useRef(null)
  const titre = useRef(null)
  const video = useRef(null)
  const [videoPrete, setVideoPrete] = useState(false)

  // `null` tant qu'on n'a pas mesuré : le premier rendu est celui du
  // pré-rendu, identique pour tous, donc rien ne clignote à l'hydratation.
  const [surBureau, setSurBureau] = useState(null)

  // ── Bureau ou mobile ? ─────────────────────────────────────────────
  useEffect(() => {
    const requete = window.matchMedia(
      `(min-width: ${VIDEO_HERO.seuilBureau}px)`,
    )
    const lire = () => setSurBureau(requete.matches)
    lire()
    requete.addEventListener('change', lire)
    return () => requete.removeEventListener('change', lire)
  }, [])

  // ── La vidéo mérite-t-elle d'être chargée ? ────────────────────────
  useEffect(() => {
    if (surBureau === null) return

    const source = surBureau
      ? VIDEO_HERO.fichier
      : VIDEO_HERO.fichierMobile || VIDEO_HERO.fichier
    if (!source) return
    if (!connexionGenereuse()) return // on s'abstient, délibérément

    const v = video.current
    if (!v) return

    const prete = () => setVideoPrete(true)
    v.addEventListener('loadeddata', prete, { once: true })
    v.src = source
    v.load()

    // Sur mobile, c'est une boucle : on la lance. `play()` peut être
    // refusé (économie d'énergie, onglet en arrière-plan) — sans
    // conséquence, l'affiche reste à l'écran.
    if (!surBureau) {
      v.play().catch(() => {})
    }

    return () => {
      v.removeEventListener('loadeddata', prete)
    }
  }, [surBureau])

  // ── Le défilement pilote la scène ─────────────────────────────────
  useEffect(() => {
    if (surBureau === null) return

    /*
     * Mouvement réduit : on ne fige rien et on n'anime rien. Le hero
     * redevient une section normale, entièrement lisible. C'est la
     * bonne réponse — pas une version dégradée, une version calme.
     */
    if (mouvementReduit()) return

    let nettoyerTitre = () => {}

    const ctx = gsap.context(() => {
      // Le titre monte ligne par ligne, de derrière un masque. C'est le
      // seul effet de la page qu'on remarque consciemment ; il est donc
      // réservé à ce titre-là et aux titres de section.
      nettoyerTitre = revelerTitre(titre.current, { depart: 'top 95%' })

      // Le reste de la composition suit, sans attendre le défilement :
      // on est déjà en haut de page.
      gsap.from('[data-entree]', {
        y: 28,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.09,
        delay: 0.15,
      })

      /*
       * L'épingle et le déroulé, sur grand écran seulement. Sur mobile,
       * figer un écran entier sur un téléphone où la barre d'adresse
       * change la hauteur à chaque geste produit des sauts de mise en
       * page — le contraire de l'effet recherché.
       */
      if (!surBureau) return

      const v = video.current

      const chrono = gsap.timeline({
        scrollTrigger: {
          trigger: racine.current,
          start: 'top top',
          // La distance de défilement pendant laquelle la section reste
          // figée. Proportionnelle à la durée de la vidéo : une seconde
          // de film pour un écran de défilement. Sans vidéo, on fige
          // beaucoup moins — il n'y a rien à dérouler.
          end: () =>
            `+=${window.innerHeight * (videoPrete ? VIDEO_HERO.ecrans : 0.6)}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })

      // La vidéo se déroule au doigt : on n'appelle jamais play(), on
      // déplace `currentTime`. C'est ce qui donne le contrôle total.
      if (v && videoPrete) {
        chrono.to(
          { t: 0 },
          {
            t: 1,
            ease: 'none',
            onUpdate() {
              if (!v.duration) return
              v.currentTime = v.duration * this.targets()[0].t
            },
          },
          0,
        )
      }

      // Le texte se retire pendant que l'image prend toute la place.
      chrono
        .to('[data-titre]', { y: -70, opacity: 0.12, ease: 'none' }, 0)
        .to('[data-secondaire]', { y: -40, opacity: 0, ease: 'none' }, 0)
        // Le voile s'épaissit : le texte reste lisible jusqu'au bout.
        .to('[data-voile]', { opacity: 0.82, ease: 'none' }, 0)
        // Les chiffres montent en dernier, seuls sur l'image.
        .fromTo(
          '[data-chiffre]',
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, ease: 'none', stagger: 0.12 },
          0.45,
        )
    }, racine)

    return () => {
      nettoyerTitre()
      ctx.revert()
    }
  }, [surBureau, videoPrete])

  // Le montage n'est décidé qu'après mesure : pas de <video> inutile
  // dans le DOM, et surtout pas de source mobile chargée sur un bureau.
  const source =
    surBureau === null
      ? ''
      : surBureau
        ? VIDEO_HERO.fichier
        : VIDEO_HERO.fichierMobile || VIDEO_HERO.fichier

  return (
    <section
      ref={racine}
      className="relative flex min-h-[100dvh] w-full items-center overflow-hidden bg-creme"
    >
      {/* ── Le film, derrière tout ── */}
      {source && (
        <video
          ref={video}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            videoPrete ? 'opacity-100' : 'opacity-0'
          }`}
          muted
          playsInline
          loop={!surBureau}
          preload="none"
          poster={VIDEO_HERO.affiche || undefined}
          aria-hidden="true"
        />
      )}

      {/*
        Le voile. Crème dense en bas, transparent en haut : le texte pose
        sur une matière, pas sur un rectangle gris. C'est ce détail qui
        sépare une page soignée d'une page où l'on a « mis une vidéo ».
      */}
      <div
        data-voile
        className="absolute inset-0"
        style={{
          background: videoPrete
            ? 'linear-gradient(180deg, rgba(250,246,244,0.94) 0%, rgba(250,246,244,0.72) 38%, rgba(250,246,244,0.88) 100%)'
            : 'transparent',
          opacity: videoPrete ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* ── La composition ── */}
      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 lg:px-16">
        <div className="max-w-4xl">
          <p
            data-entree
            className="micro flex items-center gap-4 text-aubergine"
          >
            <span className="h-px w-10 shrink-0 bg-magenta" aria-hidden="true" />
            {HERO.surtitre}
          </p>

          <h1 ref={titre} data-titre className="mt-9 text-encre">
            <span className="block text-[clamp(1.5rem,4.4vw,2.9rem)] font-extrabold leading-[1.08] tracking-tresserre">
              {HERO.titreSans}
            </span>
            <span className="mt-1 block font-drama text-[clamp(4.5rem,15.5vw,11rem)] italic leading-[0.82] tracking-[-0.02em] text-magenta">
              {HERO.titreSerif}
            </span>
          </h1>

          <div data-secondaire>
            <p
              data-entree
              className="mt-10 max-w-xl text-[1.05rem] leading-relaxed text-encre/75"
            >
              {HERO.chapo}
            </p>

            <div
              data-entree
              className="mt-11 flex flex-wrap items-center gap-3"
            >
              <Bouton taille="grand" onClick={() => glisserVers('calculateur')}>
                {HERO.cta}
              </Bouton>
              <Bouton
                variante="contourSombre"
                taille="grand"
                onClick={() => glisserVers('methode')}
              >
                {HERO.ctaSecondaire}
              </Bouton>
            </div>

            {/*
              Le prix, juste sous les boutons. Une gérante qui doit
              défiler six sections pour savoir combien ça coûte se
              demande ce qu'on lui cache.
            */}
            <p data-entree className="legende mt-5 text-encre/55">
              {HERO.micro}
            </p>
          </div>

          {/*
            Les trois chiffres. Ils restent quand le reste s'efface : ce
            sont eux qui doivent rester à l'écran sur l'image du salon.
          */}
          <ul className="mt-12 flex flex-wrap items-baseline gap-x-8 gap-y-3">
            {HERO.stats.map((stat) => (
              <li
                key={stat}
                data-chiffre
                className="legende font-semibold tracking-serre text-aubergine"
              >
                {stat}
              </li>
            ))}
          </ul>

          <button
            data-entree
            onClick={() => glisserVers('calculateur')}
            className="micro lift mt-16 hidden w-fit items-center gap-3 text-aubergine/70 hover:text-aubergine lg:flex"
          >
            <ArrowDown
              size={14}
              className="animate-bounce text-magenta"
              aria-hidden="true"
            />
            Ce que vous perdez, en chiffres
          </button>
        </div>
      </div>

      <div id="sentinelle-hero" className="absolute bottom-0 h-px w-full" />
    </section>
  )
}
