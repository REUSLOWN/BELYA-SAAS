# Belya : brief de la refonte « premium » de la landing page

**Pour :** l'agent qui code `belya-landing`, sur la branche `refonte-premium`.
**Objectif :** une landing page qui paraît avoir coûté 20 000 à 25 000 $, du niveau Awwwards, qui convertit une gérante de salon à Abidjan, et qui reste rapide en 4G.
**Base :** garder la fondation déjà posée (commits `2329534` et `c6e550b` : Lenis + GSAP, `HeroCinema`, `SceneRevente`). On l'enrichit, on ne repart pas de zéro.

---

## 0. Règles non négociables

1. **Palette inchangée.** Utilise uniquement `creme #FAF6F4`, `encre #1A1420`, `aubergine #2B1B2E`, `magenta #C2185B` et `magenta.clair #E8447F` (celui-ci seulement sur fond sombre). N'ajoute aucune couleur. Un dégradé n'est permis qu'entre ces teintes.
2. **Typographie inchangée.** Plus Jakarta Sans pour le texte, Cormorant Garamond italique pour les mots forts. Le contraste entre les deux est la signature de la marque : il faut l'amplifier, pas la diluer.
3. **Chiffres.** Tout chiffre affiché vient de `src/donnees.js`, et un même chiffre ne peut pas avoir deux valeurs sur la page. Tant qu'aucun pilote n'a été mesuré, rien n'est présenté comme « mesuré » : on écrit « objectif », « potentiel » ou « estimation ».
4. **Pas de fausse preuve.** Pas de faux témoignage, de fausse note, de faux logo client, de faux compteur de salons ni de faux chiffre d'usage. Les visuels de personnes sont des illustrations.
5. **Réponses de la FAQ.** Chaque réponse doit être vérifiée dans `../belya-app/`, en **lecture seule** : lis le code, `DECISIONS.md` et les pages légales. Si une réponse ne peut pas être vérifiée, retire la question plutôt que d'inventer.
6. **Performance d'Abidjan.** Garde les règles actuelles : la vidéo ne se charge jamais en 2G/3G ni en mode économie de données, et le texte est pré-rendu. La page doit être entière et belle **sans aucun média**.
7. **`prefers-reduced-motion`.** Il coupe toutes les animations, le pin et le défilement de la vidéo. La page reste alors une page statique élégante.
8. **CSP.** `vercel.json` reste tel quel. Aucun script externe : tout passe par npm. Les médias sont servis depuis `/video` et `/medias`.
9. **Commits.** Ne touche pas à `main`. Fais un commit par étape du plan (section 7). Pousse la branche `refonte-premium` pour obtenir l'URL de prévisualisation Vercel.

---

## 1. Audit de la page actuelle (bely-saas.vercel.app, 29/09)

**Ce qui marche, à garder :**
- La promesse « Le créneau vide est le vrai coût ».
- Le calculateur, qui fait taper son propre chiffre à la gérante.
- Le parti pris « remplir le créneau libéré ».
- Les tarifs en crédit prépayé, la garantie du premier mois, le bouton WhatsApp avec son message déjà écrit.
- Les pages légales complètes.

**Ce qui manque ou affaiblit :**

| # | Problème | Correction |
|---|---|---|
| 1 | Le mot **WhatsApp** n'apparaît pas dans le héros, alors que c'est le canal réel des clientes | Le mettre dans le chapô du héros |
| 2 | Aucun prix visible avant la section Tarifs | Ajouter une micro-ligne « dès 3 000 F / mois » sous les boutons du héros |
| 3 | « Le parti pris » et « Le protocole » répètent le même contenu (les trois couches) | Fusionner en une seule section |
| 4 | Aucune FAQ : les objections d'une gérante restent sans réponse | Créer une FAQ (section 3, S8) |
| 5 | Pas d'appel à l'action final avant le pied de page | Créer une section S9 |
| 6 | Pas de barre d'action fixe sur mobile | En ajouter une, visible après le héros |
| 7 | La démo est un dessin : on ne *vit* pas le rappel WhatsApp | Rendre la démo interactive (S4) |
| 8 | Aucune photo ni vidéo : la page ne montre jamais un salon africain | Les médias de `docs/refonte/PROMPTS-HIGGSFIELD.md` |
| 9 | Le tableau de bord d'exemple doit afficher 43 créneaux et 215 000 F | Aligner, et vérifier à chaque build |
| 10 | `og.jpg` générique | En tirer une nouvelle de l'affiche du héros |

---

## 2. Enseignements de la concurrence (16 sites analysés)

