import { readJsonArray, onClickOutside, onEscape, dedupeUrlScheme } from "./dom-utils.js";
import { openSettings } from "./settings.js";

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

const CHEVRON_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
  <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const EYE_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
</svg>`;

const EYE_OFF_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
  <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M6.7 6.7C3.6 8.5 1 12 1 12s4 7 11 7c2 0 3.7-.5 5.1-1.2M17.4 17.4C20 15.6 23 12 23 12s-1.5-2.6-4-4.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Standard Galactic Alphabet-ish: the shuffling rune set drawn over hidden
// items' name/link fields, like Minecraft's enchanting table text.
const RUNE_CHARS = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟᛝᛡᛠ";

function randomRuneString(length) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)];
  }
  return out;
}

const shortcutsRow = document.getElementById("shortcuts");
const shortcutsWrap = document.getElementById("shortcuts-wrap");
const shortcutsViewport = document.getElementById("shortcuts-viewport");
const prevBtn = document.getElementById("shortcuts-prev");
const nextBtn = document.getElementById("shortcuts-next");
const editList = document.getElementById("shortcuts-edit-list");
const addBtn = document.getElementById("shortcuts-add-btn");
const iconInput = document.getElementById("shortcut-icon-input");
const contextMenu = document.getElementById("shortcut-context-menu");
const contextMenuEditBtn = contextMenu.querySelector('[data-action="edit"]');
const contextMenuMakeFolderBtn = contextMenu.querySelector('[data-action="make-folder"]');
const contextMenuRenameBtn = contextMenu.querySelector('[data-action="rename"]');
const contextMenuRemoveFromFolderBtn = contextMenu.querySelector('[data-action="remove-from-folder"]');
const contextMenuDeleteBtn = contextMenu.querySelector('[data-action="delete"]');

const folderOverlay = document.getElementById("folder-overlay");
const folderNameInput = document.getElementById("folder-name-input");
const folderCloseBtn = document.getElementById("folder-close-btn");
const folderPopupGrid = document.getElementById("folder-popup-grid");
const folderPopupEmpty = document.getElementById("folder-popup-empty");

const TILE_SIZE = 72;
const TILE_GAP = 10;
const NAV_RESERVE = 64; // space taken by the two nav arrows + their gaps
const MIN_PAGE_SIZE = 3;
const MAX_PAGE_SIZE = 7;
const ICON_MAX_SOURCE_SIZE = 15 * 1024 * 1024;
const ICON_DIMENSION = 64;
let page = 0;
let pageSize = MAX_PAGE_SIZE;
let iconEditIndex = null;
// Index of a folder tile that should play its "just created" pop-in
// animation on the next render only; cleared right after that render.
let pendingCreatedIndex = null;
// Folders currently expanded in the settings editor (session-only UI state).
let expandedFolders = new Set();
// { input, overlay } pairs for hidden items' name/link fields, and
// { container, overlay } pairs for their icon, rebuilt on every
// renderEditor() call and driven by the interval below.
let glitchOverlays = [];
let glitchIconOverlays = [];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function createGlitchOverlay(input, extraClass) {
  const overlay = document.createElement("span");
  overlay.className = "shortcut-edit-glitch-overlay";
  if (extraClass) overlay.classList.add(extraClass);
  overlay.setAttribute("aria-hidden", "true");
  input.insertAdjacentElement("afterend", overlay);

  if (prefersReducedMotion) {
    overlay.style.display = "none";
    return;
  }

  input.addEventListener("focus", () => {
    overlay.style.opacity = "0";
  });
  input.addEventListener("blur", () => {
    overlay.style.opacity = "1";
  });

  glitchOverlays.push({ input, overlay });
}

// Icon equivalent: no real value to preserve for editing, so it just shows a
// single shuffling rune the whole time the item stays hidden. Clicks still
// reach the real icon underneath (pointer-events: none on the overlay).
function createGlitchIconOverlay(container) {
  const overlay = document.createElement("span");
  overlay.className = "shortcut-edit-glitch-icon-overlay";
  overlay.setAttribute("aria-hidden", "true");
  container.insertAdjacentElement("afterend", overlay);

  if (prefersReducedMotion) {
    overlay.style.display = "none";
    return;
  }

  glitchIconOverlays.push({ container, overlay });
}

if (!prefersReducedMotion) {
  setInterval(() => {
    glitchOverlays.forEach(({ input, overlay }) => {
      if (!input.isConnected) return;
      overlay.style.left = `${input.offsetLeft}px`;
      overlay.style.top = `${input.offsetTop}px`;
      overlay.style.width = `${input.offsetWidth}px`;
      overlay.style.height = `${input.offsetHeight}px`;
      if (document.activeElement === input) return;
      overlay.textContent = input.value ? randomRuneString(input.value.length) : "";
    });

    glitchIconOverlays.forEach(({ container, overlay }) => {
      if (!container.isConnected) return;
      overlay.style.left = `${container.offsetLeft}px`;
      overlay.style.top = `${container.offsetTop}px`;
      overlay.style.width = `${container.offsetWidth}px`;
      overlay.style.height = `${container.offsetHeight}px`;
      overlay.textContent = randomRuneString(1);
    });
  }, 90);
}

// Resolves an overlay's text character-by-character between plain text and
// runes, in a random order (a few still-unresolved characters keep
// reshuffling each frame) — an "encrypting"/"decrypting" reveal effect.
function playTextGlitchAnimation(overlay, text, direction, durationMs, onDone) {
  const length = text.length;
  if (length === 0) {
    overlay.textContent = "";
    onDone?.();
    return;
  }

  const steps = Math.max(10, Math.min(22, length + 6));
  const stepDelay = durationMs / steps;
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const resolvedAt = new Array(length);
  order.forEach((pos, orderIndex) => {
    resolvedAt[pos] = orderIndex;
  });

  let frame = 0;
  function tick() {
    frame++;
    const resolvedCount = Math.round((frame / steps) * length);
    let out = "";
    for (let i = 0; i < length; i++) {
      const isResolved = resolvedAt[i] < resolvedCount;
      const showRune = direction === "encrypt" ? isResolved : !isResolved;
      out += showRune ? RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)] : text[i];
    }
    overlay.textContent = out;

    if (frame < steps) {
      setTimeout(tick, stepDelay);
    } else {
      onDone?.();
    }
  }
  tick();
}

function playIconGlitchFlicker(overlay, durationMs, onDone) {
  const steps = 10;
  const stepDelay = durationMs / steps;
  let frame = 0;
  function tick() {
    frame++;
    overlay.textContent = randomRuneString(1);
    if (frame < steps) {
      setTimeout(tick, stepDelay);
    } else {
      onDone?.();
    }
  }
  tick();
}

function positionOverlayOver(target, overlay) {
  overlay.style.left = `${target.offsetLeft}px`;
  overlay.style.top = `${target.offsetTop}px`;
  overlay.style.width = `${target.offsetWidth}px`;
  overlay.style.height = `${target.offsetHeight}px`;
}

const VISIBILITY_ANIM_DURATION = 550;

// Plays an "encrypting" (hide) or "decrypting" (show) animation on a row's
// name/link/icon fields, then commits the actual hidden flag once every
// field has finished settling — the tile on the main row only appears or
// disappears once its item is fully encrypted/decrypted.
function animateVisibilityToggle(index, fields) {
  const item = loadShortcuts()[index];
  if (!item) return;
  const willHide = !item.hidden;

  if (fields.visibilityBtn) fields.visibilityBtn.disabled = true;

  if (prefersReducedMotion) {
    const current = loadShortcuts();
    current[index] = { ...current[index], hidden: willHide };
    saveShortcuts(current);
    renderShortcutsRow();
    renderEditor();
    return;
  }

  const textFields = [];
  if (fields.nameInput) textFields.push({ input: fields.nameInput, extraClass: undefined });
  if (fields.urlInput) textFields.push({ input: fields.urlInput, extraClass: "shortcut-edit-glitch-overlay-url" });

  let pending = textFields.length + (fields.iconWrap ? 1 : 0);
  const settle = () => {
    pending -= 1;
    if (pending > 0) return;
    const current = loadShortcuts();
    if (!current[index]) return;
    current[index] = { ...current[index], hidden: willHide };
    saveShortcuts(current);
    renderShortcutsRow();
    renderEditor();
  };

  textFields.forEach(({ input, extraClass }) => {
    let overlay = input.nextElementSibling;
    if (!overlay || !overlay.classList.contains("shortcut-edit-glitch-overlay")) {
      overlay = document.createElement("span");
      overlay.className = "shortcut-edit-glitch-overlay";
      if (extraClass) overlay.classList.add(extraClass);
      overlay.setAttribute("aria-hidden", "true");
      input.insertAdjacentElement("afterend", overlay);
    }
    positionOverlayOver(input, overlay);
    overlay.style.opacity = "1";
    // Pull this overlay out of the passive shuffling loop while we
    // hand-animate it, so the two don't fight over its textContent.
    glitchOverlays = glitchOverlays.filter((pair) => pair.overlay !== overlay);

    playTextGlitchAnimation(overlay, input.value, willHide ? "encrypt" : "decrypt", VISIBILITY_ANIM_DURATION, () => {
      if (!willHide) overlay.remove();
      settle();
    });
  });

  if (fields.iconWrap) {
    let overlay = fields.iconWrap.nextElementSibling;
    if (!overlay || !overlay.classList.contains("shortcut-edit-glitch-icon-overlay")) {
      overlay = document.createElement("span");
      overlay.className = "shortcut-edit-glitch-icon-overlay";
      overlay.setAttribute("aria-hidden", "true");
      fields.iconWrap.insertAdjacentElement("afterend", overlay);
    }
    positionOverlayOver(fields.iconWrap, overlay);
    glitchIconOverlays = glitchIconOverlays.filter((pair) => pair.overlay !== overlay);

    playIconGlitchFlicker(overlay, VISIBILITY_ANIM_DURATION, () => {
      if (!willHide) overlay.remove();
      settle();
    });
  }
}

// Tiles are a fixed pixel width, so how many fit per page depends on the
// viewport (phone vs. tablet vs. desktop) rather than a constant.
function computePageSize() {
  const available = shortcutsWrap.clientWidth - NAV_RESERVE;
  if (available <= 0) return MAX_PAGE_SIZE;
  const fit = Math.floor((available + TILE_GAP) / (TILE_SIZE + TILE_GAP));
  return Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, fit));
}

function resizeIconFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // SVGs with no explicit width/height/viewBox can report 0 for both
      // (naturalWidth/naturalHeight), which would otherwise crop to nothing;
      // fall back to drawing them straight into the target square instead.
      const width = img.naturalWidth || ICON_DIMENSION;
      const height = img.naturalHeight || ICON_DIMENSION;
      const size = Math.min(width, height);
      const sx = (width - size) / 2;
      const sy = (height - size) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = ICON_DIMENSION;
      canvas.height = ICON_DIMENSION;
      canvas
        .getContext("2d")
        .drawImage(img, sx, sy, size, size, 0, 0, ICON_DIMENSION, ICON_DIMENSION);

      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("image-decode-failed"));
    };
    img.src = objectUrl;
  });
}

function loadShortcuts() {
  return readJsonArray(SHORTCUTS_KEY) ?? DEFAULT_SHORTCUTS.slice();
}

function saveShortcuts(list) {
  localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(list));
}

function normalizeUrl(url) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  // Only http(s) links are ever rendered as a real href; anything else (javascript:,
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

const WHATSAPP_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#25D366" viewBox="0 0 24 24">
  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
</svg>`;

