const SHORTCUTS_KEY = "homepage.shortcuts";

const DEFAULT_SHORTCUTS = [
  { name: "YouTube", url: "https://www.youtube.com" },
  { name: "Gmail", url: "https://mail.google.com" },
  { name: "GitHub", url: "https://github.com" },
  { name: "Netflix", url: "https://www.netflix.com" },
  { name: "X", url: "https://twitter.com" },
];

const REMOVE_ICON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none">
  <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const GRIP_ICON = `<svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
  <circle cx="2" cy="2" r="1.4"/><circle cx="8" cy="2" r="1.4"/>
  <circle cx="2" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/>
  <circle cx="2" cy="14" r="1.4"/><circle cx="8" cy="14" r="1.4"/>
</svg>`;

const shortcutsRow = document.getElementById("shortcuts");
const editList = document.getElementById("shortcuts-edit-list");
const addBtn = document.getElementById("shortcuts-add-btn");

function loadShortcuts() {
  try {
    const raw = JSON.parse(localStorage.getItem(SHORTCUTS_KEY));
    if (Array.isArray(raw)) return raw;
  } catch {
    // ignore malformed storage
  }
  return DEFAULT_SHORTCUTS.slice();
}

function saveShortcuts(list) {
  localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(list));
}

function normalizeUrl(url) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  // Only http(s) links are ever rendered as a real href — anything else (javascript:,
  // data:, vbscript:, and comment/newline tricks meant to smuggle a scheme past the
  // check above) is rejected here rather than relying on the browser to refuse to
  // navigate it.
  try {
    const parsed = new URL(withScheme);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? withScheme : "";
  } catch {
    return "";
  }
}

const ICON_OVERRIDES = {
  "mail.google.com": "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico",
};

function faviconUrl(url) {
  const safeUrl = normalizeUrl(url);
  if (!safeUrl) return "";
  try {
    const { hostname } = new URL(safeUrl);
    if (ICON_OVERRIDES[hostname]) return ICON_OVERRIDES[hostname];
    return `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
  } catch {
    return "";
  }
}

function renderShortcutsRow() {
  const list = loadShortcuts();
  shortcutsRow.replaceChildren();

  for (const { name, url } of list) {
    const safeUrl = normalizeUrl(url);
    if (!name?.trim() || !safeUrl) continue;

    const a = document.createElement("a");
    a.className = "shortcut-tile";
    a.href = safeUrl;
    a.target = "_blank";
    a.rel = "noopener";

    const icon = faviconUrl(url);
    if (icon) {
      const img = document.createElement("img");
      img.src = icon;
      img.width = 20;
      img.height = 20;
      img.alt = "";
      a.append(img);
    }

    const span = document.createElement("span");
    span.textContent = name;
    a.append(span);

    shortcutsRow.append(a);
  }
}

let dragSrcIndex = null;

function clearDragIndicators() {
  editList.querySelectorAll(".shortcut-edit-item").forEach((el) => {
    el.classList.remove("drag-over-top", "drag-over-bottom", "dragging");
  });
}

function setDragIndicator(targetLi, position) {
  editList.querySelectorAll(".shortcut-edit-item").forEach((el) => {
    el.classList.toggle("drag-over-top", el === targetLi && position === "before");
    el.classList.toggle("drag-over-bottom", el === targetLi && position === "after");
  });
}

function renderEditor() {
  const list = loadShortcuts();
  editList.replaceChildren();

  list.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "shortcut-edit-item";
    li.draggable = true;

    const row = document.createElement("div");
    row.className = "shortcut-edit-row";

    const grip = document.createElement("span");
    grip.className = "shortcut-edit-grip";
    grip.setAttribute("aria-hidden", "true");
    grip.innerHTML = GRIP_ICON;

    const icon = document.createElement("img");
    icon.className = "shortcut-edit-icon";
    icon.width = 18;
    icon.height = 18;
    icon.alt = "";
    icon.src = faviconUrl(item.url);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "shortcut-edit-name";
    nameInput.placeholder = "Nom";
    nameInput.maxLength = 20;
    nameInput.value = item.name ?? "";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "shortcut-edit-remove";
    removeBtn.setAttribute("aria-label", "Supprimer ce raccourci");
    removeBtn.innerHTML = REMOVE_ICON;

    row.append(grip, icon, nameInput, removeBtn);

    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.className = "shortcut-edit-url";
    urlInput.placeholder = "https://exemple.com";
    urlInput.value = item.url ?? "";

    li.append(row, urlInput);
    editList.append(li);

    function commit() {
      const current = loadShortcuts();
      current[index] = { name: nameInput.value, url: urlInput.value };
      saveShortcuts(current);
      icon.src = faviconUrl(urlInput.value);
      renderShortcutsRow();
    }

    nameInput.addEventListener("input", commit);
    urlInput.addEventListener("input", commit);

    removeBtn.addEventListener("click", () => {
      const current = loadShortcuts();
      current.splice(index, 1);
      saveShortcuts(current);
      renderShortcutsRow();
      renderEditor();
    });

    li.addEventListener("dragstart", (e) => {
      dragSrcIndex = index;
      li.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    });

    li.addEventListener("dragend", () => {
      clearDragIndicators();
      dragSrcIndex = null;
    });

    li.addEventListener("dragover", (e) => {
      if (dragSrcIndex === null || index === dragSrcIndex) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const rect = li.getBoundingClientRect();
      const isAfter = e.clientY - rect.top > rect.height / 2;
      setDragIndicator(li, isAfter ? "after" : "before");
    });

    li.addEventListener("drop", (e) => {
      e.preventDefault();
      if (dragSrcIndex === null || index === dragSrcIndex) return;

      const rect = li.getBoundingClientRect();
      const isAfter = e.clientY - rect.top > rect.height / 2;
      let targetIndex = index + (isAfter ? 1 : 0);

      const current = loadShortcuts();
      const [moved] = current.splice(dragSrcIndex, 1);
      if (dragSrcIndex < targetIndex) targetIndex -= 1;
      current.splice(targetIndex, 0, moved);

      saveShortcuts(current);
      dragSrcIndex = null;
      renderShortcutsRow();
      renderEditor();
    });
  });
}

addBtn.addEventListener("click", () => {
  const current = loadShortcuts();
  current.push({ name: "", url: "" });
  saveShortcuts(current);
  renderEditor();
  editList.querySelector(".shortcut-edit-item:last-child .shortcut-edit-name")?.focus();
});

renderShortcutsRow();
renderEditor();