- **Reprendre le héros qui nomme la douleur.** Ramti (Maroc) demande « Votre salon est toujours sur papier ? ». Miali (Kenya) écrit « Vos clientes sont sur WhatsApp. Vos réservations aussi ».
- **Reprendre le calculateur de perte** (Treatwell). Belya l'a déjà : il faut en faire la star.
- **Reprendre la démo qu'on essaie, pas une simple capture** (GetMeBooked, Boulevard) : la visiteuse joue la cliente et répond « OUI ».
- **Reprendre le prix visible tôt** (Booksy, Setmore, GetMeBooked) et **la suppression du risque** (garantie, « en ligne en 2 minutes »).
- **Reprendre l'offre de migration** (GlossGenius) : « On recopie votre cahier pour vous ». **À ne mettre que si Fenka confirme qu'il le fait** : demande-lui avant.
- **Éviter les superlatifs sans preuve** (« n°1 »), les pages de 13 à 15 sections (Fresha, SimplyBook) et la démo obligatoire.
- **Références primées :**
  - Sol (solreader.com) : séquence vidéo pilotée par le scroll avec GSAP.
  - Truekind Skincare (Site du jour Awwwards, 04/2025) : parallaxe, galerie vidéo, palette sobre.
  - Antara Spa (mention Awwwards) : storytelling au scroll, luxe calme.

  Retenir leur retenue : peu de couleurs, beaucoup d'espace, des mouvements lents et précis.

---

## 3. Nouvelle architecture : 9 sections, pas une de plus

Le fil narratif : **je vois un salon → je vois ma perte → je vois comment elle revient → je vis le mécanisme → je vois le prix → je lève mes doutes → j'écris sur WhatsApp.**

### S1. Héros cinématique (existant, à enrichir)

- **Bureau.** La vidéo `salon.mp4` défile au scroll, section épinglée sur 2,5 écrans (déjà codé). Les trois temps du texte s'enchaînent :
  - 0 à 35 % : le titre ;
  - 35 à 70 % : le titre s'efface (opacité 0,12) et la ligne « 20 % de no-show · 87 rendez-vous manqués / mois · 5 200 000 F / an » monte, chiffre par chiffre ;
  - 70 à 100 % : le voile crème se densifie et prépare l'enchaînement vers S2.
- **Mobile (< 768 px).** **Pas** de défilement de la vidéo, qui saccade sous iOS. `salon-mobile.mp4` joue en boucle (`autoplay muted playsinline loop`), avec un voile crème sur le tiers haut. Pas d'épinglage.
- **Textes.** Chapô : « … Rappels et liste d'attente **sur WhatsApp**, sans rien installer pour vos clientes. » Sous les boutons, en micro-texte : « Dès 3 000 F / mois · crédit prépayé · sans engagement ».
- **Entrée.** Le titre apparaît par lignes masquées (SplitText, `lines` + masque, montée de 110 %, 1,2 s, `expo.out`, décalage de 0,08 s).

### S2. Le créneau vide (nouveau)

- Section épinglée sur 1,5 écran. `fauteuil-vide.jpg` est plein cadre. Au défilement, `fauteuil-occupe.jpg` se révèle **par-dessus** avec un `clip-path: inset(0 100% 0 0)` qui va jusqu'à `inset(0 0 0 0)`, comme un rideau qui glisse de gauche à droite.
- Le texte change en même temps, en fondu enchaîné :
  - avant : « Samedi, 14 h. Un fauteuil vide. **5 000 F** qui ne reviendront pas. »
  - après : « Même fauteuil, même heure. **Revendu en 30 minutes.** »
- Sur mobile, les deux images sont empilées et le rideau est déclenché par l'entrée à l'écran, sans épinglage.

### S3. Le calculateur (existant)

- Il est la star : mise en page plus aérée et chiffres plus grands.
- Les résultats s'animent en compteur (0 → valeur, 0,9 s, `power2.out`, séparateur d'espace fine insécable, arrondis de `donnees.js`).
- Au changement de profil, les chiffres se ré-animent depuis leur valeur précédente, pas depuis 0.

### S4. La démo WhatsApp que l'on essaie (fusion de `SceneRevente` et de la démo)

