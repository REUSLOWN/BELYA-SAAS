/*
 * Tout le contenu de la page vient du cahier des charges
 * « Réservation & anti no-show pour la beauté ».
 * Les chiffres du salon de référence (3 postes, Abidjan) y sont établis :
 * 624 créneaux/mois, 69 % de remplissage, 20 % de no-show, ticket 5 000 F.
 *
 * RÈGLE DE FORMULATION : aucun chiffre issu du modèle n'est présenté comme
 * mesuré. « Objectif », « récupérable », « potentiel calculé » — jamais
 * « récupéré » ni un taux constaté. À rouvrir une fois les pilotes mesurés.
 */

/*
 * PAIEMENT DIRECT — AUCUN CONTACT PAR WHATSAPP.
 *
 * Un clic sur un portefeuille envoie la cliente droit au règlement.
 * Deux façons de renseigner la destination, par ordre de priorité :
 *
 *   1. `lien` sur le portefeuille — une URL de paiement propre à
 *      l'opérateur. Seul Wave en délivre une sans intermédiaire, via un
 *      compte Wave Business (https://pay.wave.com/m/<id>/c/ci/).
 *      Orange Money et MTN MoMo exigent un contrat marchand et une API ;
 *      Moov Money ne fonctionne qu'en USSD. Aucun des trois n'a de lien
 *      public : laisse leur `lien` vide et passe par CHECKOUT_URL.
 *
 *   2. CHECKOUT_URL — l'URL de caisse d'un agrégateur (CinetPay,
 *      PayDunya, kkiaPay). UN SEUL compte couvre les quatre portefeuilles.
 *      Le portefeuille choisi part en paramètre `wallet`, avec l'offre et
 *      le montant, pour que la caisse s'ouvre déjà sur le bon opérateur.
 *
 * Prérequis commun, rappelé par le cahier (section 11) : RCCM, pièce du
 * gérant et RIB. Tant que rien n'est renseigné, les boutons se présentent
 * comme indisponibles au lieu de mener dans le vide.
 */
export const CHECKOUT_URL = ''

/*
 * Les quatre portefeuilles mobiles de Côte d'Ivoire.
 * Les couleurs sont approchées : remplacer par les chartes officielles
 * de chaque opérateur avant mise en ligne (les logos sont des marques
 * déposées, leur usage demande leur kit de marque).
 */
export const PAIEMENTS = [
  { id: 'orange', nom: 'Orange Money', sigle: 'OM', fond: '#FF7900', texte: '#1A1420', lien: '' },
  { id: 'mtn', nom: 'MTN MoMo', sigle: 'MTN', fond: '#FFCC00', texte: '#1A1420', lien: '' },
  { id: 'moov', nom: 'Moov Money', sigle: 'MOOV', fond: '#004E9F', texte: '#FAF6F4', lien: '' },
  { id: 'wave', nom: 'Wave', sigle: 'WAVE', fond: '#1DC3F3', texte: '#1A1420', lien: '' },
]

/** Destination de règlement pour un portefeuille, ou null si rien n'est configuré. */
export function lienPaiement(moyen, offre) {
  if (moyen.lien) return moyen.lien

  if (CHECKOUT_URL) {
    const separateur = CHECKOUT_URL.includes('?') ? '&' : '?'
    return (
      `${CHECKOUT_URL}${separateur}wallet=${encodeURIComponent(moyen.id)}` +
      `&offre=${encodeURIComponent(offre.nom)}&montant=${offre.mensuel}`
    )
  }

  return null
}

/* Libellé du bouton des cartes Tarifs. */
export const CTA_TARIF = 'Activer mon compte'

export const ACTIVATION = {
  titre: 'Activer votre compte Belya',
  etape1: 'Payez avec votre portefeuille mobile',
  libelleMontant: 'Montant à régler',
  rappel:
    'Crédit prépayé : le compte se décompte au prorata des jours ouverts. Aucun prélèvement automatique, vous rechargez quand vous voulez.',
  mention: 'Vous êtes redirigé vers votre opérateur pour finaliser le règlement.',
  indisponible: 'Paiement en ligne bientôt disponible.',
}

