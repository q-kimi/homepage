const PSEUDO_KEY = "homepage.pseudo";

const greetingText = document.getElementById("greeting-text");
const greetingEmoji = document.getElementById("greeting-emoji");

function getGreetingWord() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const isDaytime = minutes >= 7 * 60 && minutes < 18 * 60 + 30;
  return isDaytime ? "Bonjour" : "Bonsoir";
}

function renderGreeting() {
  const pseudo = localStorage.getItem(PSEUDO_KEY);
  const word = getGreetingWord();

  greetingText.textContent = pseudo ? `${word}, ${pseudo}` : word;

  if (word === "Bonjour") {
    greetingEmoji.textContent = "👋";
    greetingEmoji.classList.add("wave");
  } else {
    greetingEmoji.textContent = "🌙";
    greetingEmoji.classList.remove("wave");
  }
}

renderGreeting();