// Some icons are drawn inline instead of fetched as an image, either to
// follow the theme via currentColor, or because the favicon service returns
// a broken/generic result for that domain.
const SVG_ICON_OVERRIDES = {
  "github.com": GITHUB_ICON,
  "web.whatsapp.com": WHATSAPP_ICON,
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

function renderIcon(container, url, customIcon) {
  container.replaceChildren();
  if (customIcon) {
    const img = document.createElement("img");
    img.src = customIcon;
    img.alt = "";
    container.append(img);
    return;
  }
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

let rowDragSrcIndex = null;
let rowDragSrcIsFolder = false;

function clearRowDragIndicators() {
  shortcutsRow.querySelectorAll(".shortcut-tile").forEach((el) => {
    el.classList.remove("drag-over-left", "drag-over-right", "drag-over-into", "dragging");
  });
}

function setRowDragIndicator(targetTile, position) {
  shortcutsRow.querySelectorAll(".shortcut-tile").forEach((el) => {
    el.classList.toggle("drag-over-left", el === targetTile && position === "before");
    el.classList.toggle("drag-over-right", el === targetTile && position === "after");
    el.classList.toggle("drag-over-into", el === targetTile && position === "into");
  });
}

function createFolderIconGrid(items, large) {
  const grid = document.createElement("span");
  grid.className = large ? "shortcut-folder-mini-grid shortcut-folder-mini-grid-lg" : "shortcut-folder-mini-grid";
  items.slice(0, 4).forEach((child) => {
    const cell = document.createElement("span");
    cell.className = "shortcut-folder-mini-cell";
    renderIcon(cell, child.url, child.icon);
    grid.append(cell);
  });
  return grid;
}

// Shared drag-to-reorder logic for both plain shortcuts and folders in the
// main row. Dropping a plain shortcut on the middle third of a folder tile
// files it into that folder instead of reordering past it.
function attachRowDragHandlers(el, index, isFolder) {
  el.addEventListener("dragstart", (e) => {
    rowDragSrcIndex = index;
    rowDragSrcIsFolder = isFolder;
    el.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.setDragImage(el, e.offsetX, e.offsetY);
  });

  el.addEventListener("dragend", () => {
    clearRowDragIndicators();
    rowDragSrcIndex = null;
    rowDragSrcIsFolder = false;
  });

  el.addEventListener("dragover", (e) => {
    if (rowDragSrcIndex === null || index === rowDragSrcIndex) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const canDropInto = isFolder && !rowDragSrcIsFolder && relX > rect.width * 0.25 && relX < rect.width * 0.75;
    setRowDragIndicator(el, canDropInto ? "into" : relX > rect.width / 2 ? "after" : "before");
  });

  el.addEventListener("drop", (e) => {
    e.preventDefault();
    if (rowDragSrcIndex === null || index === rowDragSrcIndex) return;

    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const canDropInto = isFolder && !rowDragSrcIsFolder && relX > rect.width * 0.25 && relX < rect.width * 0.75;

    const current = loadShortcuts();
    const [moved] = current.splice(rowDragSrcIndex, 1);

    if (canDropInto) {
      const targetIndex = rowDragSrcIndex < index ? index - 1 : index;
      const folder = current[targetIndex];
      if (folder?.folder) {
        folder.items.push(moved);
      } else {
        current.splice(targetIndex, 0, moved);
      }
    } else {
      const isAfter = relX > rect.width / 2;
      let targetIndex = index + (isAfter ? 1 : 0);
      if (rowDragSrcIndex < targetIndex) targetIndex -= 1;
      current.splice(targetIndex, 0, moved);
    }

    saveShortcuts(current);
    rowDragSrcIndex = null;
    rowDragSrcIsFolder = false;
    renderShortcutsRow();
    renderEditor();
  });
}

function renderShortcutsRow() {
  const list = loadShortcuts();
  shortcutsRow.replaceChildren();

  let visibleCount = 0;
  list.forEach((item, index) => {
    if (item.hidden) return;

    if (item.folder) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shortcut-tile shortcut-tile-folder";
      if (index === pendingCreatedIndex) btn.classList.add("shortcut-tile-created");
      btn.dataset.index = String(index);
      btn.draggable = true;

      btn.append(createFolderIconGrid(item.items ?? [], true));

      const folderName = item.name?.trim();
      if (folderName) {
        const label = document.createElement("span");
        label.className = "shortcut-tile-label";
        label.textContent = folderName;
        btn.append(label);
      } else {
        // No name set: show the icon grid alone, enlarged like a nameless
        // shortcut, instead of leaving room for an invisible label.
        btn.classList.add("shortcut-tile-icon-only");
        btn.setAttribute("aria-label", "Dossier");
        btn.title = "Dossier";
      }

      btn.addEventListener("click", () => openFolder(index));

      attachRowDragHandlers(btn, index, true);

      shortcutsRow.append(btn);
      visibleCount += 1;
      return;
    }

    const safeUrl = normalizeUrl(item.url);
    if (!safeUrl) return;

    const a = document.createElement("a");
    a.className = "shortcut-tile";
    a.href = safeUrl;
    a.target = "_blank";
    a.rel = "noopener";
    a.dataset.index = String(index);
    a.draggable = true;

    const iconWrap = document.createElement("span");
    iconWrap.className = "shortcut-tile-icon";
    renderIcon(iconWrap, item.url, item.icon);
    if (iconWrap.hasChildNodes()) a.append(iconWrap);

    const trimmedName = item.name?.trim();
    if (trimmedName) {
      const span = document.createElement("span");
      span.className = "shortcut-tile-label";
      span.textContent = trimmedName;
      a.append(span);
    } else {
      // No name set: show the icon alone, enlarged and centered so the tile
      // doesn't look like it's leaving room for an invisible label.
      a.classList.add("shortcut-tile-icon-only");
      const label = hostnameOf(item.url);
      if (label) {
        a.setAttribute("aria-label", label);
        a.title = label;
      }
    }

    attachRowDragHandlers(a, index, false);

    shortcutsRow.append(a);
    visibleCount += 1;
  });

  pendingCreatedIndex = null;

  pageSize = computePageSize();
  const totalPages = Math.max(1, Math.ceil(visibleCount / pageSize));
  page = Math.min(page, totalPages - 1);
  const paginated = visibleCount > pageSize;

  shortcutsWrap.classList.toggle("paginated", paginated);
  prevBtn.hidden = !paginated;
  nextBtn.hidden = !paginated;
  if (paginated) {
    shortcutsViewport.style.width = `${pageSize * TILE_SIZE + (pageSize - 1) * TILE_GAP}px`;
    prevBtn.disabled = page === 0;
    nextBtn.disabled = page === totalPages - 1;
    updateCarouselPosition();
  } else {
    shortcutsViewport.style.width = "";
    shortcutsRow.style.transform = "";
  }
}

function updateCarouselPosition() {
  const target = shortcutsRow.children[page * pageSize];
  shortcutsRow.style.transform = target ? `translateX(-${target.offsetLeft}px)` : "";
}

prevBtn.addEventListener("click", () => {
  page = Math.max(0, page - 1);
  prevBtn.disabled = page === 0;
  nextBtn.disabled = false;
  updateCarouselPosition();
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(shortcutsRow.children.length / pageSize));
  page = Math.min(totalPages - 1, page + 1);
  nextBtn.disabled = page === totalPages - 1;
  prevBtn.disabled = false;
  updateCarouselPosition();
});

