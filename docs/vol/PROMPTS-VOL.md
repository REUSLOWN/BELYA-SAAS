# Le vol : prompts et méthode de génération (Higgsfield)

Ce fichier va avec `HISTOIRE-VISUELLE.md` (le parcours) et `scripts/vol.mjs` (inspection, assemblage, préparation).

## Avant de générer

1. **Lire le schéma du modèle en direct.** Vérifier, sans jamais le supposer :
   - la durée maximale d'un extrait ;
   - les formats d'image et la résolution ;
   - les rôles de référence (`start_image`, `reference_video`, image de référence) ;
   - le mode d'extension (`video_extension`, `extension_mode: forward`).

   **Si la durée maximale est inférieure à 15 s :** découper en 4 ou 5 segments en gardant les mêmes temps, répartis sur le même parcours.
2. **Relever le solde de crédits avant chaque travail, et après.** Une extension consomme davantage que l'estimation, parce qu'elle retraite l'extrait d'entrée. Noter le coût réel dans `PRODUCTION.md`.
3. **Ne rien acheter et ne modifier aucun réglage du compte.** Générer ne donne pas cette autorisation.
4. **Refuser les préréglages proposés par la plateforme** s'ils ne collent pas au brief. Envoyer le prompt tel quel.
5. **Garder chaque identifiant de travail.** Un travail en attente n'est pas un échec : on le récupère, on ne le relance pas.

## Règles d'écriture (dans chaque prompt vidéo)

- **Ne jamais écrire** *drone*, *quadcopter* ni *UAV*. Sinon, le modèle dessine un drone dans le plan. On décrit la caméra.
- Indiquer que tout est immobile, sauf ce qui est décrit.
- Chronométrer chaque manœuvre et dire ce qu'on voit par l'ouverture suivante.
- Pas de texte, pas de logo, pas d'enseigne. Voitures et produits sans badge.
- Garder l'action clé entre 40 % et 65 % de la largeur, et le tiers gauche calme : le site y pose le texte, et le téléphone recadre au centre.

### Bloc commun (à coller à la fin de chaque prompt vidéo)

```
One single continuous first-person camera move, no cuts, no teleporting; the camera itself is flying smoothly like an expert FPV pilot, with natural banking, gentle drift and speed changes; nothing flying or hovering is ever visible in frame. Every person, vehicle and object is stationary unless described; nothing appears, disappears or changes. Warm natural afternoon light, soft window light, 35mm film look, Kodak Portra tones, real skin texture, gentle haze. A premium hair salon in Riviera, Abidjan, Côte d'Ivoire: warm cream plaster walls (#FAF6F4), terrazzo floor, deep magenta (#C2185B) towels and aprons, aubergine (#2B1B2E) velvet chairs, brass details, green plants. Key action stays between 40% and 65% of frame width; the left third stays calm. No text, no logos, no brand badges, no signage lettering.
```

### Négatif (si le champ existe)

```
drone, quadcopter, flying device, text, letters, logo, watermark, signage, brand badge, extra fingers, fused fingers, deformed hands, plastic skin, duplicate people, people popping in, cars appearing, sudden cut, jump cut, teleport, fisheye distortion, neon, oversaturated
```

---

## Étape 1 : les images de départ (3 propositions)

Format 16:9, 1920×1080 ou plus. **Les trois montrent le même bâtiment, sous trois angles d'approche.** On en garde une, qui devient la première image exacte du film.

**Départ A (de face, axial)**
```
Eye-level photograph standing in the gated front courtyard of a converted single-storey villa that is now a premium hair salon in Riviera, Abidjan, early afternoon. Warm cream plaster facade, slim magenta-painted steel window frames, a wide glass double door standing fully open in the center-right of the frame, revealing a glimpse of a bright salon interior with aubergine velvet chairs and brass mirrors. Bougainvillea spilling over the courtyard wall, a potted palm, an unbadged parked scooter on the right, terrazzo steps. The left third of the frame is a calm cream wall in soft shadow. No text, no signage, no logos. 35mm film look, Kodak Portra tones, warm natural light.
```

**Départ B (en diagonale)** : même prompt, en remplaçant le début par *« Eye-level photograph taken from the left corner of the front courtyard, at a 30-degree angle to the facade… »*

**Départ C (plus bas, plus proche)** : même prompt, en remplaçant le début par *« Low eye-level photograph, closer to the entrance, the open glass double door filling the center of the frame… »*

**Critères de choix :**
- la porte est bien ouverte et on lit l'intérieur à travers ;
- le tiers gauche est calme ;
- les matériaux sont crédibles ;
- aucune lettre visible.

## Étape 2 : l'image de révélation (à partir du départ choisi)

Mettre l'image de départ choisie en **référence d'image**, pour garder les mêmes matériaux, les mêmes cadres de fenêtre et la même échelle.

```
High aerial photograph, about 40 meters up, looking back down at the REAR of the same single-storey cream plaster salon building with magenta steel frames: the rear door standing open onto a small sunlit back courtyard with a mango tree and a laundry line of magenta towels, the whole flat roof, and beyond the building its gated front courtyard opening onto a quiet residential street with a few unbadged parked cars, then a busy four-lane boulevard with moving traffic, neighbouring villas with red-tile and flat roofs, lush trees, and the Ébrié lagoon and the Plateau skyline faint on the horizon. Same architecture, materials and scale as the reference. Afternoon light, 35mm film look. No text, no logos, no signage.
```

Cette image est la cible de la dernière seconde du film.

