const SHORTCUTS_KEY = "homepage.shortcuts";

const DEFAULT_SHORTCUTS = [
  { name: "YouTube", url: "https://www.youtube.com" },
  { name: "Gmail", url: "https://mail.google.com" },
  { name: "GitHub", url: "https://github.com" },
  { name: "Netflix", url: "https://www.netflix.com" },
  { name: "X", url: "https://twitter.com" },
  { name: "Instagram", url: "https://www.instagram.com" },
  { name: "WhatsApp", url: "https://web.whatsapp.com" },
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
const shortcutsWrap = document.getElementById("shortcuts-wrap");
const prevBtn = document.getElementById("shortcuts-prev");
const nextBtn = document.getElementById("shortcuts-next");
const editList = document.getElementById("shortcuts-edit-list");
const addBtn = document.getElementById("shortcuts-add-btn");

const PAGE_SIZE = 7;
let page = 0;

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

const GITHUB_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
</svg>`;

// Some icons are drawn inline (currentColor) instead of fetched as an image,
// so they follow the theme instead of showing up as a flat colored square.
const SVG_ICON_OVERRIDES = {
  "github.com": GITHUB_ICON,
};

function hostnameOf(url) {
  const safeUrl = normalizeUrl(url);
  if (!safeUrl) return "";
  try {
    return new URL(safeUrl).hostname;
  } catch {
    return "";
  }
}

function faviconUrl(url) {
  const hostname = hostnameOf(url);
  if (!hostname) return "";
  if (ICON_OVERRIDES[hostname]) return ICON_OVERRIDES[hostname];
  return `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
}

function renderIcon(container, url) {
  container.replaceChildren();
  const svgIcon = SVG_ICON_OVERRIDES[hostnameOf(url)];
  if (svgIcon) {
    container.innerHTML = svgIcon;
    return;
  }
  const src = faviconUrl(url);
  if (!src) return;
  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  container.append(img);
}

function renderShortcutsRow() {
  const list = loadShortcuts();
  shortcutsRow.replaceChildren();

  let visibleCount = 0;
  for (const { name, url } of list) {
    const safeUrl = normalizeUrl(url);
    if (!name?.trim() || !safeUrl) continue;

    const a = document.createElement("a");
    a.className = "shortcut-tile";
    a.href = safeUrl;
    a.target = "_blank";
    a.rel = "noopener";

    const iconWrap = document.createElement("span");
    iconWrap.className = "shortcut-tile-icon";
    renderIcon(iconWrap, url);
    if (iconWrap.hasChildNodes()) a.append(iconWrap);

    const span = document.createElement("span");
    span.textContent = name;
    a.append(span);

    shortcutsRow.append(a);
    visibleCount += 1;
  }

  const totalPages = Math.max(1, Math.ceil(visibleCount / PAGE_SIZE));
  page = Math.min(page, totalPages - 1);
  const paginated = visibleCount > PAGE_SIZE;

  shortcutsWrap.classList.toggle("paginated", paginated);
  prevBtn.hidden = !paginated;
  nextBtn.hidden = !paginated;
  if (paginated) {
    prevBtn.disabled = page === 0;
    nextBtn.disabled = page === totalPages - 1;
    updateCarouselPosition();
  } else {
    shortcutsRow.style.transform = "";
  }
}

function updateCarouselPosition() {
  const target = shortcutsRow.children[page * PAGE_SIZE];
  shortcutsRow.style.transform = target ? `translateX(-${target.offsetLeft}px)` : "";
}

prevBtn.addEventListener("click", () => {
  page = Math.max(0, page - 1);
  prevBtn.disabled = page === 0;
  nextBtn.disabled = false;
  updateCarouselPosition();
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(shortcutsRow.children.length / PAGE_SIZE));
  page = Math.min(totalPages - 1, page + 1);
  nextBtn.disabled = page === totalPages - 1;
  prevBtn.disabled = false;
  updateCarouselPosition();
});

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

    const icon = document.createElement("span");
    icon.className = "shortcut-edit-icon";
    renderIcon(icon, item.url);

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
      renderIcon(icon, urlInput.value);
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
