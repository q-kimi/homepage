export const PSEUDO_KEY = "homepage.pseudo";

const greetingText = document.getElementById("greeting-text");
const greetingEmoji = document.getElementById("greeting-emoji");

function getGreetingWord() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const isDaytime = minutes >= 7 * 60 && minutes < 18 * 60 + 30;
  return isDaytime ? "Bonjour" : "Bonsoir";
}

export function renderGreeting() {
  const pseudo = localStorage.getItem(PSEUDO_KEY);
  const word = getGreetingWord();

  greetingText.textContent = "";
  greetingText.append(`${word}, `);

  if (pseudo) {
    const pseudoEl = document.createElement("span");
    pseudoEl.className = "greeting-pseudo";
    pseudoEl.textContent = pseudo;
    greetingText.append(pseudoEl);
  } else {
    const placeholder = document.createElement("button");
    placeholder.type = "button";
    placeholder.className = "greeting-placeholder";
    placeholder.textContent = "{User}";
    placeholder.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("open-settings"));
    });
    greetingText.append(placeholder);
  }

  if (word === "Bonjour") {
    greetingEmoji.textContent = "👋";
    greetingEmoji.classList.add("wave");
  } else {
    greetingEmoji.textContent = "🌙";
    greetingEmoji.classList.remove("wave");
  }
}

renderGreeting();
