<p align="center">
  <img src="public/logo.svg" width="72" alt="">
</p>

<h1 align="center">Homepage</h1>
<p align="center"><i>Un nouvel onglet qui m'appartient.</i></p>

<p align="center">
  <a href="https://homepage.qkimi.fr/"><strong>homepage.qkimi.fr →</strong></a>
</p>

---

Remplace la page "Nouvel onglet" du navigateur par une page de recherche minimaliste, pensée pour un usage perso : recherche multi-moteurs, raccourcis, dictée vocale, accès rapide à une IA. HTML/CSS/JS pur, sans framework, sans backend. Rien n'est envoyé à un serveur, tout vit dans le `localStorage` du navigateur.

## Ce qu'elle fait

| | |
|---|---|
| **Recherche** | Google, Bing, Brave, ChatGPT, Grok, Claude, Mistral AI ou HuggingChat au choix, mémorisé. Suggestions tirées de l'historique, placeholder animé façon machine à écrire. |
| **Raccourcis** | Ajout, édition, suppression, icônes personnalisées, glisser-déposer pour réordonner ou ranger dans un dossier. Pagination automatique passé 7 raccourcis. |
| **IA** | Accès direct à Claude, ChatGPT, Grok, Copilot, Gemini, Mistral AI ou HuggingChat, au choix. |
| **Voix** | Dictée vocale via la Web Speech API, quand le navigateur la supporte. |
| **Accueil** | Salutation selon l'heure : Bonjour, Bon après-midi, Bonsoir ou Bonne nuit. |
| **Sauvegarde** | Export/import de toute la config (raccourcis, moteur, historique...) en fichier JSON, depuis les paramètres. |

## Lancer en local

```bash
npm install
npm run dev
```

Serveur Vite avec rechargement à chaud sur `http://localhost:5173`. Pas d'étape de build : le site est servi tel quel, en dev comme en prod.

## Structure

```
homepage/
├── index.html            structure de la page
├── vite.config.js        config Vite (dev uniquement)
├── Dockerfile             image Nginx qui sert les fichiers tels quels
├── nginx.conf              config Nginx (gzip, cache)
└── public/
    ├── favicon.svg
    ├── logo.svg
    ├── css/
    │   ├── base.css          variables, reset, layout
    │   ├── hero.css           salutation d'accueil
    │   ├── search.css          champ de recherche, suggestions, toolbar
    │   ├── shortcuts.css        raccourcis
    │   ├── settings.css          bouton + modale Paramètres
    │   ├── history.css            bouton + modale Historique
    │   ├── reduced-motion.css      respect de prefers-reduced-motion
    │   └── responsive.css           breakpoints tablette/mobile (chargé en dernier)
    └── js/
        ├── main.js         point d'entrée
        ├── dom-utils.js     helpers partagés
        ├── engines.js        moteur de recherche
        ├── autocomplete.js    suggestions
        ├── placeholder.js      machine à écrire
        ├── phrases.js            salutation d'accueil
        ├── shortcuts.js           raccourcis
        ├── ai-icons.js              icônes des assistants IA
        ├── ai-picker.js            sélecteur d'IA
        ├── settings.js              paramètres
        ├── voice.js                  dictée vocale
        ├── backup.js                  export/import de la config
        ├── commands.js                 commandes / (données)
        ├── commands-editor.js           commandes / (éditeur)
        ├── history.js                    historique (données)
        └── history-panel.js               historique (panneau)
```

## Déploiement

Le `Dockerfile` copie `index.html` et `public/` directement dans l'image Nginx : pas de build, pas de Node dans l'image finale. C'est volontaire, un build Vite renommerait les fichiers avec un hash à chaque déploiement, et un onglet resté ouvert pendant un redéploiement finirait par demander d'anciens fichiers qui n'existent plus. Des noms stables évitent le problème.

```bash
docker build -t homepage .
docker run -p 8080:80 homepage
```

Sur Dokploy : application de type *Dockerfile*, port interne `80`, rien d'autre à configurer.

## Licence

[MIT](LICENSE)