let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    page = 0;
    renderShortcutsRow();
  }, 150);
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
  glitchOverlays = [];
  glitchIconOverlays = [];

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

    li.classList.toggle("shortcut-edit-item-hidden", !!item.hidden);

    if (item.folder) {
      const isExpanded = expandedFolders.has(index);
      li.classList.toggle("expanded", isExpanded);
      li.dataset.folderIndex = String(index);

      const iconWrap = document.createElement("span");
      iconWrap.className = "shortcut-edit-icon-wrap";
      iconWrap.append(createFolderIconGrid(item.items ?? []));

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className = "shortcut-edit-name";
      nameInput.placeholder = "Dossier";
      nameInput.maxLength = 24;
      nameInput.value = item.name ?? "";

      const count = item.items?.length ?? 0;
      const countLabel = document.createElement("span");
      countLabel.className = "shortcut-edit-folder-count";
      countLabel.textContent = `${count} raccourci${count > 1 ? "s" : ""}`;

      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "shortcut-edit-folder-toggle";
      toggleBtn.setAttribute("aria-label", isExpanded ? "Replier le dossier" : "Déplier le dossier");
      toggleBtn.setAttribute("aria-expanded", String(isExpanded));
      toggleBtn.innerHTML = CHEVRON_ICON;

      const visibilityBtn = document.createElement("button");
      visibilityBtn.type = "button";
      visibilityBtn.className = "shortcut-edit-visibility";
      visibilityBtn.classList.toggle("is-hidden-item", !!item.hidden);
      visibilityBtn.setAttribute("aria-label", item.hidden ? "Afficher ce dossier" : "Masquer ce dossier");
      visibilityBtn.innerHTML = item.hidden ? EYE_OFF_ICON : EYE_ICON;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "shortcut-edit-remove";
      removeBtn.setAttribute("aria-label", "Supprimer ce dossier");
      removeBtn.innerHTML = REMOVE_ICON;

      row.append(grip, iconWrap, nameInput, countLabel, visibilityBtn, toggleBtn, removeBtn);
      li.append(row);
      if (item.hidden) {
        createGlitchOverlay(nameInput);
        createGlitchIconOverlay(iconWrap);
      }

      const itemsWrap = document.createElement("div");
      itemsWrap.className = "shortcut-edit-folder-items-wrap";
      if (!isExpanded) itemsWrap.classList.add("is-collapsed");

      const itemsInner = document.createElement("div");
      itemsInner.className = "shortcut-edit-folder-items-inner";

      const itemsList = document.createElement("ul");
      itemsList.className = "shortcut-edit-folder-items";

      (item.items ?? []).forEach((child, itemIndex) => {
        const childLi = document.createElement("li");
        childLi.className = "shortcut-edit-item shortcut-edit-folder-item";
        childLi.dataset.itemIndex = String(itemIndex);

        const childRow = document.createElement("div");
        childRow.className = "shortcut-edit-row";

        const childIconWrap = document.createElement("span");
        childIconWrap.className = "shortcut-edit-icon-wrap";

        const childIcon = document.createElement("button");
        childIcon.type = "button";
        childIcon.className = "shortcut-edit-icon";
        childIcon.title = "Changer l'icône";
        childIcon.setAttribute("aria-label", "Changer l'icône de ce raccourci");
        renderIcon(childIcon, child.url, child.icon);

        childIcon.addEventListener("click", () => {
          iconEditIndex = { folderIndex: index, itemIndex };
          iconInput.click();
        });

        const childIconReset = document.createElement("button");
        childIconReset.type = "button";
        childIconReset.className = "shortcut-edit-icon-reset";
        childIconReset.title = "Revenir à l'icône automatique";
        childIconReset.setAttribute("aria-label", "Revenir à l'icône automatique");
        childIconReset.innerHTML = REMOVE_ICON;
        childIconReset.hidden = !child.icon;

        childIconReset.addEventListener("click", (e) => {
          e.stopPropagation();
          const current = loadShortcuts();
          const folder = current[index];
          if (!folder?.folder) return;
          delete folder.items[itemIndex].icon;
          saveShortcuts(current);
          renderIcon(childIcon, childUrlInput.value);
          childIconReset.hidden = true;
          renderShortcutsRow();
          refreshFolderPopup(index);
        });

        childIconWrap.append(childIcon, childIconReset);

        const childNameInput = document.createElement("input");
        childNameInput.type = "text";
        childNameInput.className = "shortcut-edit-name";
        childNameInput.placeholder = "Nom";
        childNameInput.maxLength = 20;
        childNameInput.value = child.name ?? "";

        const childUrlInput = document.createElement("input");
        childUrlInput.type = "text";
        childUrlInput.className = "shortcut-edit-url";
        childUrlInput.placeholder = "https://exemple.com";
        childUrlInput.value = child.url ?? "";

        const childRemoveBtn = document.createElement("button");
        childRemoveBtn.type = "button";
        childRemoveBtn.className = "shortcut-edit-remove";
        childRemoveBtn.setAttribute("aria-label", "Supprimer ce raccourci");
        childRemoveBtn.innerHTML = REMOVE_ICON;

        childRow.append(childIconWrap, childNameInput, childUrlInput, childRemoveBtn);
        childLi.append(childRow);
        itemsList.append(childLi);

        const commitChild = () => {
          const current = loadShortcuts();
          const folder = current[index];
          if (!folder?.folder) return;
          folder.items[itemIndex] = { ...folder.items[itemIndex], name: childNameInput.value, url: childUrlInput.value };
          saveShortcuts(current);
          renderIcon(childIcon, childUrlInput.value, folder.items[itemIndex].icon);
          renderShortcutsRow();
          refreshFolderPopup(index);
        };

        childNameInput.addEventListener("input", commitChild);
        childUrlInput.addEventListener("input", () => {
          dedupeUrlScheme(childUrlInput);
          commitChild();
        });

        childRemoveBtn.addEventListener("click", () => {
          const current = loadShortcuts();
          const folder = current[index];
          if (!folder?.folder) return;
          folder.items.splice(itemIndex, 1);
          if (folder.items.length === 0) {
            current.splice(index, 1);
            expandedFolders.delete(index);
          }
          saveShortcuts(current);
          renderShortcutsRow();
          renderEditor();
          refreshFolderPopup(index);
        });
      });

      itemsInner.append(itemsList);
      itemsWrap.append(itemsInner);
      li.append(itemsWrap);
      editList.append(li);

      toggleBtn.addEventListener("click", () => {
        if (expandedFolders.has(index)) {
          expandedFolders.delete(index);
        } else {
          expandedFolders.add(index);
        }
        renderEditor();
      });

      visibilityBtn.addEventListener("click", () => {
        animateVisibilityToggle(index, { nameInput, iconWrap, visibilityBtn });
      });

      nameInput.addEventListener("input", () => {
        const current = loadShortcuts();
        current[index] = { ...current[index], name: nameInput.value };
        saveShortcuts(current);
        renderShortcutsRow();
        refreshFolderPopup(index);
      });

      removeBtn.addEventListener("click", () => {
        const current = loadShortcuts();
        current.splice(index, 1);
        expandedFolders.delete(index);
        saveShortcuts(current);
        renderShortcutsRow();
        renderEditor();
        refreshFolderPopup(index);
      });
    } else {
      const iconWrap = document.createElement("span");
      iconWrap.className = "shortcut-edit-icon-wrap";

      const icon = document.createElement("button");
      icon.type = "button";
      icon.className = "shortcut-edit-icon";
      icon.title = "Changer l'icône";
      icon.setAttribute("aria-label", "Changer l'icône de ce raccourci");
      renderIcon(icon, item.url, item.icon);

      icon.addEventListener("click", () => {
        iconEditIndex = index;
        iconInput.click();
      });

      const iconReset = document.createElement("button");
      iconReset.type = "button";
      iconReset.className = "shortcut-edit-icon-reset";
      iconReset.title = "Revenir à l'icône automatique";
      iconReset.setAttribute("aria-label", "Revenir à l'icône automatique");
      iconReset.innerHTML = REMOVE_ICON;
      iconReset.hidden = !item.icon;

      iconReset.addEventListener("click", (e) => {
        e.stopPropagation();
        const current = loadShortcuts();
        delete current[index].icon;
        saveShortcuts(current);
        renderIcon(icon, urlInput.value);
        iconReset.hidden = true;
        renderShortcutsRow();
      });

      iconWrap.append(icon, iconReset);

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className = "shortcut-edit-name";
      nameInput.placeholder = "Nom";
      nameInput.maxLength = 20;
      nameInput.value = item.name ?? "";

      const urlInput = document.createElement("input");
      urlInput.type = "text";
      urlInput.className = "shortcut-edit-url";
      urlInput.placeholder = "https://exemple.com";
      urlInput.value = item.url ?? "";

      const visibilityBtn = document.createElement("button");
      visibilityBtn.type = "button";
      visibilityBtn.className = "shortcut-edit-visibility";
      visibilityBtn.classList.toggle("is-hidden-item", !!item.hidden);
      visibilityBtn.setAttribute("aria-label", item.hidden ? "Afficher ce raccourci" : "Masquer ce raccourci");
      visibilityBtn.innerHTML = item.hidden ? EYE_OFF_ICON : EYE_ICON;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "shortcut-edit-remove";
      removeBtn.setAttribute("aria-label", "Supprimer ce raccourci");
      removeBtn.innerHTML = REMOVE_ICON;

      row.append(grip, iconWrap, nameInput, urlInput, visibilityBtn, removeBtn);

      li.append(row);
      editList.append(li);

      if (item.hidden) {
        createGlitchOverlay(nameInput);
        createGlitchOverlay(urlInput, "shortcut-edit-glitch-overlay-url");
        createGlitchIconOverlay(iconWrap);
      }

      visibilityBtn.addEventListener("click", () => {
        animateVisibilityToggle(index, { nameInput, urlInput, iconWrap, visibilityBtn });
      });

      const commit = () => {
        const current = loadShortcuts();
        current[index] = { ...current[index], name: nameInput.value, url: urlInput.value };
        saveShortcuts(current);
        renderIcon(icon, urlInput.value, current[index].icon);
        renderShortcutsRow();
      };

      nameInput.addEventListener("input", commit);
      urlInput.addEventListener("input", () => {
        dedupeUrlScheme(urlInput);
        commit();
      });

      removeBtn.addEventListener("click", () => {
        const current = loadShortcuts();
        current.splice(index, 1);
        saveShortcuts(current);
        renderShortcutsRow();
        renderEditor();
      });
    }

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
  current.push({ name: "", url: "https://" });
  saveShortcuts(current);
  renderEditor();
  editList.querySelector(".shortcut-edit-item:last-child .shortcut-edit-name")?.focus();
});

