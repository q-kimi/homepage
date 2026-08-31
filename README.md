# Homepage

Page d'accueil personnelle (nouvel onglet) minimaliste, inspirée de Google.

Barre de recherche multi-moteurs, raccourcis personnalisables, dictée vocale et accès rapide à plusieurs assistants IA, le tout en HTML/CSS/JS pur, sans framework ni backend.

**Live :** [homepage.qkimi.fr](https://homepage.qkimi.fr/)

## Fonctionnalités

- **Recherche multi-moteurs** : Google, Bing, Brave (choix mémorisé).
- **Placeholder animé** façon machine à écrire, avec suggestions basées sur l'historique de recherche.
- **Phrase d'accueil** aléatoire, renouvelée toutes les 30 minutes.
- **Raccourcis personnalisables** vers des sites fréquents : ajout, édition, suppression, réorganisation par glisser-déposer, pagination au-delà de 7.
- **Raccourcis IA** au choix : Claude, ChatGPT, Grok, Copilot, Gemini, Mistral AI, HuggingChat.
- **Dictée vocale** via la Web Speech API, quand le navigateur la supporte.
- **Aucune donnée envoyée à un serveur** : tout est stocké dans le `localStorage` du navigateur.

## Utilisation

```bash
npm install
npm run dev
```

Le serveur de dev (Vite, avec rechargement à chaud) tourne sur `http://localhost:5173` par défaut. Il n'y a pas d'étape de build : le site est du HTML/CSS/JS pur, servi tel quel en production (voir Déploiement ci-dessous).

## Structure du projet

```
homepage/
├── index.html            # Structure de la page
├── vite.config.js        # Configuration Vite (dev uniquement)
├── Dockerfile             # Image Nginx qui sert les fichiers tels quels
├── nginx.conf              # Config Nginx (gzip, cache)
├── .dockerignore
└── public/
    ├── favicon.svg
    ├── css/
    │   └── style.css      # Styles
    └── js/
        ├── main.js         # Point d'entrée, importe les modules dans l'ordre
        ├── dom-utils.js     # Helpers partagés (clic extérieur, touche Échap, lecture localStorage)
        ├── engines.js        # Sélecteur de moteur de recherche + soumission du formulaire
        ├── autocomplete.js    # Suggestions basées sur l'historique de recherche
        ├── placeholder.js      # Effet machine à écrire du placeholder
        ├── phrases.js            # Phrase d'accueil aléatoire (rotation toutes les 30 min)
        ├── shortcuts.js           # Raccourcis : ajout, édition, suppression, glisser-déposer, pagination
        ├── ai-picker.js            # Sélecteur d'assistant IA
        ├── settings.js              # Modale de paramètres
        └── voice.js                  # Dictée vocale (Web Speech API)
```

## Déploiement (Docker / Dokploy)

Le `Dockerfile` copie `index.html` et `public/` directement dans l'image Nginx, sans build, sans Node dans l'image finale. C'est volontaire : un build Vite renommerait `main.js`/`style.css` avec un hash à chaque déploiement, et un onglet ouvert au moment du redéploiement se retrouverait à demander les anciens fichiers hashés, qui n'existent plus, d'où une page sans style. En servant des noms de fichiers stables, ce risque disparaît.

```bash
docker build -t homepage .
docker run -p 8080:80 homepage
```

Sur **Dokploy** : créer une application de type *Dockerfile* pointant sur ce repo, port interne **80**, aucune autre configuration nécessaire.

## Licence

Distribué sous licence [MIT](LICENSE).
