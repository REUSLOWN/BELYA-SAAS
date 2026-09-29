# Belya : prompts Higgsfield

Ce fichier sert à produire les médias de la refonte « premium ».
Chaque média porte un nom de fichier exact : dépose-le à cet endroit et la page le prend en compte.

## Méthode (à lire avant de générer)

1. **Image d'abord, vidéo ensuite.** Pour chaque vidéo, commence par générer l'image clé avec le modèle image (par exemple Soul). Choisis la meilleure, puis anime-la en « image → vidéo » (Kling, Veo ou Seedance, selon ce que ton abonnement propose). Tu obtiens des visages, une lumière et un décor cohérents. En passant directement du texte à la vidéo, le résultat est beaucoup moins prévisible.
2. **Une seule coiffeuse et une seule gérante pour tout le site.** Crée-les une fois, puis réutilise-les comme référence de personnage (fonction de personnage ou d'image de référence) dans toutes les générations suivantes.
3. **Prompts en anglais.** Les modèles les suivent mieux. Garde la « bible de style » à la fin de chaque prompt, sans la modifier.
4. **Aucun texte à l'image.** Les écrans de téléphone restent noirs : la page affiche par-dessus une vraie conversation WhatsApp en HTML, nette, traduisible et sans les lettres déformées typiques de l'IA.
5. **Contrôle avant de garder un média.** Vérifie :
   - les mains : 5 doigts, pas de doigts fondus ;
   - les tresses : régulières, sans fusion ;
   - l'absence de lettres ou de logos parasites ;
   - la peau : texture réelle, pas de peau « plastique » ;
   - les visages : pas de visage dupliqué dans le décor.

   Refais la génération au moindre doute. C'est ce contrôle qui distingue un site premium de l'« AI slop ».

> **Alternative encore plus forte :** filme le vrai geste dans un de tes salons pilotes, au smartphone, en 4K et en 60 images/s, sur un trépied, pendant 10 secondes. Un vrai salon d'Abidjan donne une authenticité qu'aucun modèle n'égale, et ça devient une preuve. Les consignes de cadrage ci-dessous restent valables.

---

## Bible de style (à coller à la fin de CHAQUE prompt)

```
Documentary editorial photography, shot on 35mm film, Kodak Portra 400 tones, soft natural window light coming from the right, gentle haze, real skin texture with visible pores, no retouching, shallow depth of field, a modern upscale hair salon in Abidjan, Côte d'Ivoire, warm cream plaster walls (#FAF6F4), subtle accents of deep magenta (#C2185B) and dark aubergine (#2B1B2E) in towels, aprons and chair upholstery, brass details, green plants, calm, quiet luxury, authentic, unposed.
```

## Négatif (à coller dans le champ « negative prompt » s'il existe, sinon à la fin après « Avoid: »)

```
text, letters, words, logo, watermark, signage, extra fingers, fused fingers, deformed hands, plastic skin, airbrushed skin, oversaturated colors, HDR look, neon lights, stock photo smile at camera, western salon decor, blurry face, duplicate people, distorted braids
```

---

## 1. Vidéo du héros (le plus important)

**Fichiers :**
- `public/video/salon.mp4` (vidéo)
- `public/video/salon-affiche.jpg` (image d'affiche, tirée de la vidéo, voir le post-traitement)

**Format :** 16:9, 1920×1080, 8 secondes, sans son, plan continu sans coupe.

**Cadrage :** le sujet sur le **tiers droit**. Le **tiers gauche** reste calme (mur crème, flou) : c'est là que se pose le titre. La dernière image doit être calme, car la page enchaîne dessus.

### Étape A : image clé (modèle image, 16:9)

```
Wide medium shot inside an elegant hair salon in Abidjan. On the right third of the frame, an Ivorian hairstylist in her early 30s, wearing a deep magenta apron, is braiding long knotless box braids on a seated client. The client, a young Ivorian woman, sits in an aubergine velvet salon chair, relaxed, a smartphone resting face-down on her lap. The left third of the frame is a calm, softly out-of-focus cream plaster wall with a single brass wall lamp and the edge of a large round mirror — nothing busy. Late afternoon golden light from a tall window on the right. Hair products and neatly folded magenta towels on a wooden shelf in the background. Camera at chest height, 35mm lens. [BIBLE DE STYLE]
```

### Étape B : animation (image → vidéo, 8 s)

```
Very slow cinematic dolly-in toward the hairstylist, locked horizon, no cuts, no zoom jumps. The stylist's hands move precisely and continuously, twisting and sliding a braid down, fingers clearly visible and anatomically correct. The client breathes calmly and glances down at the phone on her lap once, then back up. Dust particles float gently in the window light. Subtle, realistic motion only. The left third of the frame stays calm and uncluttered for the whole shot. [BIBLE DE STYLE]
```

Réglages conseillés : mouvement faible à moyen et caméra « dolly in » lent (ou « static » si le modèle part trop vite). Génère 4 variantes et garde celle dont les mains sont parfaites.

---

## 2. Vidéo du héros, version téléphone

**Fichier :** `public/video/salon-mobile.mp4`

**Format :** 9:16, 1080×1920, 6 secondes, sans son. Le tiers **haut** reste calme pour le titre ; le sujet occupe les deux tiers bas.

Reprends le prompt de l'étape A en remplaçant la phrase de cadrage par :

```
Vertical 9:16 frame. The hairstylist and client occupy the lower two thirds of the frame; the upper third is a calm, softly out-of-focus cream wall with a brass wall lamp.
```

Puis anime-le avec le prompt de l'étape B, avec un mouvement encore plus lent.

---

## 3. et 4. Le créneau vide, puis rempli (paire avant / après)

**Fichiers :**
- `public/medias/fauteuil-vide.jpg`
- `public/medias/fauteuil-occupe.jpg`

**Format :** 3:2, 2400×1600. **Même cadrage exact** pour les deux images : la page fait glisser l'une sur l'autre au défilement.

### 3. Fauteuil vide

```
Static eye-level shot of a single empty aubergine velvet salon chair facing a large round mirror in an elegant Abidjan hair salon, Saturday 2 pm, soft afternoon light, a folded magenta towel waiting on the armrest, a tray of braiding tools neatly prepared on a side table, nobody in the frame, a quiet feeling of absence and waiting. Centered composition, 50mm lens. [BIBLE DE STYLE]
```

### 4. Même fauteuil, occupé

Pars de l'image 3 avec la fonction de modification (inpainting ou modification à partir d'une référence), pour garder **exactement** le même cadre :

```
Same exact frame, same camera, same light. Now the chair is occupied: a young Ivorian woman is seated, smiling softly at her reflection, while the same hairstylist in a magenta apron stands behind her starting cornrows. Warm, lively, the moment a lost slot becomes a sold slot. [BIBLE DE STYLE]
```

---

## 5. Le téléphone (support de la démo WhatsApp)

**Fichier :** `public/medias/telephone.jpg`

**Format :** 4:5, 1600×2000.

```
Close-up of a young Ivorian woman's hand holding a modern black smartphone upright, screen facing the camera straight-on and perfectly frontal, the screen completely black and blank, sitting in a salon waiting area, blurred cream and magenta background, manicured natural nails, a thin gold bracelet. The phone occupies the center of the frame, vertical, no tilt. [BIBLE DE STYLE]
```

> L'écran doit être **noir et parfaitement de face** : c'est la condition pour que la conversation HTML s'y superpose au pixel près.

---

## 6. La gérante

**Fichier :** `public/medias/gerante.jpg`

**Format :** 4:5, 1600×2000. C'est un visuel d'illustration, **jamais présenté comme une vraie cliente** ni accompagné d'un faux témoignage.

```
Portrait of an Ivorian salon owner in her early 40s, confident and warm, standing behind the reception counter of her elegant hair salon in Abidjan, one hand resting on a closed paper appointment book, her smartphone in the other hand, looking slightly off-camera with a calm, satisfied expression. She wears an elegant aubergine top and a subtle wax-print headwrap with magenta tones. Clients and stylists softly blurred in the background. 85mm lens. [BIBLE DE STYLE]
```

---

## 7. Les mains (bandeau de parallaxe)

**Fichier :** `public/medias/mains-tresses.jpg`

**Format :** 21:9, 2520×1080.

```
Extreme close-up macro shot of a hairstylist's hands braiding long knotless braids, fingers precise and anatomically correct, individual hair strands in sharp focus, a hint of magenta apron fabric at the edge, warm window light raking across the texture, very shallow depth of field. [BIBLE DE STYLE]
```

---

## 8. Boucle de fond pour l'appel final

**Fichier :** `public/video/boucle.mp4`

**Format :** 16:9, 5 secondes, **en boucle** (la première et la dernière image doivent être proches), 1,5 Mo au maximum.

Pars de l'image 7 et anime-la avec :

```
Seamless loop. The hands keep braiding in a slow, hypnotic rhythm, light shifts subtly, camera completely static. Very gentle motion, loopable, first and last frame nearly identical. [BIBLE DE STYLE]
```

---

## Post-traitement (à faire faire par ton agent)

Donne à ton agent les fichiers bruts téléchargés de Higgsfield (dans `medias-bruts/`, **hors** de `public/`). Il lance les commandes suivantes avec ffmpeg. Si ffmpeg n'est pas installé, il l'installe avec `winget install ffmpeg`.

```bash
# Vidéo du héros, bureau. Chaque image est une image-clé (-g 1) :
# c'est ce qui rend le défilement image par image fluide.
ffmpeg -i medias-bruts/salon.mp4 -an -vf "scale=1600:-2,fps=30" -c:v libx264 -preset slow -crf 27 -g 1 -pix_fmt yuv420p -movflags +faststart public/video/salon.mp4

# Affiche = première image de la vidéo (s'affiche tout de suite, avant la vidéo)
ffmpeg -i public/video/salon.mp4 -frames:v 1 -q:v 3 public/video/salon-affiche.jpg

# Version téléphone : lue normalement, pas au défilement
ffmpeg -i medias-bruts/salon-mobile.mp4 -an -vf "scale=720:-2,fps=30" -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart public/video/salon-mobile.mp4

# Boucle de l'appel final
ffmpeg -i medias-bruts/boucle.mp4 -an -vf "scale=1280:-2,fps=24" -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -movflags +faststart public/video/boucle.mp4
```

Pour les images, l'agent produit des versions AVIF et WebP (avec `sharp`), en visant 250 Ko au maximum par image.

| Fichier | Poids maximal |
|---|---|
| salon.mp4 | 6 Mo |
| salon-affiche.jpg | 180 Ko |
| salon-mobile.mp4 | 2,5 Mo |
| boucle.mp4 | 1,5 Mo |
| chaque image | 250 Ko |
