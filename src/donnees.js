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

/*
 * Aller à une ancre.
 *
 * Si le défilement inertiel tourne, on passe par lui : le défilement
 * natif du navigateur et Lenis se disputeraient la page, et le résultat
 * saccade. Sinon — mouvement réduit, ou Lenis pas encore démarré — on
 * retombe sur le comportement du navigateur, qui convient.
 */
export function allerA(id) {
  const cible = document.getElementById(id)
  if (!cible) return

  const doux = typeof window !== 'undefined' && window.__belyaDefilement
  if (doux) {
    doux.scrollTo(cible, { duration: 1.3 })
    return
  }
  cible.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  /*
   * WhatsApp est nommé dès le chapô. C'est le canal réel des clientes
   * d'Abidjan, et l'omettre laissait la visiteuse imaginer une
   * application à faire installer — l'objection numéro un.
   */
  chapo:
    "433 000 F s'évaporent chaque mois d'un salon de trois postes. L'objectif de Belya : en rendre la moitié vendable. Rappels et liste d'attente sur WhatsApp, sans rien installer pour vos clientes.",
  /*
   * Le prix apparaît sous les boutons, pas seulement en bas de page.
   * Une gérante qui doit défiler six sections pour savoir combien ça
   * coûte se demande ce qu'on lui cache.
   */
  micro: 'Dès 3 000 F / mois · crédit prépayé · sans engagement',
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
      // Profil Salon, avec la formule unifiée de potentiel() :
      // 20 perdus par semaine ÷ 2 × 52 / 12 = 43 créneaux ;
      // 43 × 5 000 F = 215 000 F. Les deux chiffres doivent rester ceux
      // que le calculateur affiche, sinon la page se contredit.
      { cle: 'Créneaux sauvés', valeur: '43' },
      { cle: 'Gain du mois', valeur: '215 000 F' },
    ],
    bouton: 'Enregistrer',
  },
}

/*
 * LES MÉDIAS — un seul endroit, des champs vides tant qu'ils manquent.
 *
 * Règle absolue : **chaque section doit être entière et soignée sans
 * son média**. Un champ vide ne produit jamais un cadre vide, une
 * erreur 404 ou un trou dans la page — il produit une version
 * typographique qui se tient seule. La page complète doit être belle
 * avant que le premier fichier n'arrive.
 *
 * Le cahier des charges de production est dans
 * `docs/refonte/PROMPTS-HIGGSFIELD.md` : sujet, cadrage, durée, poids
 * maximal, et les commandes ffmpeg de post-traitement.
 *
 * Les rendus bruts vont dans `medias-bruts/` (non versionné). Seuls les
 * fichiers post-traités entrent dans `public/`.
 */
export const MEDIAS = {
  // S1 — le héros
  heroVideo: '',          // public/video/salon.mp4        · 6 Mo max
  heroAffiche: '',        // public/video/salon-affiche.jpg · 180 Ko max
  heroVideoMobile: '',    // public/video/salon-mobile.mp4  · 2,5 Mo max

  // S2 — le créneau vide, puis rempli. MÊME cadrage exact : la page
  // fait glisser l'une sur l'autre.
  fauteuilVide: '',       // public/medias/fauteuil-vide.jpg
  fauteuilOccupe: '',     // public/medias/fauteuil-occupe.jpg

  // S4 — le support de la démo. Écran noir, parfaitement de face : la
  // conversation est en HTML par-dessus, jamais dans l'image.
  telephone: '',          // public/medias/telephone.jpg

  // S5 — bandeau de parallaxe entre deux panneaux
  mains: '',              // public/medias/mains-tresses.jpg

  // S7 — illustration du bloc garantie. JAMAIS présentée comme une
  // cliente réelle, jamais accompagnée d'un témoignage.
  gerante: '',            // public/medias/gerante.jpg

  // S9 — fond de l'appel final, 35 % d'opacité
  boucle: '',             // public/video/boucle.mp4 · 1,5 Mo max
}

