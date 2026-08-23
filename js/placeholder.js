const fakePlaceholder = document.getElementById("fake-placeholder");
const typedWordEl = document.getElementById("typed-word");

const typingWords = [
  "chercher",
  "trouver",
  "apprendre",
  "comprendre",
  "découvrir",
  "explorer",
  "savoir",
];

const TYPE_SPEED = 90;
const DELETE_SPEED = 38;
const HOLD_TIME = 1300;
const GAP_TIME = 300;

let typingWordIndex = 0;
let typingCharIndex = 0;
let isDeleting = false;
let typingTimer = null;

function typeStep() {
  const currentWord = `${typingWords[typingWordIndex]} ?`;

  if (!isDeleting) {
    typingCharIndex += 1;
    typedWordEl.textContent = currentWord.slice(0, typingCharIndex);

    if (typingCharIndex === currentWord.length) {
      typingTimer = setTimeout(() => {
        isDeleting = true;
        typeStep();
      }, HOLD_TIME);
      return;
    }
    typingTimer = setTimeout(typeStep, TYPE_SPEED);
  } else {
    typingCharIndex -= 1;
    typedWordEl.textContent = currentWord.slice(0, typingCharIndex);

    if (typingCharIndex === 0) {
      isDeleting = false;
      typingWordIndex = (typingWordIndex + 1) % typingWords.length;
      typingTimer = setTimeout(typeStep, GAP_TIME);
      return;
    }
    typingTimer = setTimeout(typeStep, DELETE_SPEED);
  }
}

function startTyping() {
  if (typingTimer) return;
  typeStep();
}

function stopTyping() {
  clearTimeout(typingTimer);
  typingTimer = null;
}

function syncFakePlaceholder() {
  const hasValue = input.value.length > 0;
  fakePlaceholder.classList.toggle("hidden", hasValue);
  if (hasValue) {
    stopTyping();
  } else {
    startTyping();
  }
}

input.addEventListener("input", syncFakePlaceholder);
syncFakePlaceholder();
