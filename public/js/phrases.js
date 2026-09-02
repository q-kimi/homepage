export const PSEUDO_KEY = "homepage.pseudo";

const heroPhrase = document.getElementById("hero-phrase");

function pickGreeting() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return { word: "Bonjour", emoji: "👋", anim: "wave" };
  if (hour >= 12 && hour < 18) return { word: "Bon après-midi" };
  if (hour >= 18 && hour < 22) return { word: "Bonsoir" };
  return { word: "Bonne nuit", emoji: "💤", anim: "sleep" };
}

export function renderGreeting() {
  const pseudo = localStorage.getItem(PSEUDO_KEY);
  const { word, emoji, anim } = pickGreeting();

  heroPhrase.replaceChildren(`${word}, `);

  if (pseudo) {
    const pseudoEl = document.createElement("span");
    pseudoEl.className = "greeting-pseudo";
    pseudoEl.textContent = pseudo;
    heroPhrase.append(pseudoEl);
  } else {
    const placeholder = document.createElement("button");
    placeholder.type = "button";
    placeholder.className = "greeting-placeholder";
    placeholder.textContent = "{User}";
    placeholder.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("open-settings"));
    });
    heroPhrase.append(placeholder);
  }

  if (emoji) {
    heroPhrase.append(" ");
    const emojiEl = document.createElement("span");
    emojiEl.className = anim ? `greeting-emoji greeting-emoji-${anim}` : "greeting-emoji";
    emojiEl.textContent = emoji;
    heroPhrase.append(emojiEl);
  }
}

renderGreeting();