/*
 * LA VIDÉO DU HERO — à déposer, pas à inventer.
 *
 * Le mécanisme est écrit et fonctionne : la section se fige, le
 * défilement déroule le film image par image, le texte se compose
 * par-dessus. Il ne manque que le fichier.
 *
 * ── CE QU'IL FAUT COMMANDER ──────────────────────────────────────────
 *
 *   Sujet    : une coiffeuse ivoirienne dans son salon. Plan fixe ou
 *              travelling très lent. Elle travaille : tresses, brushing,
 *              une cliente assise. Lumière chaude et naturelle.
 *   Cadrage  : les mains et le geste, pas les visages en gros plan. La
 *              partie GAUCHE du cadre doit rester calme — c'est là que
 *              se pose le titre.
 *   Durée    : 6 à 10 secondes. Au-delà, le défilement devient long.
 *   Format   : MP4 (H.264) ET WebM, 1920×1080, sans son.
 *   Poids    : viser 3 Mo, ne jamais dépasser 6 Mo.
 *   Encodage : images-clés rapprochées (une toutes les 6 images), sinon
 *              le déroulé au défilement saccade —
 *              `ffmpeg -i source.mp4 -g 6 -crf 26 -an hero.mp4`
 *
 * ── OÙ LE METTRE ─────────────────────────────────────────────────────
 *
 *   public/video/salon.mp4  et  public/video/salon-affiche.jpg
 *   puis renseigner `fichier` et `affiche` ci-dessous.
 *
 * Tant que `fichier` est vide, le hero affiche sa composition
 * typographique seule — qui se tient très bien. La vidéo est un bonus,
 * jamais une dépendance.
 */
export const VIDEO_HERO = {
  fichier: '',
  affiche: '',
  // Combien d'écrans de défilement pour dérouler le film. 2,5 donne un
  // geste ample sans lasser.
  ecrans: 2.5,
}

/*
 * LA SCÈNE — le mécanisme montré, pas expliqué.
 *
 * Le reste de la page raconte comment Belya récupère un créneau perdu.
 * Cette section le donne à voir : une place se vide, la liste d'attente
 * s'allume, « OUI » revient, l'argent avec.
 *
 * Aucune vidéo. Le dessin est en SVG animé, donc il ne coûte rien à
 * télécharger — décisif pour une gérante en 3G qui paie son forfait au
 * méga-octet. Voir l'en-tête de SceneRevente.jsx.
 *
 * `gain` est le prix d'une prestation, pas un cumul : c'est UNE place
 * revendue qu'on montre, celle de samedi 14 h.
 */
export const SCENE = {
  surtitre: 'Ce qui se passe quand une cliente annule',
  titreSans: 'Une place se vide.',
  titreSerif: 'Elle se remplit.',
  chapo:
    'Samedi, 14 h. Awa annule. Sans Belya, la place reste vide et la journée est amputée. Avec Belya, elle repart en trente minutes.',
  agenda: 'VOTRE SEMAINE',
  attente: 'EN LISTE D’ATTENTE',
  candidates: ['Fatou D.', 'Mariam T.', 'Aïcha B.'],
  gainLibelle: 'RÉCUPÉRÉ',
  gain: 5000,
  etapes: [
    'Votre semaine est pleine. Chaque place est une prestation vendue.',
    'Samedi 14 h : Awa annule. La place se vide.',
    'Belya prévient aussitôt vos clientes en attente.',
    'Fatou répond « OUI ». La place est reprise.',
    'La prestation est sauvée. Vous n’avez rien eu à faire.',
  ],
  // Lue par les lecteurs d'écran à la place du dessin.
  alternative:
    'Un agenda de la semaine dont une place du samedi se libère, puis se remplit à nouveau grâce à la liste d’attente.',
}

