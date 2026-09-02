import { form, input } from "./engines.js";
import { syncFakePlaceholder } from "./placeholder.js";
import { onClickOutside } from "./dom-utils.js";
import { loadCommands } from "./commands.js";
import { loadHistory, rememberQuery, forgetQuery } from "./history.js";

const MAX_SUGGESTIONS = 6;

const list = document.getElementById("suggestions-list");

const HISTORY_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
  <path d="M12 7v5l3.5 2M21 12a9 9 0 1 1-9-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M21 3v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const REMOVE_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
  <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const COMMAND_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
  <path d="M14 6L10 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return escapeHtml(text);
  const before = escapeHtml(text.slice(0, idx));
  const match = escapeHtml(text.slice(idx, idx + query.length));
  const after = escapeHtml(text.slice(idx + query.length));
  return `${before}<strong>${match}</strong>${after}`;
}

function getMatches(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return loadHistory()
    .filter((entry) => entry.text.toLowerCase() !== q && entry.text.toLowerCase().includes(q))
    .slice(0, MAX_SUGGESTIONS);
}

function getCommandMatches(query) {
  const match = query.match(/^\/(\S*)$/);
  if (!match) return [];
  const typed = match[1].toLowerCase();
  return loadCommands().filter((c) => c.key.startsWith(typed));
}

let matches = [];
let suggestionMode = "history";
let activeIndex = -1;

function closeSuggestions() {
  list.classList.remove("open");
  input.setAttribute("aria-expanded", "false");
  input.removeAttribute("aria-activedescendant");
  matches = [];
  activeIndex = -1;
}

function setActive(index) {
  const items = list.querySelectorAll(".suggestion-item");
  items.forEach((el, i) => el.classList.toggle("active", i === index));
  activeIndex = index;

  if (index >= 0 && items[index]) {
    input.setAttribute("aria-activedescendant", items[index].id);
  } else {
    input.removeAttribute("aria-activedescendant");
  }
}

function selectSuggestion(index) {
  if (suggestionMode === "command") {
    input.value = `/${matches[index].key} `;
    syncFakePlaceholder();
    closeSuggestions();
    input.focus();
    return;
  }

  input.value = matches[index].text;
  syncFakePlaceholder();
  closeSuggestions();
  form.requestSubmit();
}

function renderCommandSuggestions(entries) {
  suggestionMode = "command";
  matches = entries;
  activeIndex = -1;
  list.innerHTML = "";

  if (entries.length === 0) {
    closeSuggestions();
    return;
  }

  const heading = document.createElement("li");
  heading.className = "suggestions-list-heading";
  heading.textContent = "Commandes";
  list.appendChild(heading);

  entries.forEach((command, i) => {
    const li = document.createElement("li");
    li.className = "suggestion-item";
    li.id = `suggestion-${i}`;
    li.setAttribute("role", "option");
    li.innerHTML = `
      <span class="suggestion-icon">${COMMAND_ICON}</span>
      <span class="suggestion-text"><code>/${command.key}</code>${command.name}</span>
    `;

    li.addEventListener("mouseenter", () => setActive(i));
    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      selectSuggestion(i);
    });

    list.appendChild(li);
  });

  list.classList.add("open");
  input.setAttribute("aria-expanded", "true");
}

function renderSuggestions(query) {
  if (query.trim().startsWith("/")) {
    renderCommandSuggestions(getCommandMatches(query));
    return;
  }

  suggestionMode = "history";
  matches = getMatches(query);
  activeIndex = -1;
  list.innerHTML = "";

  if (matches.length === 0) {
    closeSuggestions();
    return;
  }

  matches.forEach((entry, i) => {
    const li = document.createElement("li");
    li.className = "suggestion-item";
    li.id = `suggestion-${i}`;
    li.setAttribute("role", "option");
    li.innerHTML = `
      <span class="suggestion-icon">${HISTORY_ICON}</span>
      <span class="suggestion-text">${highlightMatch(entry.text, query)}</span>
      <button type="button" class="suggestion-remove" aria-label="Supprimer cette suggestion" tabindex="-1">${REMOVE_ICON}</button>
    `;

    li.addEventListener("mouseenter", () => setActive(i));
    li.addEventListener("mousedown", (e) => {
      if (e.target.closest(".suggestion-remove")) return;
      e.preventDefault();
      selectSuggestion(i);
    });
    li.querySelector(".suggestion-remove").addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      forgetQuery(entry.text);
      renderSuggestions(input.value);
    });

    list.appendChild(li);
  });

  list.classList.add("open");
  input.setAttribute("aria-expanded", "true");
}

input.addEventListener("input", () => {
  renderSuggestions(input.value);
});

input.addEventListener("focus", () => {
  if (input.value.trim()) renderSuggestions(input.value);
});

input.addEventListener("keydown", (e) => {
  if (!list.classList.contains("open")) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    setActive((activeIndex + 1) % matches.length);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setActive((activeIndex - 1 + matches.length) % matches.length);
  } else if (e.key === "Enter") {
    if (activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(activeIndex);
    }
  } else if (e.key === "Escape") {
    closeSuggestions();
  }
});

const commandHintButton = document.getElementById("command-hint-button");

commandHintButton.addEventListener("click", () => {
  input.value = "/";
  syncFakePlaceholder();
  input.focus();
  renderSuggestions(input.value);
});

onClickOutside([list, input, commandHintButton], closeSuggestions);

form.addEventListener("submit", () => {
  rememberQuery(input.value);
  closeSuggestions();
});
