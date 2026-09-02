import { onClickOutside, onEscape } from "./dom-utils.js";
import { loadHistory, forgetQuery, clearHistory } from "./history.js";

const HISTORY_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
  <path d="M12 7v5l3.5 2M21 12a9 9 0 1 1-9-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M21 3v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const REMOVE_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
  <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const historyToggle = document.getElementById("history-toggle");
const historyOverlay = document.getElementById("history-overlay");
const historyList = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
const historyClearBtn = document.getElementById("history-clear-btn");
const historyCloseBtn = document.getElementById("history-close-btn");
const historySearch = document.getElementById("history-search");

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDateHeading(time) {
  if (!time) return "Date inconnue";

  const date = new Date(time);
  const now = new Date();
  if (isSameDay(date, now)) return "Aujourd'hui";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Hier";

  const options = { day: "numeric", month: "long" };
  if (date.getFullYear() !== now.getFullYear()) options.year = "numeric";
  return date.toLocaleDateString("fr-FR", options);
}

function formatTime(time) {
  return time ? new Date(time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
}

function renderHistory() {
  const searchQuery = historySearch.value.trim().toLowerCase();
  const fullHistory = loadHistory();
  const history = searchQuery
    ? fullHistory.filter((entry) => entry.text.toLowerCase().includes(searchQuery))
    : fullHistory;

  historyList.replaceChildren();
  historyEmpty.hidden = history.length > 0;
  historyEmpty.textContent = searchQuery ? "Aucun résultat." : "Aucune recherche enregistrée.";
  historyClearBtn.hidden = fullHistory.length === 0;

  let lastHeading = null;

  for (const entry of history) {
    const heading = formatDateHeading(entry.time);
    if (heading !== lastHeading) {
      const headingEl = document.createElement("li");
      headingEl.className = "history-date-heading";
      headingEl.textContent = heading;
      historyList.append(headingEl);
      lastHeading = heading;
    }

    const li = document.createElement("li");
    li.className = "history-item";

    const icon = document.createElement("span");
    icon.className = "history-item-icon";
    icon.innerHTML = HISTORY_ICON;

    const text = document.createElement("span");
    text.className = "history-item-text";
    text.textContent = entry.text;

    const time = document.createElement("span");
    time.className = "history-item-time";
    time.textContent = formatTime(entry.time);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "history-item-remove";
    removeBtn.setAttribute("aria-label", `Supprimer "${entry.text}" de l'historique`);
    removeBtn.innerHTML = REMOVE_ICON;
    removeBtn.addEventListener("click", () => {
      forgetQuery(entry.text);
      renderHistory();
    });

    li.append(icon, text, time, removeBtn);
    historyList.append(li);
  }
}

function openHistory() {
  historySearch.value = "";
  renderHistory();
  historyOverlay.classList.add("open");
}

function closeHistory() {
  historyOverlay.classList.remove("open");
}

historyToggle.addEventListener("click", openHistory);
historySearch.addEventListener("input", renderHistory);

historyClearBtn.addEventListener("click", () => {
  clearHistory();
  renderHistory();
});

historyCloseBtn.addEventListener("click", closeHistory);

let overlayMouseDownTarget = null;

historyOverlay.addEventListener("mousedown", (e) => {
  overlayMouseDownTarget = e.target;
});

historyOverlay.addEventListener("click", (e) => {
  if (e.target === historyOverlay && overlayMouseDownTarget === historyOverlay) {
    closeHistory();
  }
});

onEscape(closeHistory);
onClickOutside([historyOverlay, historyToggle], closeHistory);
