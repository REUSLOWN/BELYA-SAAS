# Le vol à travers le salon : histoire visuelle

Un seul plan de 42 s, sans coupe, à la première personne, dans un **salon fictif** de Riviera (Abidjan). Le salon est une villa transformée, comme beaucoup de salons de la ville : une cour avant fermée, une grande porte vitrée, la salle, l'arrière-boutique avec les bacs, une réserve, puis une cour arrière.

Le parcours raconte l'argument de Belya :

1. un salon qui travaille ;
2. un fauteuil vide un samedi ;
3. le rappel de la veille ;
4. la place qui repart ;
5. le quartier entier qu'on peut servir.

## Histoire visuelle

| Scène | Histoire visuelle | Texte du site web |
|---|---|---|
| **01 — Arrivée** (0–6 s) | Approche à hauteur d'œil dans la cour avant, en début d'après-midi. Arc à gauche autour d'un scooter garé (vu de profil), puis alignement sur la grande porte vitrée ouverte. La caméra glisse à l'intérieur en accélérant un peu. | Surtitre : *Abidjan · Salons, instituts et prestataires à domicile*. Titre : *Le créneau vide est le* ***vrai coût.*** Chapô sur les 433 000 F perdus chaque mois. Boutons **Calculer ma perte** et **Voir la méthode**. Prix sous les boutons. |
| **02 — La salle** (6–15 s) | La caméra ralentit et longe trois postes : une coiffeuse tresse une cliente, une cliente est sous le casque. Courbe en S autour du pilier central habillé d'un miroir rond. Lacet à gauche vers le poste 3 : un fauteuil en velours aubergine **vide**, une serviette magenta pliée sur l'accoudoir. Presque à l'arrêt devant lui (12,5 s), puis dérive vers le rideau du fond. | *02 · La salle* — **Samedi, 14 h. Le fauteuil 3 attend.** Une cliente qui ne vient pas, c'est un poste payé, une coiffeuse qui patiente, et un créneau qu'on ne revendra plus. |
| **Transition — Le rideau** (15–17 s) | Une coiffeuse écarte le rideau magenta de l'arrière-boutique. La caméra passe juste à côté d'elle. | Pas de texte : on laisse le mouvement parler. |
| **03 — L'arrière-boutique** (17–24 s) | Deux bacs à shampoing. Arc autour du bac où une cliente est allongée. Plongée vers les mains qui rincent les tresses, puis remontée. Courbe le long des étagères de flacons sans étiquette et de serviettes pliées. | *03 · L'arrière-boutique* — **La veille, elle reçoit un rappel sur WhatsApp.** Elle confirme d'un mot, ou elle libère sa place. Bouton **Essayer la démo**. |
| **04 — La réserve** (24–30 s) | Virage à gauche par une porte latérale. La caméra serpente dans une allée étroite entre des rayonnages de mèches en emballages unis. Virage en bout de rayon, puis à gauche à l'angle : la porte arrière est ouverte sur une cour ensoleillée. | *04 · La réserve* — **La place libérée ne reste pas vide.** Elle part à la première cliente de votre liste d'attente. |
| **Transition — Sortie et demi-tour** (30–36 s) | Sortie dans la cour arrière : un fil à linge avec des serviettes magenta, un manguier, le mur du fond. La caméra continue en montant légèrement, puis pivote de 180° sans s'arrêter pour faire face à l'arrière du salon. | Pas de texte. |
| **05 — Révélation** (36–42 s) | Vol à reculons et montée régulière jusqu'à environ 40 m. Apparaissent le salon entier, sa cour avant sur une rue résidentielle avec des voitures garées sans logo, le boulevard voisin et sa circulation, les villas et les arbres alentour, la lagune au loin. Tenue sur cette vue. | *05 · Votre quartier* — **Votre salon, plein le samedi.** Belya travaille pour les salons, instituts et prestataires à domicile d'Abidjan. Boutons **Calculer ma perte** et **Écrire sur WhatsApp**. Prix. |

### Le parcours, et comment le texte s'y pose

Le parcours suit le chemin réel d'une cliente puis celui du personnel : entrée par l'avant, salle, rideau du fond, bacs, réserve, sortie par l'arrière. Le changement d'espace se fait toujours en franchissant physiquement une ouverture (porte vitrée, rideau, porte latérale, porte arrière), jamais par un saut.

**La sortie est physiquement juste.** Par la porte arrière, on voit la cour arrière, pas la façade. Pour montrer le salon qu'on vient de quitter, la caméra fait demi-tour en mouvement, puis recule et monte.

**Comment le défilement gère le texte :**
- Le premier chapitre est **visible au repos**.
- Chaque chapitre suivant apparaît en fondu sur 18 vh au début de ses battements, reste pendant les manœuvres, puis disparaît en fondu sur 18 vh.
- Les transitions n'ont aucun texte.
- Le dernier chapitre reste affiché jusqu'au bout de la tenue finale.
- Un chapitre masqué est `inert` : il ne prend ni clic ni tabulation.

## Plan de défilement

La distance de défilement est fixée indépendamment de la durée du film (dans `src/vol.js`). Total : **1 110 vh**, soit environ 11 écrans.

| Battement | Film | Défilement | Type | Ce qui entre et sort |
|---|---|---|---|---|
| arrivée-tenue | 0 s | 55 vh | tenue | le titre se lit avant tout mouvement |
| arrivée | 0 → 6 s | 120 vh | continu | le chapitre 01 reste, puis s'efface en fin d'arrivée |
| salle | 6 → 12,5 s | 150 vh | continu | le chapitre 02 entre en fondu |
| salle-tenue | 12,5 s | 45 vh | tenue | arrêt sur le fauteuil vide, le temps de lire |
| salle-fin | 12,5 → 15 s | 40 vh | continu | le chapitre 02 sort |
| rideau | 15 → 17 s | 50 vh | continu | aucun texte |
| arrière | 17 → 24 s | 170 vh | continu | chapitre 03 (le passage le plus dense : plongée, arcs) |
| réserve | 24 → 30 s | 140 vh | continu | chapitre 04 |
| sortie | 30 → 34 s | 70 vh | continu | aucun texte |
| demi-tour | 34 → 36 s | 55 vh | continu court | battement à part pour que le pivot ne se lise pas comme un saut |
| révélation | 36 → 42 s | 140 vh | continu | chapitre 05 entre |
| fin-tenue | 42 s | 75 vh | tenue | vue aérienne finale, puis la page reprend son cours |

La scène est en `position: sticky` sur `100svh`. La hauteur de la section vaut la somme des vh plus un écran, et la course épinglée active est comptée à part de la hauteur de la scène.

**Composition sur les différents écrans :**
- **Au bureau**, le texte occupe le tiers gauche, couvert par un voile sombre.
- **Sur téléphone**, on sert une séquence portrait recadrée au centre du 16:9, et le texte se place en bas. L'action clé doit donc rester entre 40 % et 65 % de la largeur, sans rien d'important sur les bords.
