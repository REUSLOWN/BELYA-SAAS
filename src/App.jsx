import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { demarrerDefilement } from './lib/defilement'

import Navbar from './components/Navbar'
import HeroCinema from './components/HeroCinema'
import Fauteuil from './components/Fauteuil'
import Calculateur from './components/Calculateur'
import SceneRevente from './components/SceneRevente'
import DemoWhatsApp from './components/DemoWhatsApp'
import Fonctionnalites from './components/Fonctionnalites'
import Mecaniques from './components/Mecaniques'
import Tarifs from './components/Tarifs'
import Footer from './components/Footer'

/*
 * ScrollTrigger n'a de sens que dans un navigateur, et le pré-rendu du
 * build exécute ce module dans Node. On n'enregistre donc le greffon que
 * si `window` existe.
 */
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function App() {
  useEffect(() => {
    // Le défilement inertiel, branché sur l'horloge de GSAP.
    const arreter = demarrerDefilement()

    // Les images du hero et de la texture décalent la mise en page au chargement.
    const recaler = () => ScrollTrigger.refresh()
    window.addEventListener('load', recaler)
    const minuteur = setTimeout(recaler, 600)

    return () => {
      window.removeEventListener('load', recaler)
      clearTimeout(minuteur)
      arreter()
    }
  }, [])

  /*
   * Pas de fond sur le conteneur : c'est le `body` qui est peint (crème
   * par défaut en CSS, donc juste même sans JavaScript), et
   * `basculerFond` le fait virer à l'encre sous les sections sombres.
   * Repeindre aussi ce conteneur masquerait la bascule et laisserait un
   * liseré crème dans la zone de rebond, en haut et en bas.
   */
  return (
    <div className="grain relative min-h-screen">
      <Navbar />
      <main>
        <HeroCinema />
        {/*
          Juste après le héros : la promesse du produit en une image,
          avant tout argument. On montre d'abord, on explique ensuite.
        */}
        <Fauteuil />
        <Calculateur />
        {/*
          Juste après le calculateur : elle vient de voir ce qu'elle perd,
          on lui montre aussitôt comment ça se récupère.
        */}
        <SceneRevente />
        {/*
          La scène montre le mécanisme ; la démo le fait essayer. L'une
          après l'autre, dans cet ordre : on regarde, puis on touche.
        */}
        <DemoWhatsApp />
        <Fonctionnalites />
        {/*
          Les trois mécaniques. Cette section remplace les anciennes
          « Philosophie » et « Protocole » : elles disaient la même chose
          deux fois, à deux endroits de la page.
        */}
        <Mecaniques />
        <Tarifs />
      </main>
      <Footer />
    </div>
  )
}
