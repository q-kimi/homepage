import { PSEUDO_KEY, renderGreeting } from "./greeting.js";
import { showAvatarError } from "./avatar.js";

const SHORTCUTS_HIDDEN_KEY = "homepage.shortcuts.hidden";

const settingsToggle = document.getElementById("settings-toggle");
const settingsOverlay = document.getElementById("settings-overlay");
const settingsCancel = document.getElementById("settings-cancel");
const settingsSave = document.getElementById("settings-save");
const pseudoInput = document.getElementById("pseudo-input");
const shortcuts = document.querySelector(".shortcuts");
const shortcutsToggle = document.getElementById("shortcuts-toggle");

function applyShortcutsVisibility(hidden) {
  shortcuts.hidden = hidden;
}

const shortcutsHidden = localStorage.getItem(SHORTCUTS_HIDDEN_KEY) === "true";
shortcutsToggle.checked = !shortcutsHidden;
applyShortcutsVisibility(shortcutsHidden);

shortcutsToggle.addEventListener("change", () => {
  const hidden = !shortcutsToggle.checked;
  localStorage.setItem(SHORTCUTS_HIDDEN_KEY, hidden ? "true" : "false");
  applyShortcutsVisibility(hidden);
});

const homepageSetupBtn = document.getElementById("homepage-setup-btn");
const homepageInstructions = document.getElementById("homepage-instructions");
const homepageInstructionsText = document.getElementById("homepage-instructions-text");
const homepageCopyUrl = document.getElementById("homepage-copy-url");
const homepageCopyConfirm = document.getElementById("homepage-copy-confirm");

function getBrowserInstructions() {
  const ua = navigator.userAgent;
  const isEdge = ua.includes("Edg/");
  const isFirefox = ua.includes("Firefox/");
  const isChrome = !isEdge && (ua.includes("Chrome/") || ua.includes("Chromium/"));

  if (isFirefox) {
    return "Firefox :\nMenu (☰) > Paramètres > Accueil.\n- Page(s) d'accueil : choisis \"Adresses personnalisées\" et colle l'URL.\n- Nouveaux onglets : installe une extension comme \"New Tab Override\", puis choisis cette URL.";
  }
  if (isEdge) {
    return "Edge :\nParamètres > Démarrage, accueil et nouveaux onglets.\n- \"Ouvrir ces pages\" : ajoute l'URL pour le démarrage.\n- Bouton Accueil : active-le et colle l'URL.\n- Nouvel onglet : non personnalisable nativement, une extension est nécessaire.";
  }
  if (isChrome) {
    return "Chrome :\nParamètres > Au démarrage > \"Ouvrir une page spécifique\" et colle l'URL.\n- Page d'accueil : Paramètres > Apparence > active \"Afficher le bouton Accueil\" et colle l'URL.\n- Nouvel onglet : non personnalisable nativement, une extension comme \"New Tab Redirect\" est nécessaire.";
  }
  return "Ouvre les paramètres de ton navigateur et cherche \"page de démarrage\" ou \"page d'accueil\", puis colle l'URL ci-dessous. La personnalisation du nouvel onglet nécessite en général une extension.";
}

homepageSetupBtn.addEventListener("click", () => {
  const isHidden = homepageInstructions.hidden;
  if (isHidden) {
    homepageInstructionsText.textContent = getBrowserInstructions();
  }
  homepageInstructions.hidden = !isHidden;
});

homepageCopyUrl.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    homepageCopyConfirm.hidden = false;
    setTimeout(() => {
      homepageCopyConfirm.hidden = true;
    }, 1500);
  } catch {
    homepageCopyConfirm.textContent = "Copie impossible, sélectionne l'URL manuellement.";
    homepageCopyConfirm.hidden = false;
  }
});

function openSettings() {
  pseudoInput.value = localStorage.getItem(PSEUDO_KEY) || "";
  showAvatarError("");
  settingsOverlay.classList.add("open");
  pseudoInput.focus();
}

function closeSettings() {
  settingsOverlay.classList.remove("open");
  homepageInstructions.hidden = true;
}

settingsToggle.addEventListener("click", openSettings);
settingsCancel.addEventListener("click", closeSettings);
document.addEventListener("open-settings", openSettings);

settingsOverlay.addEventListener("click", (e) => {
  if (e.target === settingsOverlay) closeSettings();
});

settingsSave.addEventListener("click", () => {
  const pseudo = pseudoInput.value.trim();
  if (pseudo) {
    localStorage.setItem(PSEUDO_KEY, pseudo);
  } else {
    localStorage.removeItem(PSEUDO_KEY);
  }
  renderGreeting();
  closeSettings();
});

pseudoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") settingsSave.click();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSettings();
});
