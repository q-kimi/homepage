import { input } from "./engines.js";
import { syncFakePlaceholder } from "./placeholder.js";

const micButton = document.getElementById("mic-button");
const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognitionClass) {
  const recognition = new SpeechRecognitionClass();
  recognition.lang = "fr-FR";
  recognition.interimResults = true;
  recognition.continuous = false;

  const BRAVE_BLOCKED_MESSAGE =
    "Brave bloque la dictée vocale par défaut. Autorise-la dans brave://settings/privacy (section reconnaissance vocale).";

  // Warn up front on Brave: the underlying speech service is blocked by
  // default there, so tell the user on hover instead of only after they've
  // already clicked and hit a silent failure.
  if (navigator.brave) {
    micButton.dataset.tooltip = BRAVE_BLOCKED_MESSAGE;
  }

  let listening = false;
  let gotResultOrError = false;

  recognition.addEventListener("start", () => {
    listening = true;
    gotResultOrError = false;
    micButton.classList.add("listening");
    input.value = "";
    syncFakePlaceholder();
  });

  recognition.addEventListener("result", (e) => {
    gotResultOrError = true;
    let transcript = "";
    for (const result of e.results) {
      transcript += result[0].transcript;
    }
    input.value = transcript;
    syncFakePlaceholder();
  });

  recognition.addEventListener("end", () => {
    listening = false;
    micButton.classList.remove("listening");

    // Brave silently starts then immediately ends the session (no "result", no
    // "error" event at all) when it blocks the underlying speech service —
    // this is the only place that case is ever observable.
    if (!gotResultOrError) {
      micButton.dataset.tooltip = navigator.brave
        ? BRAVE_BLOCKED_MESSAGE
        : "La dictée vocale s'est arrêtée sans résultat. Réessaie, ou vérifie les autorisations du micro dans ton navigateur.";
    }
  });

  recognition.addEventListener("error", (e) => {
    listening = false;
    gotResultOrError = true;
    micButton.classList.remove("listening");
    console.error("Dictée vocale : erreur ->", e.error);

    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      micButton.dataset.tooltip = "Accès au micro refusé. Autorise le micro pour cette page dans ton navigateur.";
    } else if (e.error === "no-speech") {
      micButton.dataset.tooltip = "Aucune voix détectée, réessaie.";
    } else if (e.error === "audio-capture") {
      micButton.dataset.tooltip = "Aucun micro détecté sur cet appareil.";
    } else if (e.error === "network") {
      micButton.dataset.tooltip = navigator.brave ? BRAVE_BLOCKED_MESSAGE : "Connexion internet requise pour la dictée vocale.";
    } else {
      micButton.dataset.tooltip = `Dictée vocale indisponible (${e.error}).`;
    }
  });

  micButton.addEventListener("click", () => {
    if (listening) {
      recognition.stop();
      return;
    }
    input.focus();
    recognition.start();
  });
} else {
  micButton.disabled = true;
  micButton.dataset.tooltip = "Dictée vocale non supportée par ce navigateur";
}