iconInput.addEventListener("change", async () => {
  const file = iconInput.files[0];
  const target = iconEditIndex;
  iconInput.value = "";
  iconEditIndex = null;
  if (!file || target === null) return;

  if (!file.type.startsWith("image/")) return;
  if (file.size > ICON_MAX_SOURCE_SIZE) return;

  try {
    const dataUrl = await resizeIconFile(file);
    const current = loadShortcuts();

    if (typeof target === "number") {
      if (!current[target]) return;
      current[target].icon = dataUrl;
    } else {
      const folder = current[target.folderIndex];
      if (!folder?.folder || !folder.items[target.itemIndex]) return;
      folder.items[target.itemIndex].icon = dataUrl;
    }

    saveShortcuts(current);
    renderShortcutsRow();
    renderEditor();
    if (typeof target !== "number") refreshFolderPopup(target.folderIndex);
  } catch {
    // Ignore: the icon just stays whatever it was before the failed upload.
  }
});

let contextMenuTarget = null;

function closeContextMenu() {
  contextMenu.hidden = true;
}

function openContextMenu(target, x, y) {
  contextMenuTarget = target;

  contextMenuEditBtn.hidden = target.type === "folder";
  contextMenuMakeFolderBtn.hidden = target.type !== "shortcut";
  contextMenuRenameBtn.hidden = target.type !== "folder";
  contextMenuRemoveFromFolderBtn.hidden = target.type !== "folder-item";

  contextMenu.hidden = false;
  contextMenu.style.left = "0px";
  contextMenu.style.top = "0px";

  const rect = contextMenu.getBoundingClientRect();
  const maxX = Math.max(8, window.innerWidth - rect.width - 8);
  const maxY = Math.max(8, window.innerHeight - rect.height - 8);
  contextMenu.style.left = `${Math.min(x, maxX)}px`;
  contextMenu.style.top = `${Math.min(y, maxY)}px`;
}