- **Fond `encre`** : premier basculement crème → sombre. Il est animé : la couleur de fond du `body` passe de crème à encre au franchissement de la section, en 0,6 s.
- **Support.** `telephone.jpg` au centre, avec une vraie conversation WhatsApp en HTML superposée à l'écran noir (bulles, heure, coches bleues, typographie système). La position de l'écran est calée en pourcentage de l'image.
- **Au scroll, étape par étape :**
  1. J-1 18:00, rappel : « Bonjour Awa, rendez-vous demain 14 h — Tresses. Répondez OUI pour confirmer. »
  2. Un bouton flottant « Répondez à la place d'Awa » propose **[OUI]** et **[Annuler]**.
     - « OUI » : la coche passe au bleu et le tableau à droite affiche « Confirmé ».
     - « Annuler » : le créneau se libère, la liste d'attente s'allume (3 noms), le message « Place libérée samedi 14 h » part et « Je prends ! » revient. Le compteur « + 5 000 F » monte.
- **Légende à gauche :** trois lignes qui s'allument l'une après l'autre : Confirmer · Libérer · Revendre.
- **Accessibilité.** Tout est jouable au clavier, et `aria-live="polite"` annonce chaque étape.

### S5. Les trois mécaniques (fusion de Fonctionnalités, Philosophie et Protocole)

- **Bureau.** Défilement horizontal épinglé de 3 panneaux pleine hauteur : 01 Confirmer, 02 Libérer, 03 Revendre. Chaque panneau reprend le titre serif, la phrase « Ce que ça demande à la cliente : un mot / un clic / rien » et un micro-visuel UI animé.
- Entre les panneaux 2 et 3, le bandeau `mains-tresses.jpg` défile en parallaxe (`yPercent -12 → 12`).
- **Mobile.** Cartes empilées, sans scroll horizontal.

### S6. Le tableau de bord

- Maquette du tableau de bord (existante) en plein cadre.
- La courbe des créneaux sauvés se dessine au scroll (`stroke-dashoffset`) et les chiffres s'animent. Valeurs : **43 créneaux · 215 000 F**.
- Parallaxe douce de la maquette (`yPercent -8 → 8`) sur fond crème.

### S7. Tarifs et garantie (existant)

- Les trois cartes arrivent avec un léger décalage, sans rotation.
- La carte « Recommandé » est légèrement surélevée et porte un liseré magenta.
- **Bloc Garantie en vis-à-vis de `gerante.jpg`**, avec une révélation de l'image par `clip-path` du bas vers le haut.
- **Ajouter** : « Mise en route avec vous sur WhatsApp · en ligne le jour même ». Seulement si c'est vrai : **demande à Fenka**.

### S8. FAQ (nouveau, 6 questions au maximum)

Un accordéon accessible (`<details>` stylé, animation de hauteur avec GSAP). Questions à traiter **si la réponse est vérifiable dans `belya-app`** :

- Mes clientes doivent-elles installer une application ?
- Et si une cliente ne répond pas au rappel ?
- Que se passe-t-il quand mon crédit arrive à zéro ?
- Combien de temps pour démarrer ?
- Puis-je arrêter quand je veux ?
- Qui voit les numéros de mes clientes ?

### S9. Appel final (nouveau)

- Fond `encre`, avec `boucle.mp4` en fond à 35 % d'opacité (s'il est absent, grain seul).
- Une phrase en Cormorant très grande, par exemple « Samedi prochain, **aucun fauteuil vide.** », puis un bouton magnétique « Activer via WhatsApp » (même lien que la fenêtre de paiement) et le rappel de la garantie en micro-texte.

### Éléments transverses

- **Barre fixe mobile.** Elle apparaît après S1 et disparaît sur S9 : prix « dès 3 000 F » à gauche, bouton « WhatsApp » à droite. Elle respecte `env(safe-area-inset-bottom)`.
- **Navbar.** Transparente sur le héros, puis crème translucide avec `backdrop-blur` après 80 px. Elle se cache au scroll vers le bas et réapparaît au scroll vers le haut.
- **Indicateur de progression.** Une fine ligne magenta de 2 px en haut de page.

---

## 4. Système de mouvement (à respecter partout)

| Élément | Réglage |
|---|---|
| Lenis | `duration: 1.1`, `easing: t => 1 - Math.pow(1 - t, 4)`, branché sur `gsap.ticker` (déjà fait), désactivé sur les écrans tactiles (`syncTouch: false`) |
| Courbes | entrée `expo.out` ; lié au scroll `none` ; micro-interactions `power3.out` |
| Durées | textes 1,1 à 1,3 s ; images 1,4 s ; micro-interactions 0,35 s |
| Révélation de texte | SplitText (gsap ≥ 3.13, inclus gratuitement) : lignes masquées, montée de 110 %, décalage de 0,08 s, une seule fois (`once: true`) |
| Révélation d'image | `clip-path: inset(100% 0 0 0)` → `inset(0)` + échelle 1,15 → 1 à l'intérieur, 1,4 s |
| Parallaxe | ±8 à 12 % au maximum, jamais sur du texte long |
| Boutons | effet magnétique (déplacement maximal 8 px), remplissage magenta qui monte au survol (déjà en place : à harmoniser) |
| Basculements de fond | crème → encre → crème, animés sur la couleur du `body`, 0,6 s |
| Épinglages | 3 au maximum sur toute la page (S1, S2, S5), aucun sur mobile |

