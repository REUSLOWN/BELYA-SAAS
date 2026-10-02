# Le vol : note de production

## État au 2 octobre 2026

| Élément | État |
|---|---|
| Histoire visuelle, parcours, plan de défilement | ✅ `docs/vol/HISTOIRE-VISUELLE.md` |
| Planche de style | ✅ publiée en artefact (« Planche de style Belya ») ; mêmes jetons que `tailwind.config.js` |
| Logo | ✅ celui du site, inchangé (logotype « Belya. » et icône `public/favicon.svg`). Rien n'a été redessiné ni régénéré. |
| Moteur du site (canvas épinglé, partition, chargeur, mode calme) | ✅ branche `vol-fpv` |
| Prompts Higgsfield | ✅ `docs/vol/PROMPTS-VOL.md` |
| Images de départ, image de révélation, extraits A/B/C, master | ⏳ **non générés** : le connecteur Higgsfield n'était pas connecté (« connexion incomplète ») |
| Identifiants de travaux Higgsfield | aucun |
| Crédits consommés | 0 |

## Direction retenue

- On garde l'identité existante : crème, encre, aubergine et magenta, avec le titre en Plus Jakarta Sans et le mot dramatique en Cormorant italique.
- Le film est documentaire et chaud, sans aucun texte dans l'image.
- Le salon est **fictif** et la page le dit (« Salon fictif · images de synthèse »).
- Aucun témoignage, client, chiffre de pilote ni adresse n'a été inventé. Les chiffres du chapitre 01 sont ceux du héros actuel (`HERO` dans `donnees.js`).

## Fichiers

| Fichier | Rôle |
|---|---|
| `src/vol.js` | **le fichier à modifier** : chapitres (textes, boutons), battements (vh, secondes du film), mention, seuil portrait |
| `src/vol/manifeste.json` | écrit par `npm run vol -- preparer`, jamais à la main. `images: 0` signifie que le héros typographique reste en place |
| `src/components/VolSalon.jsx` | la section : scène sticky, canvas, chapitres en HTML, mode calme |
| `src/lib/sequence.js` | chargement borné des images, partition, opacités |
| `scripts/vol.mjs` | `inspecter`, `assembler`, `preparer` |
| `scripts/verifier.mjs` | section 11 : continuité des battements, images et affiches servies |

## Comportement

- **Choix du mode** : le pré-rendu sert le **mode calme** (cinq chapitres l'un sous l'autre, chacun sur une image fixe). Le vol s'active ensuite, sauf dans trois cas : `prefers-reduced-motion`, une connexion 2g/3g ou en économie de données, ou un appareil à moins de 2 Go de mémoire.
- **Chargement** :
  - 6 requêtes au plus en parallèle ;
  - priorité à l'image visée, puis 30 images devant et 8 derrière dans le sens du défilement, puis une image sur 8 sur toute la longueur ;
  - les requêtes dépassées sont annulées ;
  - 2 nouvelles tentatives par image ;
  - 24 images décodées au plus au bureau, 16 sur téléphone : les autres sont libérées avec `close()`, les fichiers compressés restent en cache ;
  - en attendant, on peint l'image la plus proche, et l'affiche s'affiche avant la première image.
- **Pas de détournement du défilement** : défilement natif dans les deux sens, lien « Passer la visite » en premier au clavier, chapitres masqués `inert`.
- **Navigation** : elle prend son fond crème dès le départ au-dessus du film. La barre fixe mobile n'apparaît qu'après le vol.

## Vérifications faites

Faites avec une **séquence de test synthétique**, des mires étiquetées « MAQUETTE DE RYTHME » qui ne sont pas versionnées. On a vérifié la mécanique, pas le film.

**Avec Playwright (Chromium), au bureau 1440×900 et sur téléphone 390×844 :**
- les 12 battements atteignent leur image prévue (à ±1), réellement peinte ;
- un seul chapitre est lisible par battement, et aucun pendant les transitions ;
- la tenue finale fonctionne ;
- le retour brutal en haut ramène l'image 0 et le titre ;
- « Passer la visite » arrive sur la section suivante (écart 0 px) ;
- une seule piste est téléchargée (bureau ou portrait), avec annulation des requêtes dépassées ;
- pas de défilement horizontal ;
- pas d'erreur de console (hors Google Fonts et l'audience Vercel, bloqués dans le bac à sable).

**Mode « mouvement réduit »** : 5 chapitres sur images fixes, sans erreur.

**Build et vérification** : `npm run build` et `npm run verifier` passent, avec et sans images de vol.

**Défilement réel à la molette** : un enregistrement (`maquette-rythme.mp4`) montre l'enchaînement.

## Pas encore vérifié

- Le rendu, le rythme et le poids **avec le vrai film**. La maquette pèse 23 Ko par image au bureau ; un vrai film en pèsera probablement 40 à 60, soit 25 à 38 Mo pour 628 images. À mesurer avec `preparer`, puis baisser à 12 i/s si besoin.
- Safari iOS et Android réels (seul Chromium a été testé).
- Lighthouse.
