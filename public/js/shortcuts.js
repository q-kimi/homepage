import { readJsonArray, onClickOutside, onEscape } from "./dom-utils.js";
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

function createFolderIconGrid(items) {
  const grid = document.createElement("span");
  grid.className = "shortcut-folder-mini-grid";
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
    if (item.folder) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shortcut-tile shortcut-tile-folder";
      if (index === pendingCreatedIndex) btn.classList.add("shortcut-tile-created");
      btn.dataset.index = String(index);
      btn.draggable = true;

      btn.append(createFolderIconGrid(item.items ?? []));

      const label = document.createElement("span");
      label.textContent = item.name?.trim() || "Dossier";
      btn.append(label);

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

    if (item.folder) {
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

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "shortcut-edit-remove";
      removeBtn.setAttribute("aria-label", "Supprimer ce dossier");
      removeBtn.innerHTML = REMOVE_ICON;

      row.append(grip, iconWrap, nameInput, countLabel, removeBtn);
      li.append(row);
      editList.append(li);

      nameInput.addEventListener("input", () => {
        const current = loadShortcuts();
        current[index] = { ...current[index], name: nameInput.value };
        saveShortcuts(current);
        renderShortcutsRow();
      });

      removeBtn.addEventListener("click", () => {
        const current = loadShortcuts();
        current.splice(index, 1);
        saveShortcuts(current);
        renderShortcutsRow();
        renderEditor();
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

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "shortcut-edit-remove";
      removeBtn.setAttribute("aria-label", "Supprimer ce raccourci");
      removeBtn.innerHTML = REMOVE_ICON;

      row.append(grip, iconWrap, nameInput, urlInput, removeBtn);

      li.append(row);
      editList.append(li);

      const commit = () => {
        const current = loadShortcuts();
        current[index] = { ...current[index], name: nameInput.value, url: urlInput.value };
        saveShortcuts(current);
        renderIcon(icon, urlInput.value, current[index].icon);
        renderShortcutsRow();
      };

      nameInput.addEventListener("input", commit);
      urlInput.addEventListener("input", commit);

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
  const index = iconEditIndex;
  iconInput.value = "";
  iconEditIndex = null;
  if (!file || index === null) return;

  if (!file.type.startsWith("image/")) return;
  if (file.size > ICON_MAX_SOURCE_SIZE) return;

  try {
    const dataUrl = await resizeIconFile(file);
    const current = loadShortcuts();
    if (!current[index]) return;
    current[index].icon = dataUrl;
    saveShortcuts(current);
    renderShortcutsRow();
    renderEditor();
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

  contextMenuEditBtn.hidden = target.type !== "shortcut";
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

contextMenuEditBtn.addEventListener("click", () => {
  const target = contextMenuTarget;
  closeContextMenu();
  if (!target || target.type !== "shortcut") return;
  openSettings("shortcuts");
  const row = editList.children[target.index];
  row?.scrollIntoView({ block: "nearest" });

  // The settings overlay fades in via a visibility/opacity transition, so the
  // input isn't actually focusable yet in this same tick — focusing it has
  // to wait a beat for that transition to commit. A timer (unlike rAF) fires
  // regardless of whether the page is actively compositing new frames.
  setTimeout(() => {
    const urlInput = row?.querySelector(".shortcut-edit-url");
    urlInput?.focus();
    urlInput?.select();
  }, 50);
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

    const iconWrap = document.createElement("span");
    iconWrap.className = "shortcut-tile-icon";
    renderIcon(iconWrap, item.url, item.icon);
    if (iconWrap.hasChildNodes()) a.append(iconWrap);

    const trimmedName = item.name?.trim();
    if (trimmedName) {
      const span = document.createElement("span");
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
