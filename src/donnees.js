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
 * PAIEMENT — PAR L'APPLICATION, AUCUN CONTACT PAR WHATSAPP.
 *
 * Le site ne prend pas l'argent. Il envoie la gérante s'inscrire dans
 * l'application, et c'est là qu'elle paie :
 *
 *   site vitrine  →  APP_URL/inscription/?offre=<solo|salon|institut>
 *                 →  code WhatsApp, compte créé
 *                 →  écran de recharge
 *                 →  page de l'agrégateur, où elle choisit son opérateur
 *
 * Pourquoi ce détour plutôt que quatre boutons de portefeuille. Un
 * paiement encaissé avant l'inscription n'a personne à créditer : il
 * faudrait rattacher la somme à un compte à la main, une fois le compte
 * créé. Et le choix de l'opérateur appartient à la page de l'agrégateur,
 * qui les connaît tous les quatre — le dupliquer ici reviendrait à le
 * maintenir à deux endroits.
 *
 * Les quatre pastilles restent affichées, mais comme information : elles
 * disent ce qu'on accepte, ce ne sont plus des boutons.
 *
 * Prérequis, rappelé par le cahier (section 11) : RCCM, pièce du gérant
 * et RIB — pour le compte marchand, pas pour ouvrir l'application.
 */

/*
 * Adresse de l'application, à renseigner par le propriétaire — par
 * exemple 'https://app.belya.ci'. Tant qu'elle est vide, le bouton se
 * présente comme indisponible plutôt que de mener dans le vide.
 */
export const APP_URL = ''

/*
 * Numéro commercial WhatsApp : 05 46 00 96 66.
 *
 * Écrit ici et non seulement dans l'environnement, parce que c'est du
 * contenu de page comme le reste de ce fichier — et parce qu'un numéro
 * absent du build ferait disparaître le bouton en silence le jour du
 * déploiement, si la variable était oubliée dans le tableau de bord
 * Vercel.
 *
 * `VITE_WHATSAPP_COMMERCIAL` reste prioritaire : elle permet de changer
 * de numéro sans toucher au code, ou d'en pointer un autre sur une
 * préproduction.
 *
 * Format wa.me : international, sans « + » ni espace. 2250546009666 est
 * ce que rend `belya.telephone.normaliser('0546009666')`, privé de son
 * « + » — les deux dépôts parlent donc du même numéro.
 */
export const WHATSAPP_COMMERCIAL =
  import.meta.env?.VITE_WHATSAPP_COMMERCIAL || '2250546009666'

/*
 * Destination WhatsApp pour une offre, message déjà écrit. La gérante
 * n'a plus qu'à appuyer sur envoyer : elle n'a ni à expliquer ce qu'elle
 * veut, ni à retrouver le montant.
 */
