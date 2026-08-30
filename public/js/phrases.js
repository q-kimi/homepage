const PHRASES = [
  { text: "On navigue sur la toile ?", emoji: "🕸️" },
  { text: "Prêt(e) à explorer le web ?" },
  { text: "On part à l'aventure ?", emoji: "🗺️" },
  { text: "À la recherche de quoi ?", emoji: "🔎" },
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

const heroPhrase = document.getElementById("hero-phrase");
const phrase = pickPhrase();

if (phrase.emoji) {
  const emojiEl = document.createElement("span");
  emojiEl.className = "hero-phrase-emoji";
  emojiEl.textContent = phrase.emoji;
  heroPhrase.append(emojiEl, " ");
}

heroPhrase.append(phrase.text);
