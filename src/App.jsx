import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Calculateur from './components/Calculateur'
import Fonctionnalites from './components/Fonctionnalites'
import Philosophie from './components/Philosophie'
import Protocole from './components/Protocole'
import Tarifs from './components/Tarifs'
import Footer from './components/Footer'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useEffect(() => {
    // Les images du hero et de la texture décalent la mise en page au chargement.
    const recaler = () => ScrollTrigger.refresh()
    window.addEventListener('load', recaler)
    const minuteur = setTimeout(recaler, 600)

    return () => {
      window.removeEventListener('load', recaler)
      clearTimeout(minuteur)
    }
  }, [])

  return (
    <div className="grain relative min-h-screen bg-creme">
      <Navbar />
      <main>
        <Hero />
        <Calculateur />
        <Fonctionnalites />
        <Philosophie />
        <Protocole />
        <Tarifs />
      </main>
      <Footer />
    </div>
  )
}