shortcutsRow.addEventListener("contextmenu", (e) => {
  const tile = e.target.closest(".shortcut-tile");
  if (!tile) return;
  e.preventDefault();
  const index = Number(tile.dataset.index);
  const type = tile.classList.contains("shortcut-tile-folder") ? "folder" : "shortcut";
  openContextMenu({ type, index }, e.clientX, e.clientY);
});

folderPopupGrid.addEventListener("contextmenu", (e) => {
  const tile = e.target.closest(".shortcut-tile");
  if (!tile || openFolderIndex === null) return;
  e.preventDefault();
  openContextMenu(
    { type: "folder-item", folderIndex: openFolderIndex, itemIndex: Number(tile.dataset.index) },
    e.clientX,
    e.clientY
  );
});

// The settings overlay fades in via a visibility/opacity transition, and an
// expanding folder animates its own height, so the target input isn't
// actually focusable yet in this same tick — focusing it has to wait a beat
// for that to commit. A timer (unlike rAF) fires regardless of whether the
// page is actively compositing new frames.
function focusUrlInputSoon(getRow) {
  setTimeout(() => {
    const row = getRow();
    row?.scrollIntoView({ block: "nearest" });
    const urlInput = row?.querySelector(".shortcut-edit-url");
    urlInput?.focus();
    urlInput?.select();
  }, 50);
}