/*
 * Aucune image externe : la texture Unsplash du manifeste pesait 266 Ko pour
 * un affichage à 9 % d'opacité. Le grain CSS (.grain) suffit.
 */

/** 430000 → « 430 000 F » (espace fine insécable normalisée en espace simple). */
export function fcfa(n) {
  return `${nombre(n)} F`
}

export function nombre(n) {
  return Math.round(n)
    .toLocaleString('fr-FR')
    .replace(/ | /g, ' ')
}

export function allerA(id) {
  const cible = document.getElementById(id)
  if (cible) cible.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export const NAV_LIENS = [
  { libelle: 'Le coût', ancre: 'calculateur' },
  { libelle: 'La méthode', ancre: 'methode' },
  { libelle: 'Le protocole', ancre: 'protocole' },
  { libelle: 'Tarifs', ancre: 'tarifs' },
]

export const HERO = {
  surtitre: 'Abidjan · Salons, instituts et prestataires à domicile',
  titreSans: 'Le créneau vide est le',
  titreSerif: 'vrai coût.',
  chapo:
    "433 000 F s'évaporent chaque mois d'un salon de trois postes. L'objectif de Belya : en rendre la moitié vendable, sans rien installer pour vos clientes.",
  /*
   * Mêmes chiffres que le profil « Salon » du calculateur, pour que le visiteur
   * retrouve exactement ce qu'il vient de lire : 20 absences × 52 / 12 = 87 par
   * mois ; 20 × 5 000 F × 52 / 12 = 433 333 F par mois ; 5 200 000 F par an.
   */
  stats: ['20 % de no-show', '87 rendez-vous manqués / mois', '5 200 000 F / an'],
  cta: 'Calculer ma perte',
  ctaSecondaire: 'Voir la méthode',
}

/*
 * Le cahier chiffre la perte résiduelle du salon à 211 300 F pour 430 000 F
 * de perte initiale, soit 50,86 % rendus vendables une fois les cinq couches
 * en place. C'est un ratio de modèle, pas une mesure terrain.
 */
export const TAUX_RECUPERATION = 0.5086

export const SEMAINES_PAR_MOIS = 52 / 12

/*
 * LA formule du potentiel. Calculateur, cartes Tarifs et tableau de bord la
 * partagent : un seul endroit à modifier, aucun chiffre qui diverge.
 *
 *   perte / an      = absences par semaine × prestation × 52
 *   récupérable / an = perte / an × TAUX_RECUPERATION
 *   retour          = récupérable par mois ÷ prix mensuel de l'offre
 */
export function potentiel(absencesSemaine, ticket, mensuel) {
  const perteSemaine = absencesSemaine * ticket
  const perteAn = perteSemaine * 52
  const recuperableAn = perteAn * TAUX_RECUPERATION
  const recuperableMois = recuperableAn / 12

  return {
    perteSemaine,
    perteMois: perteSemaine * SEMAINES_PAR_MOIS,
    perteAn,
    recuperableAn,
    recuperableMois,
    creneauxSemaine: absencesSemaine * TAUX_RECUPERATION,
    creneauxMois: absencesSemaine * TAUX_RECUPERATION * SEMAINES_PAR_MOIS,
    roi: mensuel > 0 ? recuperableMois / mensuel : 0,
  }
}

/** 14.69 → « 14,7× » */
export function formatRoi(roi) {
  return `${roi.toFixed(1).replace('.', ',')}×`
}

/** Arrondi à la centaine, pour afficher un potentiel sans fausse précision. */
export function centaine(n) {
  return Math.round(n / 100) * 100
}

/*
 * Seuil de rentabilité : nombre de créneaux à sauver chaque mois pour que
 * Belya se paie. 15 000 F ÷ 5 000 F = 3 ; 3 000 F ÷ 5 000 F → 1.
 */
export function seuilRentabilite(mensuel, ticket) {
  return Math.max(1, Math.ceil(mensuel / ticket))
}

export function noteSeuil(mensuel, ticket) {
  const n = seuilRentabilite(mensuel, ticket)
  return n === 1
    ? 'Le seuil de rentabilité tient en un seul créneau sauvé par mois.'
    : `Le seuil de rentabilité tient en ${n} créneaux sauvés par mois.`
}

/*
 * Trois profils en un appui.
 *
 * La cible tient un cahier papier et travaille sur un Android milieu de
 * gamme : lui demander de régler six curseurs avant de voir son chiffre,
 * c'est la perdre. Elle choisit son profil, le chiffre s'affiche, et les
 * curseurs ne servent qu'à ceux qui veulent affiner.
 *
 * Le profil « Salon » reproduit le salon de référence du cahier : 20 absences
 * par semaine, soit 433 333 F de perte mensuelle (le cahier arrondit à
 * 430 000 F en partant de 86 absences par mois).
 */
export const PROFILS = [
  {
    id: 'solo',
    nom: 'Je travaille seule',
    detail: 'À domicile ou un poste',
    absencesSemaine: 1,
    valeurs: { postes: 1, creneauxJour: 3, joursOuvres: 22, remplissage: 50, noShow: 20, ticket: 5000 },
  },
  {
    id: 'salon',
    nom: 'J’ai un salon',
    detail: '2 à 4 postes',
    absencesSemaine: 20,
    valeurs: { postes: 3, creneauxJour: 8, joursOuvres: 26, remplissage: 69, noShow: 20, ticket: 5000 },
  },
  {
    id: 'institut',
    nom: 'J’ai un institut',
    detail: '5 postes et plus',
    absencesSemaine: 32,
    valeurs: { postes: 5, creneauxJour: 8, joursOuvres: 26, remplissage: 70, noShow: 20, ticket: 5000 },
  },
]

/*
 * LE MOMENT MAGIQUE.
 *
 * Elle n'entre pas un modèle, elle entre ce qu'elle a déjà en tête : le
 * nombre de clientes qui ne sont pas venues cette semaine. Elle le sait —
 * le cahier le dit, « elle perçoit la perte, elle sait compter ses
 * créneaux vides ».
 *
 * Ce qu'elle n'a jamais calculé, c'est la multiplication. Sept absences,
 * c'est un agacement. Sept absences par semaine pendant un an, c'est
 * 1 820 000 F. L'écart entre les deux, c'est l'aha.
 *
 * L'offre se place immédiatement après, dans le même bloc — pas quatre
 * sections plus bas.
 */
export const AHA = {
  micro: 'Le moment où ça devient concret',
  titreSans: 'Cette semaine, combien de clientes',
  titreSerif: 'ne sont pas venues ?',
  aide: 'Le chiffre que vous avez déjà en tête. Pas besoin de le chercher.',
  compteurLibelle: 'Rendez-vous perdus cette semaine',
  ticketLibelle: 'Votre prestation moyenne',
  ticketsRapides: [3000, 5000, 10000, 15000],
  lignes: { semaine: 'Cette semaine', mois: 'Ce mois-ci', annee: 'Sur une année' },
  revelation: 'Sur une année',
  recuperation: 'Ce que Belya peut rendre vendable (estimation)',
  cta: 'Activer mon compte',
  // La note du seuil de rentabilité est calculée : voir noteSeuil().
}

export const REGLAGES = {
  invite: 'Quel est votre établissement ?',
  ouvrir: 'Ajuster mes chiffres',
  fermer: 'Masquer les réglages',
  aide: 'Pas besoin d’y toucher : choisissez simplement votre profil au-dessus.',
}

export const ARGUMENTS = {
  listeAttente: {
    index: '01',
    etiquette: 'Liste d’attente',
    titre: 'Le créneau libéré repart en 30 minutes',
    descriptif:
      'Dès qu’un rendez-vous saute, Belya le propose aux clientes en attente. Premier arrivé, premier servi.',
    pied: 'Objectif : un créneau libéré sur deux revendu',
    creneau: '14 h 00 · Samedi',
    candidates: [
      { nom: 'Awa K.', prestation: 'Tissage fermé', attente: 'en attente depuis 2 j' },
      { nom: 'Fatou D.', prestation: 'Braids medium', attente: 'en attente depuis 4 j' },
      { nom: 'Mariam T.', prestation: 'Défrisage + soin', attente: 'en attente depuis 1 j' },
    ],
  },
  whatsapp: {
    index: '02',
    etiquette: 'Rappels WhatsApp',
    titre: 'Le rappel qui exige une réponse',
    descriptif:
      'À J-1, la cliente répond « oui ». Sans réponse à H-4, le rendez-vous bascule à risque et le créneau part en liste d’attente.',
    pied: 'Sans réponse à H-4 → remis en attente',
    lignes: [
      'J-1  18:00  →  Awa K. · confirmation demandée',
      'J-1  18:04  ←  Awa K. · « OUI »  ✓ confirmé',
      'J-1  18:00  →  Fatou D. · confirmation demandée',
      'H-4  06:00  ·  Fatou D. sans réponse → à risque',
      'H-4  06:01  ·  créneau 14 h 00 remis en attente',
      'H-3  07:12  ←  Mariam T. · « JE PRENDS »  ✓ revendu',
    ],
  },
  tableauBord: {
    index: '03',
    etiquette: 'Tableau de bord',
    titre: 'Le gain, en francs, chaque mois',
    descriptif:
      'Créneaux sauvés et francs récupérés, semaine après semaine. C’est ce chiffre qui décide du réabonnement.',
    pied: 'Le chiffre qui décide du réabonnement',
    jours: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    jourCible: 5,
    releve: [
      // Profil Salon : 20 × 0,5086 × 52 / 12 = 44 créneaux ; 44 × 5 000 F = 220 000 F.
      { cle: 'Créneaux sauvés', valeur: '44' },
      { cle: 'Gain du mois', valeur: '220 000 F' },
    ],
    bouton: 'Enregistrer',
  },
}

export const MANIFESTE = {
  commun:
    'La plupart des logiciels de réservation se concentrent sur : empêcher la cliente de partir.',
  notreSans: 'Nous nous concentrons sur :',
  notreSerifAvant: 'remplir le créneau',
  notreSerifApres: 'qu’elle libère.',
  appui:
    'Le problème n’est pas qu’une cliente ne vienne pas. Le problème est qu’un créneau reste vide.',
}

export const PROTOCOLE = [
  {
    numero: '01',
    etiquette: 'Couche 1 · Confirmation active',
    titre: 'Confirmer',
    lignes: [
      'Le rappel de la veille ne se contente pas d’informer : il demande une réponse explicite.',
      'Sans « oui » à quatre heures du rendez-vous, le créneau bascule automatiquement à risque.',
    ],
    exigence: 'Ce que ça demande à la cliente : un mot.',
  },
  {
    numero: '02',
    etiquette: 'Couche 2 · Annulation en un clic',
    titre: 'Libérer',
    lignes: [
      'Chaque message porte un lien d’annulation. Pas de justification, pas d’appel, pas de gêne.',
      'L’absence sèche devient une annulation anticipée — et un créneau qu’on peut encore vendre.',
    ],
    exigence: 'Ce que ça demande à la cliente : un clic.',
  },
  {
    numero: '03',
    etiquette: 'Couche 3 · Liste d’attente',
    titre: 'Revendre',
    lignes: [
      'Le créneau libéré part immédiatement aux clientes inscrites en attente, valable trente minutes.',
      'C’est ici que se joue l’essentiel de la valeur : la moitié des créneaux perdus redeviennent vendables.',
    ],
    exigence: 'Ce que ça demande à la cliente : rien.',
  },
]

/* Libellé de l'offre mise en avant. « Le plus vendu » attendra les premières ventes. */
export const BADGE_OFFRE = 'Recommandé'

/*
 * Garantie premier mois, calée sur le seuil de rentabilité du calculateur.
 */
export const GARANTIE = {
  titre: 'Garantie premier mois',
  texte:
    'Si Belya ne vous fait pas sauver assez de créneaux pour couvrir son prix le premier mois, vous êtes remboursée.',
  detail:
    'À 5 000 F la prestation : 1 créneau sauvé en Solo, 3 en Salon, 6 en Institut.',
  courte: 'Garantie premier mois : remboursée si Belya ne couvre pas son prix.',
}

export const TARIFS = [
  {
    nom: 'Solo',
    cible: 'Prestataire à domicile',
    mensuel: 3000,
    prorata: '100 F / jour ouvert',
    recharge: 'Recharge minimum 1 000 F',
    pack3: 8000,
    pack12: 30000,
    // Le retour et le potentiel sont calculés avec potentiel() sur ce profil.
    profil: 'solo',
    inclus: [
      'Page de réservation publique',
      'Agenda jour et semaine',
      'Rappels WhatsApp à confirmation active',
      'Annulation en un clic',
      'Liste d’attente automatique',
    ],
    misEnAvant: false,
  },
  {
    nom: 'Salon',
    cible: '2 à 4 postes',
    mensuel: 15000,
    prorata: '500 F / jour ouvert',
    recharge: 'Recharge minimum 2 000 F',
    pack3: 40000,
    pack12: 150000,
    // Le retour et le potentiel sont calculés avec potentiel() sur ce profil.
    profil: 'salon',
    inclus: [
      'Tout ce que contient Solo',
      'Agendas multiples, un par poste',
      'Escalade graduée sur les absences répétées',
      'Acompte ciblé samedis et veilles de fête',
      'Tableau de bord du gain en francs',
    ],
    misEnAvant: true,
  },
  {
    nom: 'Institut',
    cible: '5 postes et plus',
    mensuel: 30000,
    prorata: '1 000 F / jour ouvert',
    recharge: 'Recharge minimum 5 000 F',
    pack3: 80000,
    pack12: 300000,
    // Le retour et le potentiel sont calculés avec potentiel() sur ce profil.
    profil: 'institut',
    inclus: [
      'Tout ce que contient Salon',
      'Postes illimités',
      'Mise en route accompagnée sur place',
      'Export des rendez-vous et des encaissements',
      'Interlocuteur dédié sur WhatsApp',
    ],
    misEnAvant: false,
  },
]

export const PIED = {
  slogan: 'Ne laissez plus un créneau se perdre.',
  /*
   * Un lien avec `ancre` fait défiler jusqu'à sa section ; sans ancre, c'est
   * du texte simple. Aucun lien ne doit mener dans le vide.
   */
  colonnes: [
    {
      titre: 'Le produit',
      liens: [
        { libelle: 'Le coût du no-show', ancre: 'calculateur' },
        { libelle: 'La méthode', ancre: 'methode' },
        { libelle: 'Le protocole', ancre: 'protocole' },
        { libelle: 'Tarifs', ancre: 'tarifs' },
      ],
    },
    {
      titre: 'Pour qui',
      liens: [
        { libelle: 'Salons de coiffure' },
        { libelle: 'Instituts de beauté' },
        { libelle: 'Prestataires à domicile' },
        { libelle: 'Barbiers' },
      ],
    },
    {
      titre: 'Commencer',
      liens: [
        { libelle: 'Calculer ma perte', ancre: 'calculateur' },
        { libelle: 'Activer mon compte', ancre: 'tarifs' },
      ],
    },
  ],
  /*
   * Pages légales : à rétablir quand elles existent (mentions légales,
   * confidentialité — obligatoire dès qu'on stocke les numéros des clientes,
   * loi n° 2013-450, ARTCI — et conditions générales de vente).
   * Format : { libelle: 'Mentions légales', href: '/mentions-legales' }
   */
  legal: [],
}
