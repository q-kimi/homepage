<p align="center">
  <img src="public/logo.svg" width="72" alt="">
</p>

<h1 align="center">Homepage</h1>
<p align="center"><i>Un nouvel onglet qui m'appartient.</i></p>

<p align="center">
  <a href="https://homepage.qkimi.fr/"><strong>homepage.qkimi.fr →</strong></a>
</p>

---

Une page de recherche minimaliste pour remplacer le "Nouvel onglet" du navigateur. Pensée pour un usage perso : rapide, privée, sans compte ni serveur — toute la configuration vit dans le `localStorage` du navigateur, rien n'est jamais envoyé ailleurs.

## Recherche

- **9 moteurs au choix**, mémorisé entre les sessions : Google, Bing, Brave, Ecosia, ChatGPT, Grok, Claude, Mistral AI, HuggingChat.
- **Suggestions** tirées de l'historique de recherche pendant la frappe.
- **Commandes `/`** : `/yt chat` lance directement une recherche YouTube, sans passer par le moteur par défaut. Une vingtaine de commandes fournies par défaut (YouTube, Gmail, GitHub, Wikipédia, Reddit, Amazon...), toutes personnalisables.
- **Placeholder animé** façon machine à écrire.
- **Dictée vocale** via la Web Speech API, quand le navigateur la supporte.

## Raccourcis

- Ajout, édition, suppression, icônes personnalisées.
- **Dossiers** : glisse un raccourci sur un autre dossier pour l'y ranger, renomme-le (ou laisse-le sans nom), réorganise son contenu par glisser-déposer, dans un popup dédié.
- **Masquer** un raccourci ou un dossier sans le supprimer, avec une animation de chiffrement/déchiffrement façon table d'enchantement à la bascule.
- Glisser-déposer pour réordonner sur la ligne, pagination automatique passé 7 raccourcis.
- Menu contextuel (clic droit) pour modifier, ranger dans un dossier ou supprimer en un geste.

## IA

Accès direct à Claude, ChatGPT, Grok, Copilot, Gemini, Mistral AI, HuggingChat, Kimi ou Perplexity, au choix.

## Accueil

Salutation selon l'heure — Bonjour, Bon après-midi, Bonsoir, Bonne nuit — avec un prénom optionnel à la place du `{User}` par défaut.

## Historique & sauvegarde

- Historique de recherche consultable, filtrable, effaçable en un clic ou entrée par entrée.
- **Export/import** de toute la configuration (raccourcis, dossiers, moteur, historique...) en fichier JSON, pour changer d'appareil sans tout reconfigurer.

## Sous le capot

HTML/CSS/JS pur, aucun framework, aucun backend. Interface responsive (mobile / tablette / desktop), respecte `prefers-reduced-motion`, thème sombre.

## Licence

[MIT](LICENSE)