export function lienWhatsApp(offre) {
  if (!WHATSAPP_COMMERCIAL) return null

  const numero = String(WHATSAPP_COMMERCIAL).replace(/[^0-9]/g, '')
  if (!numero) return null

  const message =
    `Bonjour, je veux activer Belya — offre ${offre.nom} ` +
    `(${fcfa(offre.mensuel)} par mois).`

  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`
}

/*
 * Les quatre portefeuilles mobiles de Côte d'Ivoire, pour information.
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

/*
 * Destination d'inscription pour une offre, ou null si APP_URL est vide.
 * `offre.profil` vaut solo, salon ou institut — les mêmes valeurs que
 * l'énumération Offre de l'application.
 */
export function lienInscription(offre) {
  if (!APP_URL) return null
  const base = APP_URL.replace(/\/+$/, '')
  return `${base}/inscription/?offre=${encodeURIComponent(offre.profil)}`
}

/* Libellé du bouton des cartes Tarifs. */
export const CTA_TARIF = 'Activer mon compte'

export const ACTIVATION = {
  titre: 'Activer votre compte Belya',
  libelleMontant: 'Montant à régler',
  rappel:
    'Crédit prépayé : le compte se décompte au prorata des jours ouverts. Aucun prélèvement automatique, vous rechargez quand vous voulez.',
  ctaWhatsApp: 'Activer via WhatsApp',
  cta: 'Continuer vers l’inscription',
  moyensAcceptes: 'Moyens acceptés',
  mention:
    'Écrivez-nous : on active votre compte avec vous, puis vous payez par Orange Money, MTN MoMo, Moov Money ou Wave.',
  indisponible: 'Inscriptions bientôt ouvertes.',
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
 * Un créneau perdu sur deux redevient vendable. Une moitié, pas un
 * pourcentage à la décimale : c'est une hypothèse de travail, et un
 * chiffre rond le dit plus honnêtement que 50,86 %.
 *
 * À rouvrir une fois les pilotes mesurés.
 */
export const TAUX_RECUPERATION = 1 / 2

export const SEMAINES_PAR_MOIS = 52 / 12

/*
 * LA formule du potentiel. Calculateur et cartes Tarifs la partagent :
 * un seul endroit à modifier, aucun chiffre qui diverge d'un écran à
 * l'autre.
 *
 *   créneaux récupérés / mois = (perdus par semaine ÷ 2) × 52 / 12
 *   gain mensuel              = créneaux récupérés × prestation
 *   retour                    = gain mensuel ÷ prix de l'offre
 *
 * Le nombre de créneaux est arrondi AVANT d'être converti en francs.
 * Sans cela l'écran affiche « 43 créneaux » et « 216 667 F », et une
 * gérante qui divise l'un par l'autre trouve 5 039 F au lieu des 5 000 F
 * qu'elle vient de saisir. Les deux chiffres doivent tomber juste
 * ensemble : 20 absences → 43 créneaux → 215 000 F.
 */
export function potentiel(absencesSemaine, ticket, mensuel) {
  const perteSemaine = absencesSemaine * ticket
  const perteAn = perteSemaine * 52

  const creneauxSemaine = absencesSemaine * TAUX_RECUPERATION
  const creneauxMois = Math.round(creneauxSemaine * SEMAINES_PAR_MOIS)

  const recuperableMois = creneauxMois * ticket
  const recuperableAn = recuperableMois * 12

  return {
    perteSemaine,
    perteMois: perteSemaine * SEMAINES_PAR_MOIS,
    perteAn,
    recuperableAn,
    recuperableMois,
    creneauxSemaine,
    creneauxMois,
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
 * Garantie premier mois.
 *
 * Le remède est un **crédit de 30 jours**, pas un remboursement :
 * `evaluer_la_garantie` dans belya-app/paiements/credit.py ajoute
 * JOURS_GARANTIE = 30 au solde. Le mois suivant est offert, aucun argent
 * ne revient.
 *
 * C'est la seule phrase de cette page qu'il faut relire à chaque
 * modification du code : écrire « remboursée » serait promettre un
 * versement sortant qui n'existe pas, et qu'il faudrait honorer à la
 * main.
 *
 * Le seuil est celui du calculateur — récupérer au moins le prix de
 * l'offre, soit 1 créneau sauvé en Solo, 3 en Salon, 6 en Institut à
 * 5 000 F la prestation.
 */
export const GARANTIE = {
  titre: 'Garantie premier mois',
  texte:
    'Si Belya ne vous fait pas récupérer au moins le prix de votre offre le premier mois, le mois suivant vous est offert.',
  detail:
    'Sur les 30 jours qui suivent votre premier paiement. À 5 000 F la prestation : 1 créneau sauvé en Solo, 3 en Salon, 6 en Institut.',
  courte:
    'Garantie premier mois : le mois suivant offert si Belya ne couvre pas son prix.',
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
   * Pages légales, servies en HTML statique depuis public/. Elles portent
   * des marqueurs [À COMPLÉTER] partout où il manque une information que
   * seul le propriétaire détient — RCCM, adresse, e-mail. Une mention
   * légale inventée vaut moins que pas de mention.
   */
  legal: [
    { libelle: 'Mentions légales', href: '/mentions-legales.html' },
    { libelle: 'Confidentialité', href: '/confidentialite.html' },
    { libelle: 'Conditions générales', href: '/conditions.html' },
  ],
}

/*
 * Ce qui se lit sous le slogan, dans le pied de page.
 *
 * C'était « Système opérationnel », avec un point vert clignotant —
 * affirmé pour un service qui n'est pas encore déployé. Un lieu, lui,
 * est vrai en permanence et dit quelque chose d'utile : Belya est
 * ivoirien, et ses concurrents ne le sont pas.
 */
export const ANCRAGE = 'Abidjan · Côte d’Ivoire'