**Règles de performance :**
- N'animer que `transform`, `opacity` et `clip-path`.
- `will-change` seulement pendant l'animation.
- `ScrollTrigger.refresh()` après chargement des médias (déjà fait).
- Un seul `gsap.context` par composant, nettoyé au démontage.

---

## 5. Médias

| Fichier | Section | Chargement |
|---|---|---|
| `video/salon.mp4` + `salon-affiche.jpg` | S1 bureau | affiche préchargée (`<link rel=preload as=image>`) ; vidéo seulement si 4G et bureau |
| `video/salon-mobile.mp4` | S1 mobile | seulement si ce n'est pas du 2G/3G ni le mode économie de données ; sinon affiche fixe |
| `medias/fauteuil-vide.jpg` + `fauteuil-occupe.jpg` | S2 | `loading=lazy`, `<picture>` AVIF/WebP/JPG |
| `medias/telephone.jpg` | S4 | lazy |
| `medias/mains-tresses.jpg` | S5 | lazy |
| `medias/gerante.jpg` | S7 | lazy |
| `video/boucle.mp4` | S9 | chargée seulement quand S9 approche (IntersectionObserver, marge de 50 %), et seulement en 4G |

Déclare tous ces chemins dans `donnees.js` (champ vide = média absent). **Chaque section doit avoir une version sans média, soignée** : fond typographique, grain et formes SVG dans la palette. Aucun cadre vide, aucune erreur 404 dans la console.

---

## 6. Critères d'acceptation (à vérifier avant chaque push)

- [ ] `npm run build` passe, et le pré-rendu contient tout le texte de la page.
- [ ] Console sans erreur, sur bureau comme sur mobile, avec et sans les médias.
- [ ] Lighthouse mobile : Performance ≥ 85, Accessibilité ≥ 95, CLS < 0,05, LCP < 2,5 s.
- [ ] JavaScript initial < 200 Ko en gzip.
- [ ] `prefers-reduced-motion: reduce` donne une page statique complète : pas d'épinglage, pas de vidéo au scroll.
- [ ] À 375 px de large : pas de défilement horizontal ; boutons ≥ 44 px ; barre fixe visible après le héros.
- [ ] Clavier : tout est atteignable, focus visible en magenta, et la démo S4 se joue au clavier.
- [ ] Les chiffres du héros, du calculateur, des tarifs et du tableau de bord proviennent tous de `donnees.js` et concordent (43 créneaux · 215 000 F · 14,3×).
- [ ] Aucun faux témoignage ni aucune preuve inventée.
- [ ] Le bouton WhatsApp ouvre `wa.me/2250546009666` avec le message de l'offre choisie.

---

## 7. Plan de commits

1. `donnees` : chemins des médias, textes des nouvelles sections et FAQ vérifiée dans `belya-app`.
2. Système de mouvement : utilitaires `reveler`, `parallaxe`, `compteur` et `basculerFond`, plus SplitText.
3. S1 : versions mobile et bureau, textes WhatsApp et prix.
4. S2 : le créneau vide (rideau).
5. S4 : la démo WhatsApp interactive.
6. S5 : fusion des trois mécaniques et scroll horizontal.
7. S6 et S7 : tableau de bord, tarifs et garantie.
8. S8 et S9, barre mobile, navbar et indicateur de progression.
9. Post-traitement des médias (ffmpeg / sharp, voir `PROMPTS-HIGGSFIELD.md`), nouvelle `og.jpg`.
10. Passage sur les critères d'acceptation, puis push de la branche.

---

## 8. À ne pas faire

- Pas d'écran de préchargement (« loader ») : il retarde tout, et la gérante en 4G part avant la fin.
- Pas de curseur personnalisé, de 3D lourde (three.js) ni de son automatique.
- Pas de texte généré dans les images : toute interface est en HTML.
- Pas de nouvelle couleur, pas de dégradé arc-en-ciel, pas de glassmorphism partout (seulement la navbar).
- Ne pas modifier `main`, `vercel.json` ni les pages légales.
