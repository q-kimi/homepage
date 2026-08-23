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

const storedShortcutsHidden = localStorage.getItem(SHORTCUTS_HIDDEN_KEY);
const shortcutsHidden = storedShortcutsHidden === null ? true : storedShortcutsHidden === "true";
shortcutsToggle.checked = !shortcutsHidden;
applyShortcutsVisibility(shortcutsHidden);

shortcutsToggle.addEventListener("change", () => {
  const hidden = !shortcutsToggle.checked;
  localStorage.setItem(SHORTCUTS_HIDDEN_KEY, hidden ? "true" : "false");
  applyShortcutsVisibility(hidden);
});

const homepageSetupBtn = document.getElementById("homepage-setup-btn");
const homepageInstructions = document.getElementById("homepage-instructions");
const homepageInstructionsBrowser = document.getElementById("homepage-instructions-browser");
const homepageInstructionsList = document.getElementById("homepage-instructions-list");
const homepageCopyUrl = document.getElementById("homepage-copy-url");
const homepageCopyConfirm = document.getElementById("homepage-copy-confirm");

function getBrowserInstructions() {
  const ua = navigator.userAgent;
  const isEdge = ua.includes("Edg/");
  const isFirefox = ua.includes("Firefox/");
  const isChrome = !isEdge && (ua.includes("Chrome/") || ua.includes("Chromium/"));

  if (isFirefox) {
    return {
      name: "Firefox",
      path: "Menu (☰) > Paramètres > Accueil.",
      steps: [
        { label: "Page(s) d'accueil", text: "choisis « Adresses personnalisées » et colle l'URL." },
        { label: "Nouveaux onglets", text: "installe une extension comme « New Tab Override », puis choisis cette URL." },
      ],
    };
  }
  if (isEdge) {
    return {
      name: "Edge",
      path: "Paramètres > Démarrage, accueil et nouveaux onglets.",
      steps: [
        { label: "Au démarrage", text: "« Ouvrir ces pages » : ajoute l'URL." },
        { label: "Bouton Accueil", text: "active-le puis colle l'URL." },
        { label: "Nouvel onglet", text: "non personnalisable nativement ; une extension est nécessaire." },
      ],
    };
  }
  if (isChrome) {
    return {
      name: "Chromium",
      path: "Paramètres > Au démarrage.",
      steps: [
        { label: "", text: "Choisis « Ouvrir une page spécifique » et colle l'URL." },
        { label: "Page d'accueil", text: "Paramètres > Apparence > active « Afficher le bouton Accueil » et colle l'URL." },
        { label: "Nouvel onglet", text: "non personnalisable nativement ; une extension comme « New Tab Redirect » est nécessaire." },
      ],
    };
  }
  return {
    name: "Ton navigateur",
    path: "",
    steps: [
      { label: "", text: "Cherche « page de démarrage » ou « page d'accueil » dans les paramètres et colle l'URL ci-dessous." },
      { label: "", text: "La personnalisation du nouvel onglet nécessite en général une extension." },
    ],
  };
}

function renderHomepageInstructions() {
  const { name, path, steps } = getBrowserInstructions();

  homepageInstructionsBrowser.textContent = `${name} :`;
  homepageInstructionsList.textContent = "";

  if (path) {
    const pathItem = document.createElement("li");
    pathItem.textContent = path;
    homepageInstructionsList.append(pathItem);
  }

  for (const step of steps) {
    const item = document.createElement("li");
    if (step.label) {
      const label = document.createElement("strong");
      label.textContent = `${step.label} : `;
      item.append(label, step.text);
    } else {
      item.textContent = step.text;
    }
    homepageInstructionsList.append(item);
  }
}

homepageSetupBtn.addEventListener("click", () => {
  const isHidden = homepageInstructions.hidden;
  if (isHidden) {
    renderHomepageInstructions();
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
