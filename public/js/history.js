import { readJsonArray } from "./dom-utils.js";

const HISTORY_KEY = "homepage.searchHistory";
const MAX_HISTORY = 50;

export function loadHistory() {
  const raw = readJsonArray(HISTORY_KEY) ?? [];
  return raw
    .map((item) => {
      if (typeof item === "string") return { text: item, time: null };
      if (item && typeof item.text === "string") return { text: item.text, time: item.time ?? null };
      return null;
    })
    .filter(Boolean);
}

export function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function rememberQuery(query) {
  const trimmed = query.trim();
  if (!trimmed) return;

  const history = loadHistory().filter((entry) => entry.text.toLowerCase() !== trimmed.toLowerCase());
  history.unshift({ text: trimmed, time: Date.now() });
  saveHistory(history.slice(0, MAX_HISTORY));
}

export function forgetQuery(text) {
  const history = loadHistory().filter((entry) => entry.text !== text);
  saveHistory(history);
}

export function clearHistory() {
  saveHistory([]);
}