---

## Étape 3 : trois extraits chaînés en une seule prise

### Extrait A : image → vidéo (Seedance 2.5 `omni_reference`, ou l'équivalent disponible)

`start_image` = l'image de départ choisie, 16:9, 15 s.

```
0–2s: the camera starts exactly on this frame at eye level and moves slowly forward across the front courtyard, drifting slightly right.
2–4.5s: banks left in a wide arc around the parked scooter so its full side profile passes on the right, then straightens and lines up with the open glass double door.
4.5–6s: speeds up a little and glides through the open doorway into the salon; through the door we see the bright salon floor.
6–9s: inside, slows down and sweeps right along a row of three styling stations: at the first, a hairstylist in a magenta apron braids long knotless braids on a seated client; at the second, a client sits under a hood dryer.
9–12.5s: makes a gentle S-curve around a round central pillar wrapped in a mirror, then yaws left to look across the room at the third station: an EMPTY aubergine velvet salon chair with a folded magenta towel on the armrest; the camera slows almost to a stop facing the empty chair, centered in frame.
12.5–15s: drifts past the empty chair and turns right toward the back wall, where a doorway is closed by a magenta fabric curtain.
[BLOC COMMUN]
```

### Extrait B : extension vers l'avant (`video_extension`, `extension_mode: forward`)

`reference_video` = l'extrait A, ou sa version rognée et propre. 15 s.

```
Continue the exact same shot from its last frame, same camera, same light, same speed.
0–2s: a hairstylist in a magenta apron pulls the magenta curtain aside and the camera passes right beside her through the doorway into the back room.
2–5s: the back room has two black shampoo basins; the camera arcs around the basin where a client lies back while a stylist rinses her braids.
5–7s: dips down close to the stylist's hands rinsing the braids, fingers anatomically correct, water glistening, then rises again.
7–9s: curves past open wooden shelving with plain unlabelled bottles and neatly folded magenta towels.
9–11s: turns left through a narrow side door into a storage corridor lined with metal racks of braiding hair packs in plain kraft paper and plain boxes.
11–13.5s: snakes along the aisle, slightly faster, and turns at the end of the rack.
13.5–15s: turns left around the corner; ahead, the rear door stands open onto a sunlit back courtyard with a laundry line of magenta towels and a mango tree — the back yard, not the street.
[BLOC COMMUN]
```

### Extrait C : extension de B, avec l'image de révélation en référence. 12 s.

```
Continue the exact same shot from its last frame, same camera, same light.
0–4s: flies out through the open rear door into the back courtyard, keeps moving forward past the laundry line of magenta towels, rising slightly to about two meters.
4–6s: while still drifting, smoothly yaws 180 degrees to face back toward the salon: the rear door, the cream plaster back wall and magenta steel frames of the building we just left.
6–12s: flies backwards and climbs steadily, revealing the whole salon from above: its back courtyard, flat roof, the front courtyard opening onto a residential street with a few unbadged parked cars, a busy boulevard with moving traffic, neighbouring villas and trees, the lagoon faint on the horizon; ends matching the reference aerial image, then settles gently.
[BLOC COMMUN]
```

> Si l'image de révélation ne peut pas être une référence dans le mode extension, décrire sa composition dans le prompt, sans changer le reste.

---

## Étape 4 : inspecter chaque extrait avant le suivant

```bash
npm run vol -- inspecter medias-bruts/vol-a.mp4
```

Le résultat atterrit dans `medias-bruts/inspection/vol-a/` :
- la planche-contact ;
- les coupes détectées ;
- la première et la dernière image ;
- un zoom image par image sur les 2 dernières secondes.

**À regarder :**
- un drone ou un objet qui vole ;
- une voiture ou une personne qui apparaît ;
- un logo ;
- un saut de position, d'échelle ou de lumière ;
- les mains ;
- la vue par chaque porte (côté cour, jamais la façade).

Comparer la dernière image de A avec la première de B.

## Réparer au lieu de tout régénérer

- **Rogner sur des images propres.** Si un défaut arrive tard, couper avant :
  ```bash
  ffmpeg -i vol-a.mp4 -t 13.4 -c copy vol-a-propre.mp4
  ```
  Téléverser ensuite la version rognée (`media_upload`, PUT, `media_confirm`) et étendre depuis elle.
- **Effacer un petit défaut.** Isoler le passage et lancer une édition vidéo par texte, par exemple :
  > remove the small flying object from every frame; keep everything else identical

  Puis le recoller. L'édition peut baisser la résolution : le noter. Ne pas demander d'effacer des logos (souvent bloqué par les filtres).
- **Étendre depuis une fin propre** quand seul le début est réparé.
- **Pas de boucle de régénération ouverte.** On garde ce qui est bon.

## Étape 5 : assembler, puis préparer pour le site

```bash
# collure franche entre extensions ; « --fondu 2 » = fondu de 0,125 s avant le segment 2 (morceau réparé)
npm run vol -- assembler medias-bruts/vol-a.mp4 medias-bruts/vol-b.mp4 medias-bruts/vol-c.mp4
npm run vol -- preparer --fps 15
npm run build && npm run verifier
```

**Ce que fait `preparer` :**
- Il écrit `public/vol/<version>/…` (bureau 1280 px, portrait 540×960) et `src/vol/manifeste.json`.
- Dès que le manifeste compte des images, le vol remplace le héros.
- Il affiche le poids total : viser **25 Mo au plus** au bureau. Au-delà, baisser `--fps` à 12.
