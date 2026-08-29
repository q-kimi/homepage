# Homepage

Une page d'accueil personnelle (nouvel onglet) minimaliste, inspirée de Google : barre de recherche multi-moteurs, salutation personnalisée, raccourcis, dictée vocale et avatar — le tout en HTML/CSS/JS, servi via [Vite](https://vitejs.dev).

## Fonctionnalités

- **Recherche multi-moteurs** : Google, Bing, DuckDuckGo, Yahoo, Brave, Ecosia, Qwant (choix mémorisé).
- **Placeholder animé** façon machine à écrire.
- **Salutation dynamique** (Bonjour / Bonsoir selon l'heure) avec pseudo personnalisable.
- **Avatar** de profil (stocké localement dans le navigateur).
- **Raccourcis** vers des sites fréquents.
- **Dictée vocale** via la Web Speech API (quand le navigateur la supporte).
- **Aucune donnée envoyée à un serveur** : tout est stocké dans le `localStorage` du navigateur.

## Utilisation

```bash
npm install
npm run dev       # serveur de dev Vite avec rechargement à chaud
```

Le serveur de dev tourne sur `http://localhost:5173` par défaut. Il n'y a pas d'étape de build : le site est du HTML/CSS/JS pur, servi tel quel en production (voir Déploiement ci-dessous).

## Structure du projet

```
homepage/
├── index.html          # Structure de la page
├── vite.config.js       # Configuration Vite (dev uniquement)
├── Dockerfile            # Image Nginx qui sert les fichiers tels quels
├── nginx.conf            # Config Nginx (gzip, cache)
├── .dockerignore
└── public/
    ├── favicon.svg
    ├── css/
    │   └── style.css    # Styles
    └── js/
        ├── main.js       # Point d'entrée, importe les modules dans l'ordre
        ├── engines.js     # Sélecteur de moteur de recherche + soumission du formulaire
        ├── autocomplete.js # Suggestions basées sur l'historique de recherche
        ├── placeholder.js  # Effet machine à écrire du placeholder
        ├── greeting.js     # Message de salutation
        ├── avatar.js        # Gestion de l'avatar de profil
        ├── shortcuts.js      # Raccourcis (ajout/édition/suppression/glisser-déposer)
        ├── settings.js        # Modale de paramètres
        └── voice.js            # Dictée vocale (Web Speech API)
```

## Déploiement (Docker / Dokploy)

Le `Dockerfile` copie `index.html` et `public/` directement dans l'image Nginx — aucun build, aucun Node dans l'image finale. C'est volontaire : un build Vite renommerait `main.js`/`style.css` avec un hash à chaque déploiement, et un onglet ouvert au moment du redéploiement se retrouverait à demander les anciens fichiers hashés, qui n'existent plus → page sans style. En servant des noms de fichiers stables, ce risque disparaît.

```bash
docker build -t homepage .
docker run -p 8080:80 homepage
```

Sur **Dokploy** : créer une application de type *Dockerfile* pointant sur ce repo, port interne **80** — aucune autre configuration nécessaire.

## Licence

Distribué sous licence [MIT](LICENSE).