/*
 * S2 — LE CRÉNEAU VIDE, PUIS REMPLI.
 *
 * Deux photos au cadrage identique, l'une révélée sur l'autre par un
 * rideau au défilement. C'est la promesse du produit en une image, sans
 * une ligne d'explication.
 *
 * Sans les photos : la même bascule de texte sur un fond typographique.
 * La section garde son sens.
 */
export const FAUTEUIL = {
  surtitre: 'Samedi, 14 h',
  avant: {
    titreSans: 'Un fauteuil vide.',
    titreSerif: '5 000 F perdus.',
    texte:
      'La cliente a annulé ce matin. Sans rien pour la remplacer, la place reste vide jusqu’à la fermeture.',
  },
  apres: {
    titreSans: 'Même fauteuil, même heure.',
    titreSerif: 'Revendu en 30 minutes.',
    texte:
      'Belya a proposé la place à votre liste d’attente. Fatou a répondu. Vous n’avez rien eu à faire.',
  },
  alternative:
    'Un fauteuil de salon vide, puis le même fauteuil occupé par une cliente.',
}

/*
 * S4 — LA DÉMO QU'ON ESSAIE.
 *
 * La conversation est en HTML par-dessus un écran noir : nette,
 * traduisible, sans les lettres déformées de l'IA. La visiteuse répond
 * à la place d'Awa et voit les deux branches — c'est ce qui fait
 * comprendre le mécanisme en dix secondes.
 */
export const DEMO = {
  surtitre: 'Essayez, répondez à sa place',
  titreSans: 'Le rappel qui',
  titreSerif: 'exige une réponse.',
  chapo:
    'À J-1, Awa reçoit ce message. Ce qu’elle répond décide de votre samedi. Répondez à sa place.',
  invite: 'Répondez à la place d’Awa',
  choixOui: 'OUI',
  choixAnnuler: 'Annuler',
  rejouer: 'Rejouer',
  legende: ['Confirmer', 'Libérer', 'Revendre'],
  // Les bulles. `sens` vaut 'recu' (du salon vers Awa) ou 'envoye'.
  rappel: {
    heure: '18:00',
    sens: 'recu',
    texte:
      'Rappel de Maison Dorée : vous avez rendez-vous demain à 14:00 pour Tresses medium. Répondez OUI pour confirmer.',
  },
  branches: {
    oui: {
      reponse: { heure: '18:04', sens: 'envoye', texte: 'OUI' },
      etat: 'Confirmé',
      note: 'Awa a confirmé. Le créneau est sûr, et le rappel de deux heures lui partira gratuitement.',
      etape: 0,
    },
    annuler: {
      reponse: { heure: '18:04', sens: 'envoye', texte: 'Je ne peux plus venir' },
      etat: 'Libéré',
      note: 'La place part à la liste d’attente. Trois clientes sont prévenues.',
      etape: 1,
      suite: [
        {
          heure: '18:05',
          sens: 'recu',
          texte:
            'Fatou, suite à votre inscription en liste d’attente : une place s’est libérée chez Maison Dorée demain à 14:00. Elle vous est réservée 30 minutes.',
        },
        { heure: '18:09', sens: 'envoye', texte: 'Je prends !' },
      ],
      final: 'Revendu',
      noteFinale: 'La place est reprise. 5 000 F qui allaient disparaître.',
      etapeFinale: 2,
    },
  },
  gain: 5000,
  attente: ['Fatou D.', 'Mariam T.', 'Aïcha B.'],
}

/*
 * S8 — LA FAQ.
 *
 * ⚠️ RÈGLE : chaque réponse est vérifiée dans `../belya-app/`, en
 * lecture seule. Aucune n'est écrite de mémoire ou par déduction. La
 * source est citée en commentaire pour que la vérification soit
 * rejouable. Une question dont la réponse cesse d'être vraie doit être
 * retirée, pas réécrite au jugé.
 */
