/*
 * LA SÉQUENCE D'IMAGES DU VOL.
 *
 * Le vol n'est pas une vidéo qu'on déplace : c'est une suite d'images
 * WebP qu'on peint sur un <canvas>. Une vidéo saute mal en arrière et
 * attend un geste sur iOS ; une image demandée s'affiche, dans les deux
 * sens, à la vitesse du doigt.
 *
 * Le prix d'une suite d'images, c'est la mémoire et le réseau. Tout ce
 * fichier sert à le borner :
 *
 *   • on ne télécharge que ce qui est autour de l'image demandée, en
 *     priorité dans le sens où l'on défile ;
 *   • au plus SIMULTANES requêtes à la fois, et celles qui ne servent plus
 *     (on a sauté plus loin) sont annulées ;
 *   • au plus MEMOIRE images décodées ; les plus éloignées sont libérées
 *     (`bitmap.close()`), pas seulement oubliées ;
 *   • une image qui échoue est retentée deux fois, puis abandonnée —
 *     on peint alors la plus proche qu'on possède.
 */

const SIMULTANES = 6
const ESSAIS = 3

function chemin(motif, n) {
  return motif.replace('{n}', String(n).padStart(4, '0'))
}

/*
 * DEUX ÉTAGES DE CACHE.
 *
 *   • `fichiers` : les WebP compressés, tels que reçus (30 à 60 Ko). On
 *     peut en garder des centaines sans souci — c'est le réseau qu'on
 *     économise.
 *   • `images` : les images DÉCODÉES, prêtes à peindre. Une image 1280
 *     × 720 décodée pèse 3,7 Mo ; on n'en garde que `memoire`, les plus
 *     proches de la position, et on libère les autres avec `close()`.
 */
export class Sequence {
  /**
   * @param {object} o
   * @param {string} o.motif   ex. '/vol/v3/bureau/frame-{n}.webp'
   * @param {number} o.total   nombre d'images
   * @param {number} o.memoire images décodées gardées au plus
   * @param {(n:number)=>void} o.surArrivee appelé quand une image décodée arrive
   */
  constructor({ motif, total, memoire = 24, surArrivee = () => {} }) {
    this.motif = motif
    this.total = total
    this.memoire = memoire
    this.surArrivee = surArrivee

    this.fichiers = new Map() // n → Blob
    this.images = new Map() // n → ImageBitmap
    this.decodages = new Set() // n en cours de décodage
    this.enCours = new Map() // n → AbortController
    this.echecs = new Map() // n → nombre d'échecs
    this.voulue = 0
    this.sens = 1
    this.ferme = false
  }

  /* L'image qu'on veut voir maintenant, et le sens du défilement. */
  viser(n, sens) {
    this.voulue = Math.max(0, Math.min(this.total - 1, Math.round(n)))
    if (sens) this.sens = sens
    this.planifier()
    this.decoderAutour()
  }

  /*
   * L'ordre de téléchargement :
   *   1. l'image voulue, puis 30 images devant et 8 derrière ;
   *   2. un maillage de plus en plus fin sur toute la longueur : une
   *      image sur 8, puis sur 4, puis sur 2, puis toutes.
   *
   * Le maillage fait qu'un saut brusque (barre de défilement tirée,
   * ancre) tombe toujours près d'une image déjà reçue ; l'affinage
   * continue pendant que la visiteuse lit, si bien qu'un débit moyen
   * (1 à 2 Mbit/s, courant à Abidjan) finit par avoir tout le film.
   */
  priorites() {
    const v = this.voulue
    const dedans = (n) => n >= 0 && n < this.total
    const fenetre = [v]
    for (let i = 1; i <= 30; i += 1) {
      fenetre.push(v + i * this.sens)
      if (i <= 8) fenetre.push(v - i * this.sens)
    }
    const maillage = []
    for (const pas of [8, 4, 2, 1]) {
      for (let i = 0; i < this.total; i += pas) maillage.push(i)
    }
    return { fenetre: fenetre.filter(dedans), maillage }
  }

  planifier() {
    if (this.ferme) return

    // Annuler les requêtes de FENÊTRE qu'on a dépassées : elles visaient
    // un endroit que la visiteuse a quitté. Celles du maillage ne sont
    // jamais annulées — sinon chaque appel les relancerait aussitôt, et
    // le navigateur finirait saturé de requêtes annulées.
    for (const [n, requete] of this.enCours) {
      if (requete.fenetre && Math.abs(n - this.voulue) > 40) {
        requete.controle.abort()
        this.enCours.delete(n)
      }
    }

    const { fenetre, maillage } = this.priorites()
    const lancer = (n, deFenetre) => {
      if (this.enCours.size >= SIMULTANES) return false
      if (this.fichiers.has(n) || this.enCours.has(n)) return true
      if ((this.echecs.get(n) ?? 0) >= ESSAIS) return true
      this.charger(n, deFenetre)
      return true
    }
    for (const n of fenetre) if (!lancer(n, true)) return
    for (const n of maillage) if (!lancer(n, false)) return
  }

