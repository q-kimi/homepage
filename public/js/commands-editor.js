import { loadCommands, saveCommands, deriveHome } from "./commands.js";
import { dedupeUrlScheme } from "./dom-utils.js";

const REMOVE_ICON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none">
  <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

const editList = document.getElementById("commands-edit-list");
const addBtn = document.getElementById("commands-add-btn");

function normalizeKey(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function renderEditor() {
  const list = loadCommands();
  editList.replaceChildren();

  list.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "command-edit-item";

    const row = document.createElement("div");
    row.className = "command-edit-row";

    const slash = document.createElement("span");
    slash.className = "command-edit-slash";
    slash.textContent = "/";

    const keyInput = document.createElement("input");
    keyInput.type = "text";
    keyInput.className = "command-edit-key";
    keyInput.placeholder = "yt";
    keyInput.maxLength = 12;
    keyInput.value = item.key ?? "";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "command-edit-name";
    nameInput.placeholder = "Nom";
    nameInput.maxLength = 24;
    nameInput.value = item.name ?? "";

    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.className = "command-edit-url";
    urlInput.placeholder = "https://exemple.com/search?q=";
    urlInput.value = item.url ?? "";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "command-edit-remove";
    removeBtn.setAttribute("aria-label", "Supprimer cette commande");
    removeBtn.innerHTML = REMOVE_ICON;

    row.append(slash, keyInput, nameInput, urlInput, removeBtn);
    li.append(row);
    editList.append(li);

    function commit() {
      const current = loadCommands();
      current[index] = {
        key: normalizeKey(keyInput.value),
        name: nameInput.value.trim(),
        url: urlInput.value.trim(),
        home: deriveHome(urlInput.value.trim()),
      };
      saveCommands(current);
    }

    keyInput.addEventListener("input", commit);
    nameInput.addEventListener("input", commit);
    urlInput.addEventListener("input", () => {
      dedupeUrlScheme(urlInput);
      commit();
    });

    removeBtn.addEventListener("click", () => {
      const current = loadCommands();
      current.splice(index, 1);
      saveCommands(current);
      renderEditor();
    });
  });
}

addBtn.addEventListener("click", () => {
  const current = loadCommands();
  current.push({ key: "", name: "", url: "https://", home: "" });
  saveCommands(current);
  renderEditor();
  editList.querySelector(".command-edit-item:last-child .command-edit-key")?.focus();
});

renderEditor();
