/*
 * LE VOL — tout ce qui se modifie sans toucher au code.
 *
 * Un seul plan continu, à la première personne, à travers un salon
 * d'Abidjan : on entre par la porte, on traverse la salle, l'arrière-
 * boutique et la réserve, on sort par la cour, on se retourne et on
 * s'élève au-dessus du quartier.
 *
 * Ce fichier porte trois choses :
 *   1. les CHAPITRES : le texte qui se pose sur le film ;
 *   2. les BATTEMENTS : la partition qui relie le défilement au film ;
 *   3. le MANIFESTE : écrit par `npm run vol -- preparer`, jamais à la main.
 *
 * ────────────────────────────────────────────────────────────────────
 * LIRE UN BATTEMENT
 * ────────────────────────────────────────────────────────────────────
 *
 *   { id: 'salle', vh: 180, de: 6, a: 15, chapitre: 'salle' }
 *
 *   vh       Distance de défilement, en hauteurs d'écran × 100.
 *            180 = presque deux écrans. Indépendant de la durée du film :
 *            un virage rapide peut recevoir plus de défilement qu'une
 *            ligne droite lente, et c'est voulu.
 *   de / a   L'intervalle du film parcouru, en secondes. de === a est
 *            une TENUE : le film s'arrête sur une image le temps de lire.
 *   chapitre Le texte visible pendant ce battement (ou null).
 *
 * Le défilement total de la section = somme des vh. Pour ralentir un
 * passage, augmentez son vh ; pour le couper, retirez la ligne. Les
 * battements doivent se suivre (`a` d'une ligne = `de` de la suivante),
 * sinon le film sauterait — `npm run verifier` le contrôle.
 *
 * Le salon est FICTIF et les images sont générées. Rien sur cette
 * section ne doit laisser croire qu'il s'agit d'un salon client.
 */

import manifeste from './vol/manifeste.json'

export const MANIFESTE_VOL = manifeste

/*
 * Le vol n'existe que si des images ont été préparées. Sans elles, la
 * page affiche le héros typographique habituel : aucune section vide,
 * aucun cadre noir. La réponse est la même au pré-rendu et dans le
 * navigateur, parce que le manifeste est importé au build.
 */
export const VOL_ACTIF = (manifeste?.images ?? 0) > 0

export const BATTEMENTS = [
  // 01 — Arrivée. On tient la première image : le titre se lit avant
  // que quoi que ce soit ne bouge.
  { id: 'arrivee-tenue', vh: 45, de: 0, a: 0, chapitre: 'arrivee' },
  { id: 'arrivee', vh: 80, de: 0, a: 3.5, chapitre: 'arrivee' },

  // 02 — La salle : les postes, le pilier-miroir, puis le fauteuil vide.
  // Tenue sur le fauteuil, le cœur de l'histoire.
  { id: 'salle', vh: 110, de: 3.5, a: 11, chapitre: 'salle' },
  { id: 'salle-tenue', vh: 35, de: 11, a: 11, chapitre: 'salle' },
  { id: 'salle-fin', vh: 35, de: 11, a: 14.5, chapitre: null },

  // Transition — le rideau de l'arrière-boutique. Pas de texte.
  { id: 'rideau', vh: 40, de: 14.5, a: 16.5, chapitre: null },

  // 03 — L'arrière-boutique : le bac, les mains, les étagères.
  { id: 'arriere', vh: 120, de: 16.5, a: 23.5, chapitre: 'rappel' },

  // 04 — La réserve, jusqu'à la porte ouverte sur la cour.
  { id: 'reserve', vh: 110, de: 23.5, a: 28.9, chapitre: 'attente' },

  // PROVISOIRE, en attendant le dernier extrait (sortie, demi-tour,
  // révélation) : on tient la porte de la cour avec le chapitre final.
  { id: 'fin-tenue', vh: 60, de: 28.9, a: 28.9, chapitre: 'fin' },
]

/*
 * Les chapitres. `position` place le bloc : `gauche` sur le tiers calme
 * du cadre au bureau, toujours en bas sur téléphone.
 */
export const CHAPITRES = {
  arrivee: {
    numero: '01',
    lieu: 'Arrivée',
    // Le titre du héros est celui de la page : il vient de HERO
    // (donnees.js), pour qu'il n'y en ait qu'un à modifier.
    heros: true,
  },
  salle: {
    numero: '02',
    lieu: 'La salle',
    titre: 'Samedi, 14 h. Le fauteuil 3 attend.',
    texte:
      "Une cliente qui ne vient pas, c'est un poste payé, une coiffeuse qui patiente, et un créneau qu'on ne revendra plus.",
  },
  rappel: {
    numero: '03',
    lieu: "L'arrière-boutique",
    titre: 'La veille, elle reçoit un rappel sur WhatsApp.',
    texte:
      "Elle confirme d'un mot, ou elle libère sa place. Rien à installer pour elle, rien à relancer pour vous.",
    action: { libelle: 'Essayer la démo', ancre: 'demo' },
  },
  attente: {
    numero: '04',
    lieu: 'La réserve',
    titre: 'La place libérée ne reste pas vide.',
    texte:
      "Elle part à la première cliente de votre liste d'attente, avant que le samedi ne commence.",
  },
  fin: {
    numero: '05',
    lieu: 'Votre quartier',
    titre: 'Votre salon, plein le samedi.',
    texte:
      'Belya travaille pour les salons, instituts et prestataires à domicile d’Abidjan.',
    action: { libelle: 'Calculer ma perte', ancre: 'calculateur' },
    whatsapp: true,
  },
}

/*
 * Mention honnête, toujours visible pendant le vol : le salon n'existe
 * pas, ce n'est pas un client.
 */
export const CREDIT_VOL = 'Salon fictif · images de synthèse'

/* Le lien d'évitement mène ici : la première section après le vol. */
export const ANCRE_APRES_VOL = 'fauteuil'

/*
 * Largeur en dessous de laquelle on sert la séquence portrait (recadrée
 * au centre) plutôt que la séquence paysage.
 */
export const SEUIL_PORTRAIT = 768

/* Durée du fondu d'un chapitre, en vh, au début et à la fin de sa plage. */
export const FONDU_VH = 18