  async charger(n, fenetre = false) {
    const controle = new AbortController()
    const requete = { controle, fenetre }
    this.enCours.set(n, requete)
    try {
      const reponse = await fetch(chemin(this.motif, n), {
        signal: controle.signal,
      })
      if (!reponse.ok) throw new Error(String(reponse.status))
      const fichier = await reponse.blob()
      if (this.ferme) return
      this.fichiers.set(n, fichier)
      if (Math.abs(n - this.voulue) <= this.memoire / 2) this.decoder(n)
    } catch (erreur) {
      if (erreur?.name !== 'AbortError') {
        this.echecs.set(n, (this.echecs.get(n) ?? 0) + 1)
      }
    } finally {
      if (this.enCours.get(n) === requete) this.enCours.delete(n)
      // Une place s'est libérée : on relance la file. Un délai après un
      // échec, pour ne pas marteler un réseau qui tousse.
      const attente = (this.echecs.get(n) ?? 0) * 400
      if (!this.ferme) setTimeout(() => this.planifier(), attente)
    }
  }

  async decoder(n) {
    if (this.images.has(n) || this.decodages.has(n)) return
    const fichier = this.fichiers.get(n)
    if (!fichier) return
    this.decodages.add(n)
    try {
      const image = await createImageBitmap(fichier)
      if (this.ferme) {
        image.close()
        return
      }
      this.images.set(n, image)
      this.liberer()
      this.surArrivee(n)
    } catch {
      // Fichier illisible : on l'oublie, il sera retéléchargé.
      this.fichiers.delete(n)
      this.echecs.set(n, (this.echecs.get(n) ?? 0) + 1)
    } finally {
      this.decodages.delete(n)
    }
  }

  /* Décoder ce qu'on a déjà reçu autour de la position. */
  decoderAutour() {
    const v = this.voulue
    const rayon = Math.floor(this.memoire / 2)
    for (let d = 0; d <= rayon; d += 1) {
      for (const n of [v + d * this.sens, v - d * this.sens]) {
        if (this.fichiers.has(n) && !this.images.has(n)) this.decoder(n)
      }
    }
  }

  /* Libérer les images décodées les plus éloignées de la position. */
  liberer() {
    if (this.images.size <= this.memoire) return
    const loin = [...this.images.keys()].sort(
      (a, b) => Math.abs(b - this.voulue) - Math.abs(a - this.voulue),
    )
    for (const n of loin) {
      if (this.images.size <= this.memoire) break
      this.images.get(n)?.close?.()
      this.images.delete(n)
    }
  }

  /* L'image n si elle est décodée, sinon la plus proche qui l'est. */
  meilleure(n) {
    if (this.images.has(n)) return this.images.get(n)
    for (let d = 1; d < this.total; d += 1) {
      const avant = this.images.get(n - d)
      if (avant) return avant
      const apres = this.images.get(n + d)
      if (apres) return apres
    }
    return null
  }

  fermer() {
    this.ferme = true
    for (const requete of this.enCours.values()) requete.controle.abort()
    this.enCours.clear()
    for (const image of this.images.values()) image.close?.()
    this.images.clear()
    this.fichiers.clear()
  }
}

/*
 * La partition : convertir un avancement (en vh défilés) en temps du
 * film, battement par battement. Une tenue renvoie toujours le même
 * temps ; un battement de mouvement interpole linéairement — la courbe
 * du mouvement est dans le film lui-même, pas dans le défilement.
 */
export function partition(battements) {
  let cumul = 0
  const plages = battements.map((b) => {
    const plage = { ...b, debut: cumul, fin: cumul + b.vh }
    cumul += b.vh
    return plage
  })
  return { plages, total: cumul }
}

export function tempsA(plages, vh) {
  if (!plages.length) return 0
  if (vh <= 0) return plages[0].de
  for (const p of plages) {
    if (vh <= p.fin) {
      const r = p.vh ? (vh - p.debut) / p.vh : 1
      return p.de + (p.a - p.de) * r
    }
  }
  return plages[plages.length - 1].a
}

/*
 * L'opacité de chaque chapitre à une position donnée. Un chapitre couvre
 * la réunion de ses battements ; il entre et sort par un fondu de
 * `fondu` vh, sauf le premier (visible au repos) et le dernier (tenu
 * jusqu'au bout).
 */
export function opacites(plages, vh, fondu) {
  const etendues = {}
  for (const p of plages) {
    if (!p.chapitre) continue
    const e = etendues[p.chapitre]
    etendues[p.chapitre] = e
      ? { debut: Math.min(e.debut, p.debut), fin: Math.max(e.fin, p.fin) }
      : { debut: p.debut, fin: p.fin }
  }
  const total = plages.length ? plages[plages.length - 1].fin : 0
  const lisse = (x) => {
    const t = Math.max(0, Math.min(1, x))
    return t * t * (3 - 2 * t)
  }
  const resultat = {}
  for (const [cle, e] of Object.entries(etendues)) {
    const entree = e.debut <= 0 ? 1 : lisse((vh - e.debut) / fondu)
    const sortie = e.fin >= total ? 1 : lisse((e.fin - vh) / fondu)
    resultat[cle] = vh < e.debut || vh > e.fin ? 0 : Math.min(entree, sortie)
  }
  return resultat
}