contextMenuEditBtn.addEventListener("click", () => {
  const target = contextMenuTarget;
  closeContextMenu();
  if (!target) return;

  if (target.type === "shortcut") {
    openSettings("shortcuts");
    focusUrlInputSoon(() => editList.children[target.index]);
    return;
  }

  if (target.type === "folder-item") {
    closeFolderPopup();
    openSettings("shortcuts");
    expandedFolders.add(target.folderIndex);
    renderEditor();
    focusUrlInputSoon(() => {
      const folderRow = editList.querySelector(`[data-folder-index="${target.folderIndex}"]`);
      return folderRow?.querySelector(`[data-item-index="${target.itemIndex}"]`);
    });
  }
});

contextMenuMakeFolderBtn.addEventListener("click", () => {
  const target = contextMenuTarget;
  closeContextMenu();
  if (!target || target.type !== "shortcut") return;
  const current = loadShortcuts();
  const shortcut = current[target.index];
  if (!shortcut) return;
  current[target.index] = { name: "Nouveau dossier", folder: true, items: [shortcut] };
  saveShortcuts(current);
  pendingCreatedIndex = target.index;
  renderShortcutsRow();
  renderEditor();
});

contextMenuRenameBtn.addEventListener("click", () => {
  const target = contextMenuTarget;
  closeContextMenu();
  if (!target || target.type !== "folder") return;
  openFolder(target.index, { focusName: true });
});

