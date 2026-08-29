import { input } from "./engines.js";
import { syncFakePlaceholder } from "./placeholder.js";

const micButton = document.getElementById("mic-button");
const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

const MIC_ICON = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none">
  <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M19 11a7 7 0 0 1-14 0M12 18v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const MIC_OFF_ICON = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none">
  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23M12 18v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

if (SpeechRecognitionClass) {
  const recognition = new SpeechRecognitionClass();
  recognition.lang = "fr-FR";
  recognition.interimResults = true;
  recognition.continuous = false;

  const BRAVE_BLOCKED_MESSAGE =
    "Brave bloque la dictée vocale par défaut. Autorise-la dans brave://settings/privacy (section reconnaissance vocale).";

  // Brave blocks its speech service by default and gives no way to query the
  // setting directly, so we track the only signal we actually get: whether a
  // session has ever produced a real result. Until that happens we assume
  // it's still blocked and show a crossed-out mic instead of the normal one.
  const BRAVE_VOICE_ENABLED_KEY = "homepage.voiceBraveEnabled";

  function showBlockedIcon() {
    micButton.innerHTML = MIC_OFF_ICON;
    micButton.classList.add("mic-blocked");
    micButton.setAttribute("aria-label", "Dictée vocale bloquée sur Brave");
    micButton.dataset.tooltip = BRAVE_BLOCKED_MESSAGE;
  }

  function showNormalIcon() {
    micButton.innerHTML = MIC_ICON;
    micButton.classList.remove("mic-blocked");
    micButton.setAttribute("aria-label", "Dictée vocale");
    delete micButton.dataset.tooltip;
  }

  function markBraveVoiceEnabled() {
    try {
      localStorage.setItem(BRAVE_VOICE_ENABLED_KEY, "1");
    } catch {
      // ignore storage errors (private mode, quota, ...)
    }
    showNormalIcon();
  }

  function markBraveVoiceBlocked() {
    try {
      localStorage.removeItem(BRAVE_VOICE_ENABLED_KEY);
    } catch {
      // ignore storage errors
    }
    showBlockedIcon();
  }

  if (navigator.brave && localStorage.getItem(BRAVE_VOICE_ENABLED_KEY) !== "1") {
    showBlockedIcon();
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
    if (navigator.brave) markBraveVoiceEnabled();

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
      if (navigator.brave) {
        markBraveVoiceBlocked();
      } else {
        micButton.dataset.tooltip =
          "La dictée vocale s'est arrêtée sans résultat. Réessaie, ou vérifie les autorisations du micro dans ton navigateur.";
      }
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
      if (navigator.brave) {
        markBraveVoiceBlocked();
      } else {
        micButton.dataset.tooltip = "Connexion internet requise pour la dictée vocale.";
      }
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
