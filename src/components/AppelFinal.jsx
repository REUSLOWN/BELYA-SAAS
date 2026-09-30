import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ACTIVATION, FINAL, MEDIAS, lienWhatsAppGeneral } from '../donnees'
import { basculerFond, revelerTitre } from '../lib/mouvement'

/*
 * S9 — L'APPEL FINAL.
 *
 * Une phrase, très grande, et un bouton. Pas de formulaire, pas de champ
 * e-mail, pas de « demander une démo » : le canal réel est WhatsApp, et
 * une gérante d'Abidjan qui veut se lancer écrit un message. Tout ce qui
 * s'interpose entre son envie et ce message est une perte.
 *
 * ────────────────────────────────────────────────────────────────────
 * LA VIDÉO DE FOND NE SE CHARGE PRESQUE JAMAIS
 * ────────────────────────────────────────────────────────────────────
 *
 * Elle est en bas de page, derrière un voile à 35 % d'opacité, et pèse
 * 1,5 Mo. Autrement dit : très peu de gens la verront, et personne ne
 * la remarquera. La télécharger à tous serait donc une dépense pure —
 * facturée au forfait de la gérante qu'on veut convaincre.
 *
 * Trois conditions, toutes nécessaires :
 *   1. un fichier existe ;
 *   2. la connexion est bonne (ni 2g/3g, ni mode économie de données) ;
 *   3. la section approche VRAIMENT — IntersectionObserver avec une
 *      marge d'un demi-écran. Pas au chargement de la page.
 *
 * Sans vidéo, il reste le fond encre et le grain global. C'est déjà la
 * plus belle section de la page.
 */

export default function AppelFinal() {
  const racine = useRef(null)
  const titre = useRef(null)
  const video = useRef(null)
  const [videoPrete, setVideoPrete] = useState(false)

  // ── Le titre et la bascule de fond ─────────────────────────────────
  useEffect(() => {
    let nettoyerTitre = () => {}
    const ctx = gsap.context(() => {
      nettoyerTitre = revelerTitre(titre.current, { depart: 'top 80%' })
      basculerFond(racine.current, { sombre: true })
    }, racine)

    return () => {
      nettoyerTitre()
      ctx.revert()
    }
  }, [])

  // ── La vidéo, seulement si elle est méritée ───────────────────────
  useEffect(() => {
    if (!MEDIAS.boucle || !racine.current) return

    const lien = navigator.connection || navigator.mozConnection
    if (lien) {
      if (lien.saveData) return
      if (['slow-2g', '2g', '3g'].includes(lien.effectiveType)) return
    }

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return
        observateur.disconnect()

        const v = video.current
        if (!v) return

        v.addEventListener('loadeddata', () => setVideoPrete(true), { once: true })
        v.src = MEDIAS.boucle
        v.load()
        v.play().catch(() => {})
      },
      // Un demi-écran d'avance : la boucle est prête juste avant d'être
      // utile, et jamais avant.
      { rootMargin: '50% 0px' },
    )

    observateur.observe(racine.current)
    return () => observateur.disconnect()
  }, [])

  const destination = lienWhatsAppGeneral()

  return (
    <section
      id="activer"
      ref={racine}
      className="relative flex min-h-[85vh] items-center overflow-hidden bg-encre px-6 py-28 text-creme sm:px-10 sm:py-36 lg:px-16"
    >
      {MEDIAS.boucle && (
        <video
          ref={video}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            videoPrete ? 'opacity-[0.35]' : 'opacity-0'
          }`}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        />
      )}

      <div className="relative mx-auto w-full max-w-4xl text-center">
        <h2
          ref={titre}
          className="text-[clamp(2.4rem,8vw,5.5rem)] font-extrabold leading-[1.02] tracking-tresserre"
        >
          {FINAL.titreSans}
          <span className="block font-drama italic text-magenta-clair">
            {FINAL.titreSerif}
          </span>
        </h2>

        <div className="mt-12 flex justify-center">
          {destination ? (
            /*
              Une ancre, pas un bouton : c'est un lien sortant, et il
              doit pouvoir s'ouvrir dans un onglet, se copier, se
              partager. `rel="noopener"` parce qu'on ouvre ailleurs.
            */
            <a
              href={destination}
              target="_blank"
              rel="noopener noreferrer"
              className="magnetique glisse group relative isolate inline-flex min-h-[44px] items-center overflow-hidden rounded-full bg-magenta px-10 py-5 text-[17px] font-semibold tracking-serre text-creme"
            >
              <span className="voile absolute inset-0 -z-10 bg-creme" aria-hidden="true" />
              <span className="relative transition-colors duration-500 group-hover:text-encre">
                {ACTIVATION.ctaWhatsApp}
              </span>
            </a>
          ) : (
            <p className="legende text-creme/60">{ACTIVATION.indisponible}</p>
          )}
        </div>

        {/*
          UNE seule ligne sous le bouton.
          Il y en avait deux, et les deux parlaient de la garantie : la
          répéter à trois lignes d'intervalle la rend suspecte au lieu de
          la rendre rassurante. `FINAL.micro` porte désormais le
          mécanisme en entier — un mois offert, pas un remboursement.
        */}
        <p className="legende mx-auto mt-7 max-w-xl text-creme/55">
          {FINAL.micro}
        </p>
      </div>

      {/*
        La sentinelle de fin. La barre fixe du bas s'efface ici : le même
        appel à l'action, deux fois à l'écran, se lit comme de
        l'insistance.
      */}
      <div id="sentinelle-final" className="absolute inset-x-0 top-0 h-px" />
    </section>
  )
}