contextMenuRemoveFromFolderBtn.addEventListener("click", () => {
  const target = contextMenuTarget;
  closeContextMenu();
  if (!target || target.type !== "folder-item") return;
  const current = loadShortcuts();
  const folder = current[target.folderIndex];
  if (!folder?.folder) return;
  const [moved] = folder.items.splice(target.itemIndex, 1);
  if (folder.items.length === 0) current.splice(target.folderIndex, 1);
  if (moved) current.push(moved);
  saveShortcuts(current);
  renderShortcutsRow();
  renderEditor();
  refreshFolderPopup(target.folderIndex);
});

contextMenuDeleteBtn.addEventListener("click", () => {
  const target = contextMenuTarget;
  closeContextMenu();
  if (!target) return;
  const current = loadShortcuts();

  if (target.type === "folder-item") {
    const folder = current[target.folderIndex];
    if (!folder?.folder) return;
    folder.items.splice(target.itemIndex, 1);
    if (folder.items.length === 0) current.splice(target.folderIndex, 1);
    saveShortcuts(current);
    renderShortcutsRow();
    renderEditor();
    refreshFolderPopup(target.folderIndex);
    return;
  }

  current.splice(target.index, 1);
  saveShortcuts(current);
  renderShortcutsRow();
  renderEditor();
  if (target.type === "folder") closeFolderPopup();
});

onEscape(closeContextMenu);
onClickOutside([contextMenu], closeContextMenu);

// Folder popup: opened by clicking a folder tile in the main row.

let openFolderIndex = null;
let folderDragSrcIndex = null;