export const FAQ = [
  {
    // Vérifié : public/urls.py — dix adresses publiques, toutes des
    // pages web. Aucune application cliente n'existe dans le produit.
    question: 'Mes clientes doivent-elles installer une application ?',
    reponse:
      'Non, et c’est le cœur du parti pris. Votre cliente reçoit un lien, ouvre une page web et choisit son créneau. Les rappels arrivent sur WhatsApp, qu’elle a déjà. Rien à télécharger, rien à créer comme compte.',
  },
  {
    // Vérifié : messagerie/taches.py, marquer_a_risque() —
    // « On ne l'annule jamais : on la signale à la gérante, qui décide. »
    // Le bouton « Libérer ce créneau » est dans templates/gerante/aujourdhui.html.
    question: 'Et si une cliente ne répond pas au rappel ?',
    reponse:
      'Quatre heures avant, le rendez-vous passe « à risque » sur votre agenda. Belya ne l’annule jamais à votre place : il vous signale le doute, et vous proposez de libérer la place en un bouton. C’est vous qui décidez.',
  },
  {
    // Vérifié : paiements/credit.py (consommer_un_jour → EPUISE),
    // messagerie/taches.py (_rappels_suspendus), public/views.py (503).
    // « Blocage doux : rien n'est annulé. »
    question: 'Que se passe-t-il quand mon crédit arrive à zéro ?',
    reponse:
      'Votre agenda reste lisible, mais plus modifiable, et votre page de réservation annonce une indisponibilité temporaire. Aucune donnée n’est supprimée, aucun rendez-vous n’est annulé. Une recharge réactive tout immédiatement. Vous êtes prévenue à 5 jours, 2 jours, puis à zéro.',
  },
  {
    // Vérifié : comptes/inscription.py — quatre champs, puis un code à
    // six chiffres. Le compte est actif dès le code validé.
    question: 'Combien de temps pour démarrer ?',
    reponse:
      'Quatre champs : le nom de votre salon, votre numéro WhatsApp, votre quartier et votre formule. Vous recevez un code à six chiffres, vous le saisissez, et votre page de réservation existe. Vos horaires et vos prestations se règlent ensuite, à votre rythme.',
  },
  {
    // Vérifié : public/conditions.html §11 — « Aucun engagement de
    // durée. Vous cessez d'utiliser Belya en ne rechargeant plus. »
    question: 'Puis-je arrêter quand je veux ?',
    reponse:
      'Oui. Il n’y a aucun engagement de durée et aucun prélèvement automatique : vous achetez des jours, et vous cessez en ne rechargeant plus. Les jours achetés restent valables douze mois, et votre compte se réactive à tout moment.',
  },
  {
    // Vérifié : belya/cloisonnement.py (filtrage par établissement),
    // comptes/models.py JournalAcces (trace des consultations admin),
    // public/confidentialite.html.
    question: 'Qui voit les numéros de mes clientes ?',
    reponse:
      'Vous seule. Chaque requête est filtrée par salon, et des tests automatisés vérifient sur chaque page qu’un salon ne voit jamais les données d’un autre. Toute consultation depuis l’administration laisse une trace nominative : on peut répondre à « qui a regardé quoi, et quand ».',
  },
]

/*
 * S9 — L'APPEL FINAL.
 *
 * Une seule phrase, très grande, et un bouton. Pas de formulaire, pas
 * de champ e-mail : le canal, c'est WhatsApp.
 */
export const FINAL = {
  titreSans: 'Samedi prochain,',
  titreSerif: 'aucun fauteuil vide.',
  micro: 'Garantie premier mois · sans engagement · dès 3 000 F',
}

/* La barre fixe du bas, sur mobile, après le héros. */
export const BARRE_MOBILE = {
  prix: 'Dès 3 000 F / mois',
  action: 'WhatsApp',
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
   * Pages légales, servies en HTML statique depuis public/.
   *
   * Elles sont entièrement renseignées. Deux mentions restent
   * provisoires et devront être corrigées le jour où elles aboutissent :
   * le RCCM, « en cours d'immatriculation », et la déclaration ARTCI,
   * « en cours ». Les trois pages les reprennent, donc les trois sont à
   * modifier ensemble.
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
