const ENGINES = {
  google: {
    name: "Google",
    url: "https://www.google.com/search?q=",
  },
  bing: {
    name: "Bing",
    url: "https://www.bing.com/search?q=",
  },
  brave: {
    name: "Brave",
    url: "https://search.brave.com/search?q=",
  },
};

const ENGINE_STORAGE_KEY = "homepage.engine";

export const form = document.getElementById("search-form");
export const input = document.getElementById("search-input");
const engineToggle = document.getElementById("engine-toggle");
const engineMenu = document.getElementById("engine-menu");
const engineIcon = document.getElementById("engine-icon");
const engineName = document.getElementById("engine-name");

let currentEngine = localStorage.getItem(ENGINE_STORAGE_KEY) || "google";
if (!ENGINES[currentEngine]) currentEngine = "google";

function applyEngine(key) {
  currentEngine = key;
  localStorage.setItem(ENGINE_STORAGE_KEY, key);

  const option = engineMenu.querySelector(`li[data-engine="${key}"]`);
  engineIcon.innerHTML = option.querySelector(".engine-icon").innerHTML;
  engineName.textContent = ENGINES[key].name;

  engineMenu.querySelectorAll("li").forEach((li) => {
    li.classList.toggle("active", li.dataset.engine === key);
  });
}

function openEngineMenu() {
  engineMenu.classList.add("open");
  engineToggle.setAttribute("aria-expanded", "true");
}

function closeEngineMenu() {
  engineMenu.classList.remove("open");
  engineToggle.setAttribute("aria-expanded", "false");
}

engineToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  engineMenu.classList.contains("open") ? closeEngineMenu() : openEngineMenu();
});

engineMenu.addEventListener("click", (e) => {
  const li = e.target.closest("li[data-engine]");
  if (!li) return;
  applyEngine(li.dataset.engine);
  closeEngineMenu();
  input.focus();
});

document.addEventListener("click", (e) => {
  if (!engineMenu.contains(e.target) && !engineToggle.contains(e.target)) {
    closeEngineMenu();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeEngineMenu();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;
  window.location.href = ENGINES[currentEngine].url + encodeURIComponent(query);
});

applyEngine(currentEngine);
