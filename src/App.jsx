import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { demarrerDefilement } from './lib/defilement'

import Navbar from './components/Navbar'
import Progression from './components/Progression'
import BarreFixe from './components/BarreFixe'
import HeroCinema from './components/HeroCinema'
import VolSalon from './components/VolSalon'
import { VOL_ACTIF } from './vol'
import Fauteuil from './components/Fauteuil'
import Calculateur from './components/Calculateur'
import DemoWhatsApp from './components/DemoWhatsApp'
import Mecaniques from './components/Mecaniques'
import TableauBord from './components/TableauBord'
import Tarifs from './components/Tarifs'
import Faq from './components/Faq'
import AppelFinal from './components/AppelFinal'
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
      <Progression />
      <Navbar />
      <main>
        {/*
          Le vol à travers le salon remplace le héros dès que ses images
          sont préparées (npm run vol -- preparer). Sans elles, le héros
          typographique reste en place : jamais de section vide.
        */}
        {VOL_ACTIF ? <VolSalon /> : <HeroCinema />}
        {/*
          Juste après le héros : la promesse du produit en une image,
          avant tout argument. On montre d'abord, on explique ensuite.
        */}
        <Fauteuil />
        <Calculateur />
        {/*
          Juste après le calculateur : elle vient de voir ce qu'elle perd,
          on lui fait essayer comment ça se récupère.

          L'ancienne « scène » animée vivait ici, et jouait la même
          histoire en boucle une section avant cette démo. Elle est
          maintenant DANS la démo, en agenda du salon à côté du téléphone
          de la cliente : les deux côtés de la même minute, déclenchés par
          la visiteuse au lieu de tourner tout seuls.
        */}
        <DemoWhatsApp />
        {/*
          Les trois mécaniques. Cette section remplace les anciennes
          « Philosophie » et « Protocole » : elles disaient la même chose
          deux fois, à deux endroits de la page.
        */}
        <Mecaniques />
        {/*
          Puis ce qu'elle verra le mois prochain. Après les mécaniques,
          parce qu'un tableau de bord ne veut rien dire avant qu'on sache
          ce qui le remplit.
        */}
        <TableauBord />
        <Tarifs />
        {/*
          Les objections après le prix, pas avant : on ne répond aux
          questions de quelqu'un qu'une fois qu'il s'est posé la vraie.
        */}
        <Faq />
        <AppelFinal />
      </main>
      <Footer />
      <BarreFixe />
    </div>
  )
}
