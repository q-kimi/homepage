const PHRASES = [
  { text: "On navigue sur la toile ?", emoji: "🧭" },
  { text: "Prêt(e) à explorer le web ?", emoji: "🚀" },
  { text: "Une recherche à lancer ?", emoji: "🔍" },
  { text: "On part à l'aventure ?", emoji: "🗺️" },
  { text: "Envie de fouiner un peu ?" },
  { text: "À la recherche de quoi ?" },
  { text: "On part en exploration ?", emoji: "🔦" },
  { text: "Une question à poser à Internet ?" },
  { text: "Le web t'attend", emoji: "🌐" },
  { text: "On creuse un sujet ?", emoji: "⛏️" },
  { text: "Un mystère à percer ?", emoji: "🕵️" },
  { text: "Envie de découvrir quelque chose ?" },
  { text: "On lance les recherches ?" },
  { text: "Internet n'attend que toi" },
  { text: "Une idée derrière la tête ?", emoji: "💡" },
  { text: "Le web est grand ouvert", emoji: "🌍" },
  { text: "Une petite recherche s'impose ?" },
  { text: "On chasse l'info ?", emoji: "🎯" },
  { text: "Prêt(e) à te perdre sur le web ?" },
  { text: "Attention à l'empreinte carbone", emoji: "🌱" },
  { text: "Qui accepte les cookies ?", emoji: "🍪" },
  { text: "Besoin d'une info ?" },
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

heroPhrase.append(phrase.text);

if (phrase.emoji) {
  const emojiEl = document.createElement("span");
  emojiEl.className = "hero-phrase-emoji";
  emojiEl.textContent = phrase.emoji;
  heroPhrase.append(" ", emojiEl);
}
