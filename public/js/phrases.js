const TRIFORCE_ICON = `<svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <polygon points="12,2 7,11 17,11" fill="#FFD54F"/>
  <polygon points="2,20 12,20 7,11" fill="#FFC107"/>
  <polygon points="22,20 12,20 17,11" fill="#FFC107"/>
</svg>`;

const ZELDA_THEME_SRC = "/audio/zelda-theme.mp3";
let zeldaAudio = null;

function toggleZeldaTheme() {
  if (!zeldaAudio) {
    zeldaAudio = new Audio(ZELDA_THEME_SRC);
  }

  if (zeldaAudio.paused) {
    zeldaAudio.currentTime = 0;
    zeldaAudio.play();
  } else {
    zeldaAudio.pause();
  }
}

const MARIO_COIN_SRC = "/audio/mario-coin.mp3";
const MARIO_POWERUP_SRC = "/audio/mario-powerup.mp3";
const MARIO_POWERUP_EVERY = 10;
let marioClickCount = 0;

function playMarioSound() {
  marioClickCount += 1;
  const src = marioClickCount % MARIO_POWERUP_EVERY === 0 ? MARIO_POWERUP_SRC : MARIO_COIN_SRC;
  new Audio(src).play();
}

const PHRASES = [
  { text: "On navigue sur la toile ?", emoji: "🕸️" },
  { text: "Prêt(e) à explorer le web ?" },
  { text: "On part à l'aventure ?", emoji: "🗺️" },
  { text: "À la recherche de quoi ?", emoji: "🔎" },
  { text: "C'est pas un jeu Mario... c'est une licence !", emoji: "🍄", onClick: playMarioSound, ariaLabel: "Jouer un son Mario" },
  { text: "Zelda, c'est pas le héros... c'est la princesse !", icon: TRIFORCE_ICON, onClick: toggleZeldaTheme, ariaLabel: "Écouter le thème de Zelda" },
  { text: "Une question à poser à Internet ?" },
  { text: "Le web vous attend !" },
  { text: "On creuse un sujet ?" },
  { text: "Un mystère à percer ?", emoji: "🕵️" },
  { text: "Envie de découvrir quelque chose ?" },
  { text: "Internet n'attend que vous !" },
  { text: "Une idée derrière la tête ?", emoji: "💡" },
  { text: "Une petite recherche s'impose ?" },
  { text: "Attention à l'empreinte carbone", emoji: "🌻" },
  { text: "Qui accepte les cookies ?", emoji: "🍪" },
  { text: "Moins de clics, plus de résultats." },
  { text: "Chaque jour est une nouvelle opportunité de créer." },
  { text: "Fais de cet endroit ton moteur quotidien :)" },
  { text: "Prêt(e) à transformer tes idées en réalité ?" },
];

const PHRASE_INDEX_KEY = "homepage.phraseIndex";
const PHRASE_TIME_KEY = "homepage.phraseTimestamp";
const ROTATE_INTERVAL = 30 * 60 * 1000;

function pickPhrase() {
  const storedIndex = Number(localStorage.getItem(PHRASE_INDEX_KEY));
  const storedTime = Number(localStorage.getItem(PHRASE_TIME_KEY));
  const isValidIndex = Number.isInteger(storedIndex) && storedIndex >= 0 && storedIndex < PHRASES.length;
  const isStillFresh = isValidIndex && Date.now() - storedTime < ROTATE_INTERVAL;

  if (isStillFresh) return PHRASES[storedIndex];

  const index = Math.floor(Math.random() * PHRASES.length);
  localStorage.setItem(PHRASE_INDEX_KEY, String(index));
  localStorage.setItem(PHRASE_TIME_KEY, String(Date.now()));
  return PHRASES[index];
}

function applyInteractivity(emojiEl, phrase) {
  if (!phrase.onClick) return;

  emojiEl.classList.add("hero-phrase-emoji-clickable");
  emojiEl.setAttribute("role", "button");
  emojiEl.setAttribute("tabindex", "0");
  if (phrase.ariaLabel) emojiEl.setAttribute("aria-label", phrase.ariaLabel);

  emojiEl.addEventListener("click", phrase.onClick);
  emojiEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      phrase.onClick();
    }
  });
}

const heroPhrase = document.getElementById("hero-phrase");
const phrase = pickPhrase();

if (phrase.icon) {
  const emojiEl = document.createElement("span");
  emojiEl.className = "hero-phrase-emoji";
  emojiEl.innerHTML = phrase.icon;
  applyInteractivity(emojiEl, phrase);
  heroPhrase.append(emojiEl);
} else if (phrase.emoji) {
  const emojiEl = document.createElement("span");
  emojiEl.className = "hero-phrase-emoji";
  emojiEl.textContent = phrase.emoji;
  applyInteractivity(emojiEl, phrase);
  heroPhrase.append(emojiEl);
}

heroPhrase.append(phrase.text);