function clearFolderDragIndicators() {
  folderPopupGrid.querySelectorAll(".shortcut-tile").forEach((el) => {
    el.classList.remove("drag-over-left", "drag-over-right", "dragging");
  });
}

function setFolderDragIndicator(targetTile, position) {
  folderPopupGrid.querySelectorAll(".shortcut-tile").forEach((el) => {
    el.classList.toggle("drag-over-left", el === targetTile && position === "before");
    el.classList.toggle("drag-over-right", el === targetTile && position === "after");
  });
}

function renderFolderPopup(index) {
  const current = loadShortcuts();
  const folder = current[index];
  if (!folder?.folder) {
    closeFolderPopup();
    return;
  }

  openFolderIndex = index;
  folderNameInput.value = folder.name ?? "";
  folderPopupGrid.replaceChildren();
  folderDragSrcIndex = null;

  const items = folder.items ?? [];
  folderPopupEmpty.hidden = items.length > 0;

  items.forEach((item, itemIndex) => {
    const safeUrl = normalizeUrl(item.url);
    if (!safeUrl) return;

    const a = document.createElement("a");
    a.className = "shortcut-tile";
    a.href = safeUrl;
    a.target = "_blank";
    a.rel = "noopener";
    a.dataset.index = String(itemIndex);
    a.draggable = true;

    const iconWrap = document.createElement("span");
    iconWrap.className = "shortcut-tile-icon";
    renderIcon(iconWrap, item.url, item.icon);
    if (iconWrap.hasChildNodes()) a.append(iconWrap);

    const trimmedName = item.name?.trim();
    if (trimmedName) {
      const span = document.createElement("span");
      span.className = "shortcut-tile-label";
      span.textContent = trimmedName;
      a.append(span);
    } else {
      a.classList.add("shortcut-tile-icon-only");
      const label = hostnameOf(item.url);
      if (label) {
        a.setAttribute("aria-label", label);
        a.title = label;
      }
    }

    // Reordering within a folder: same before/after drag logic as the main
    // row, scoped to this folder's own items array.
    a.addEventListener("dragstart", (e) => {
      folderDragSrcIndex = itemIndex;
      a.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(itemIndex));
      e.dataTransfer.setDragImage(a, e.offsetX, e.offsetY);
    });

    a.addEventListener("dragend", () => {
      clearFolderDragIndicators();
      folderDragSrcIndex = null;
    });

    a.addEventListener("dragover", (e) => {
      if (folderDragSrcIndex === null || itemIndex === folderDragSrcIndex) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const rect = a.getBoundingClientRect();
      const isAfter = e.clientX - rect.left > rect.width / 2;
      setFolderDragIndicator(a, isAfter ? "after" : "before");
    });

    a.addEventListener("drop", (e) => {
      e.preventDefault();
      if (folderDragSrcIndex === null || itemIndex === folderDragSrcIndex) return;

      const rect = a.getBoundingClientRect();
      const isAfter = e.clientX - rect.left > rect.width / 2;
      let targetIndex = itemIndex + (isAfter ? 1 : 0);

      const currentList = loadShortcuts();
      const targetFolder = currentList[index];
      if (!targetFolder?.folder) return;
      const [moved] = targetFolder.items.splice(folderDragSrcIndex, 1);
      if (folderDragSrcIndex < targetIndex) targetIndex -= 1;
      targetFolder.items.splice(targetIndex, 0, moved);

      saveShortcuts(currentList);
      folderDragSrcIndex = null;
      renderShortcutsRow();
      renderEditor();
      renderFolderPopup(index);
    });

    folderPopupGrid.append(a);
  });
}

// Re-renders the popup if it's still showing this folder, or closes it if
// the folder was emptied out (and pruned) by the mutation that just ran.
function refreshFolderPopup(index) {
  if (openFolderIndex !== index) return;
  const current = loadShortcuts();
  if (current[index]?.folder) {
    renderFolderPopup(index);
  } else {
    closeFolderPopup();
  }
}

function openFolder(index, { focusName } = {}) {
  renderFolderPopup(index);
  if (openFolderIndex === null) return;
  folderOverlay.classList.add("open");
  if (focusName) {
    folderNameInput.focus();
    folderNameInput.select();
  }
}

function closeFolderPopup() {
  folderOverlay.classList.remove("open");
  openFolderIndex = null;
}

folderCloseBtn.addEventListener("click", closeFolderPopup);

folderNameInput.addEventListener("input", () => {
  if (openFolderIndex === null) return;
  const current = loadShortcuts();
  const folder = current[openFolderIndex];
  if (!folder?.folder) return;
  folder.name = folderNameInput.value;
  saveShortcuts(current);
  renderShortcutsRow();
});

// Backdrop-click-to-close, tracked from mousedown rather than a generic
// "outside click" listener: the click that opens the popup (on a folder
// tile) would otherwise immediately count as "outside" and close it again.
let folderOverlayMouseDownTarget = null;

folderOverlay.addEventListener("mousedown", (e) => {
  folderOverlayMouseDownTarget = e.target;
});

folderOverlay.addEventListener("click", (e) => {
  if (e.target === folderOverlay && folderOverlayMouseDownTarget === folderOverlay) {
    closeFolderPopup();
  }
});

onEscape(closeFolderPopup);

renderShortcutsRow();
renderEditor();
