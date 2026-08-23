import { form, input } from "./engines.js";
import { syncFakePlaceholder } from "./placeholder.js";

const micButton = document.getElementById("mic-button");
const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognitionClass) {
  const recognition = new SpeechRecognitionClass();
  recognition.lang = "fr-FR";
  recognition.interimResults = true;
  recognition.continuous = false;

  let listening = false;

  recognition.addEventListener("start", () => {
    listening = true;
    micButton.classList.add("listening");
    input.value = "";
    syncFakePlaceholder();
  });

  recognition.addEventListener("result", (e) => {
    let transcript = "";
    for (const result of e.results) {
      transcript += result[0].transcript;
    }
    input.value = transcript;
    syncFakePlaceholder();

    const lastResult = e.results[e.results.length - 1];
    if (lastResult.isFinal && transcript.trim()) {
      form.requestSubmit();
    }
  });

  recognition.addEventListener("end", () => {
    listening = false;
    micButton.classList.remove("listening");
  });

  recognition.addEventListener("error", (e) => {
    listening = false;
    micButton.classList.remove("listening");
    console.error("Dictée vocale : erreur ->", e.error);

    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      micButton.title = "Accès au micro refusé. Autorise le micro pour cette page dans ton navigateur.";
    } else if (e.error === "no-speech") {
      micButton.title = "Aucune voix détectée, réessaie.";
    } else if (e.error === "audio-capture") {
      micButton.title = "Aucun micro détecté sur cet appareil.";
    } else if (e.error === "network") {
      micButton.title = "Connexion internet requise pour la dictée vocale.";
    } else {
      micButton.title = `Dictée vocale indisponible (${e.error}).`;
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
  micButton.title = "Dictée vocale non supportée par ce navigateur";
}
