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
 * À REMPLACER par le vrai numéro avant mise en ligne, au format international
 * sans le « + » ni espaces. Exemple : '2250700000000'.
 */
export const WHATSAPP_NUMERO = ''

/*
 * BASCULE VERS LE VRAI PAIEMENT.
 *
 * Le cahier (section 11) est explicite : le RCCM bloque la phase G
 * (encaissement). Aucun agrégateur — CinetPay, PayDunya, kkiaPay, Wave —
 * n'ouvre de compte marchand sans registre de commerce, pièce du gérant
 * et RIB. Les quatre wallets ci-dessous se règlent donc par un agrégateur,
 * jamais en direct.
 *
 * Tant que cette constante est vide, le choix du wallet part sur WhatsApp.
 * Dès qu'elle porte l'URL de checkout de l'agrégateur, le bouton y va
 * directement, avec l'offre et le wallet en paramètres.
 */
export const CHECKOUT_URL = ''

export function lienWhatsApp(message) {
  const base = WHATSAPP_NUMERO ? `https://wa.me/${WHATSAPP_NUMERO}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(message)}`
}

/*
 * Les quatre portefeuilles mobiles de Côte d'Ivoire.
 * Les couleurs sont approchées : remplacer par les chartes officielles
 * de chaque opérateur avant mise en ligne (les logos sont des marques
 * déposées, leur usage demande leur kit de marque).
 */
export const PAIEMENTS = [
  { id: 'orange', nom: 'Orange Money', sigle: 'OM', fond: '#FF7900', texte: '#1A1420' },
  { id: 'mtn', nom: 'MTN MoMo', sigle: 'MTN', fond: '#FFCC00', texte: '#1A1420' },
  { id: 'moov', nom: 'Moov Money', sigle: 'MOOV', fond: '#004E9F', texte: '#FAF6F4' },
  { id: 'wave', nom: 'Wave', sigle: 'WAVE', fond: '#1DC3F3', texte: '#1A1420' },
]

/* Libellé du bouton des cartes Tarifs. */
export const CTA_TARIF = 'Activer mon compte'

export const ACTIVATION = {
  titre: 'Activer votre compte Belya',
  etape1: 'Choisissez votre moyen de paiement',
  libelleMontant: 'Montant à régler',
  rappel:
    'Crédit prépayé : le compte se décompte au prorata des jours ouverts. Aucun prélèvement automatique, vous rechargez quand vous voulez.',
  mention: 'Le règlement passe par un agrégateur agréé — CinetPay, PayDunya, kkiaPay ou Wave.',
  bouton: 'Continuer sur WhatsApp',
  boutonCheckout: 'Payer maintenant',
}

/*
 * Le héros n'a plus d'image : fond crème, conformément à la direction
 * Tech Organique. Seule reste la texture du manifeste, en lazy et à 9 %
 * d'opacité, servie en 1200 px.
 */
export const IMAGES = {
  texture: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=70',
}

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
    "430 000 F s'évaporent chaque mois d'un salon de trois postes. L'objectif de Belya : en rendre la moitié vendable, sans rien exiger de vos clientes.",
  stats: ['20 % de no-show', '86 rendez-vous manqués / mois', '5 160 000 F / an'],
  cta: 'Calculer ma perte',
  ctaSecondaire: 'Voir la méthode',
}

/*
 * Le salon de référence du cahier. Ces valeurs servent de point de départ
 * au calculateur : elles reproduisent exactement les 430 000 F/mois du document.
 */
export const REFERENCE = {
  postes: 3,
  creneauxJour: 8,
  joursOuvres: 26,
  remplissage: 69,
  noShow: 20,
  ticket: 5000,
}

/*
 * Le cahier chiffre la perte résiduelle du salon à 211 300 F pour 430 000 F
 * de perte initiale, soit 50,86 % rendus vendables une fois les cinq couches
 * en place. C'est un ratio de modèle, pas une mesure terrain.
 */
export const TAUX_RECUPERATION = 0.5086

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
      { cle: 'Créneaux sauvés', valeur: '43' },
      { cle: 'Gain du mois', valeur: '218 700 F' },
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

export const TARIFS = [
  {
    nom: 'Solo',
    cible: 'Prestataire à domicile',
    mensuel: 3000,
    prorata: '100 F / jour ouvert',
    recharge: 'Recharge minimum 1 000 F',
    trimestre: '8 000 F le trimestre',
    annee: '30 000 F l’année',
    roi: '5,1×',
    gain: 'Potentiel calculé : 15 300 F par mois',
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
    trimestre: '40 000 F le trimestre',
    annee: '150 000 F l’année',
    roi: '14,6×',
    gain: 'Potentiel calculé : 218 700 F par mois',
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
    trimestre: '80 000 F le trimestre',
    annee: '300 000 F l’année',
    roi: '11,9×',
    gain: 'Potentiel calculé : 356 000 F par mois',
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
  colonnes: [
    {
      titre: 'Le produit',
      liens: ['Le coût du no-show', 'La méthode', 'Le protocole', 'Tarifs'],
    },
    {
      titre: 'Pour qui',
      liens: ['Salons de coiffure', 'Instituts de beauté', 'Prestataires à domicile', 'Barbiers'],
    },
    {
      titre: 'Contact',
      liens: ['WhatsApp', 'Activer mon compte', 'Presse', 'Partenariats'],
    },
  ],
  legal: ['Conditions générales', 'Confidentialité', 'Mentions légales'],
}
