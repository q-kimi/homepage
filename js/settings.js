import { PSEUDO_KEY, renderGreeting } from "./greeting.js";
import { showAvatarError } from "./avatar.js";

const settingsToggle = document.getElementById("settings-toggle");
const settingsOverlay = document.getElementById("settings-overlay");
const settingsCancel = document.getElementById("settings-cancel");
const settingsSave = document.getElementById("settings-save");
const pseudoInput = document.getElementById("pseudo-input");

function openSettings() {
  pseudoInput.value = localStorage.getItem(PSEUDO_KEY) || "";
  showAvatarError("");
  settingsOverlay.classList.add("open");
  pseudoInput.focus();
}

function closeSettings() {
  settingsOverlay.classList.remove("open");
}

settingsToggle.addEventListener("click", openSettings);
settingsCancel.addEventListener("click", closeSettings);

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
