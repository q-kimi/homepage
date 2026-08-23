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
npm run build     # build de production dans dist/
npm run preview   # sert le build de production localement
```

Le serveur de dev tourne sur `http://localhost:5173` par défaut.

## Structure du projet

```
homepage/
├── index.html          # Structure de la page
├── vite.config.js       # Configuration Vite
├── css/
│   └── style.css        # Styles
└── js/
    ├── main.js           # Point d'entrée, importe les modules dans l'ordre
    ├── engines.js        # Sélecteur de moteur de recherche + soumission du formulaire
    ├── placeholder.js     # Effet machine à écrire du placeholder
    ├── greeting.js        # Message de salutation
    ├── avatar.js           # Gestion de l'avatar de profil
    ├── settings.js         # Modale de paramètres (pseudo + avatar)
    └── voice.js            # Dictée vocale (Web Speech API)
```

## Licence

Distribué sous licence [MIT](LICENSE).
