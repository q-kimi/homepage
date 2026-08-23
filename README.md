# Homepage

Une page d'accueil personnelle (nouvel onglet) minimaliste, inspirée de Google : barre de recherche multi-moteurs, salutation personnalisée, raccourcis, dictée vocale et avatar — le tout en HTML/CSS/JS pur, sans dépendances ni build.

## Fonctionnalités

- **Recherche multi-moteurs** : Google, Bing, DuckDuckGo, Yahoo, Brave, Ecosia, Qwant (choix mémorisé).
- **Placeholder animé** façon machine à écrire.
- **Salutation dynamique** (Bonjour / Bonsoir selon l'heure) avec pseudo personnalisable.
- **Avatar** de profil (stocké localement dans le navigateur).
- **Raccourcis** vers des sites fréquents.
- **Dictée vocale** via la Web Speech API (quand le navigateur la supporte).
- **Aucune donnée envoyée à un serveur** : tout est stocké dans le `localStorage` du navigateur.

## Utilisation

Ouvre simplement [index.html](index.html) dans un navigateur, ou définis-le comme page de nouvel onglet (via une extension comme *New Tab URL* / *Custom New Tab*) :

```
file:///chemin/vers/homepage/index.html
```

Aucune installation ni build n'est nécessaire.

## Structure du projet

```
homepage/
├── index.html          # Structure de la page
├── css/
│   └── style.css        # Styles
└── js/
    ├── engines.js        # Sélecteur de moteur de recherche + soumission du formulaire
    ├── placeholder.js     # Effet machine à écrire du placeholder
    ├── greeting.js        # Message de salutation
    ├── avatar.js           # Gestion de l'avatar de profil
    ├── settings.js         # Modale de paramètres (pseudo + avatar)
    └── voice.js            # Dictée vocale (Web Speech API)
```

## Licence

Distribué sous licence [MIT](LICENSE).
