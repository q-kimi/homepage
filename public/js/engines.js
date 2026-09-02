import { onClickOutside, onEscape } from "./dom-utils.js";
import { CLAUDE_ICON, CHATGPT_ICON, GROK_ICON, MISTRAL_ICON, HUGGINGCHAT_ICON, PERPLEXITY_ICON } from "./ai-icons.js";
import { loadCommands } from "./commands.js";

const GOOGLE_ICON = `<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/960px-Google_Favicon_2025.svg.png" width="18" height="18" alt="">`;

const ECOSIA_ICON = `<img src="https://www.google.com/s2/favicons?sz=64&domain=ecosia.org" width="18" height="18" alt="">`;

const BING_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M11.97 7.569a.92.92 0 00-.805.863c-.013.195-.01.209.43 1.347 1 2.59 1.242 3.214 1.283 3.302.099.213.237.413.41.592.134.138.222.212.37.311.26.176.39.224 1.405.527.989.295 1.529.49 1.994.723.603.302 1.024.644 1.29 1.051.191.292.36.815.434 1.342.029.206.029.661 0 .847a2.491 2.491 0 01-.376 1.026c-.1.151-.065.126.081-.058.415-.52.838-1.408 1.054-2.213a6.728 6.728 0 00.102-3.012 6.626 6.626 0 00-3.291-4.53 104.157 104.157 0 00-1.322-.698l-.254-.133a737.941 737.941 0 01-1.575-.827c-.548-.29-.78-.406-.846-.426a1.376 1.376 0 00-.29-.045l-.093.01z" fill="url(#engine-bing-a)"/>
  <path d="M13.164 17.24a4.385 4.385 0 00-.202.125 511.45 511.45 0 00-1.795 1.115 163.087 163.087 0 01-.989.614l-.463.288a99.198 99.198 0 01-1.502.941c-.326.2-.704.334-1.09.387-.18.024-.52.024-.7 0a2.807 2.807 0 01-1.318-.538 3.665 3.665 0 01-.543-.545 2.837 2.837 0 01-.506-1.141 2.161 2.161 0 00-.041-.182c-.008-.008.006.138.032.33.027.199.085.487.147.733.482 1.907 1.85 3.457 3.705 4.195a6.31 6.31 0 001.658.412c.22.025.844.035 1.074.017 1.054-.08 1.972-.393 2.913-.992a325.28 325.28 0 01.937-.596l.384-.244.684-.435.234-.149.009-.005.025-.017.013-.007.172-.11.597-.38c.76-.481.987-.65 1.34-.998.148-.146.37-.394.381-.425.002-.007.042-.068.088-.136a2.49 2.49 0 00.373-1.023 4.181 4.181 0 000-.847 4.336 4.336 0 00-.318-1.137c-.224-.472-.7-.9-1.383-1.245a2.972 2.972 0 00-.406-.181c-.01 0-.646.392-1.413.87a7089.171 7089.171 0 00-1.658 1.031l-.439.274z" fill="url(#engine-bing-b)" fill-rule="nonzero"/>
  <path d="M4.003 14.946l.004 3.33.042.193c.134.604.366 1.04.77 1.445a2.701 2.701 0 001.955.814c.536 0 1-.135 1.479-.43l.703-.435.556-.346V8.003c0-2.306-.004-3.675-.012-3.782a2.734 2.734 0 00-.797-1.765c-.145-.144-.268-.24-.637-.496A1780.102 1780.102 0 015.762.362C5.406.115 5.38.098 5.271.059a.943.943 0 00-1.254.696C4.003.818 4 1.659 4 6.223v5.394H4l.003 3.329z" fill="url(#engine-bing-c)" fill-rule="nonzero"/>
</svg>`;

const BRAVE_ICON = `<svg width="18" height="18" viewBox="296 110 2176 2554" xmlns="http://www.w3.org/2000/svg">
  <path fill="url(#engine-brave-a)" d="M2395 723l60-147-170-176c-92-92-288-38-288-38l-222-252H992L769 363s-196-53-288 37L311 575l60 147-75 218 250 953c52 204 87 283 234 387l457 310c44 27 98 74 147 74s103-47 147-74l457-310c147-104 182-183 234-387l250-953z"/>
  <path fill="#ffffff" d="M1935 524s287 347 287 420c0 75-36 94-72 133l-215 230c-20 20-63 54-38 113 25 60 60 134 20 210-40 77-110 128-155 120a820 820 0 01-190-90c-38-25-160-126-160-165s126-110 150-124c23-16 130-78 132-102s2-30-30-90-88-140-80-192c10-52 100-80 167-105l207-78c16-8 12-15-36-20-48-4-183-22-244-5s-163 43-173 57c-8 14-16 14-7 62l58 315c4 40 12 67-30 77-44 10-117 27-142 27s-99-17-142-27-35-37-30-77c4-40 48-268 57-315 10-48 1-48-7-62-10-14-113-40-174-57-60-17-196 1-244 6-48 4-52 10-36 20l207 77c66 25 158 53 167 105 10 53-47 132-80 192s-32 66-30 90 110 86 132 102c24 15 150 85 150 124s-119 140-159 165a820 820 0 01-190 90c-45 8-115-43-156-120-40-76-4-150 20-210 25-60-17-92-38-113l-215-230c-35-37-71-57-71-131s287-420 287-420l273 44c32 0 103-27 168-50 65-20 110-22 110-22s44 0 110 22 136 50 168 50c33 0 275-47 275-47zm-215 1328c18 10 7 32-10 44l-254 198c-20 20-52 50-73 50s-52-30-73-50a13200 13200 0 00-255-198c-16-12-27-33-10-44l150-80a870 870 0 01188-73c15 0 110 34 187 73l150 80z"/>
  <path fill="url(#engine-brave-b)" d="M1999 363l-224-253H992L769 363s-196-53-288 37c0 0 260-23 350 123l276 47c32 0 103-27 168-50 65-20 110-22 110-22s44 0 110 22 136 50 168 50c33 0 275-47 275-47 90-146 350-123 350-123-92-92-288-38-288-38"/>
</svg>`;

const ENGINE_GROUPS = [
  {
    label: "Moteurs de recherche",
    engines: {
      google: { name: "Google", url: "https://www.google.com/search?q=", icon: GOOGLE_ICON },
      bing: { name: "Bing", url: "https://www.bing.com/search?q=", icon: BING_ICON },
      brave: { name: "Brave", url: "https://search.brave.com/search?q=", icon: BRAVE_ICON },
      ecosia: { name: "Ecosia", url: "https://www.ecosia.org/search?q=", icon: ECOSIA_ICON },
    },
  },
  {
    label: "Recherche IA",
    engines: {
      chatgpt: { name: "ChatGPT", url: "https://chatgpt.com/?q=", icon: CHATGPT_ICON },
      grok: { name: "Grok", url: "https://grok.com/?q=", icon: GROK_ICON },
      claude: { name: "Claude", url: "https://claude.ai/new?q=", icon: CLAUDE_ICON },
      mistral: { name: "Mistral AI", url: "https://chat.mistral.ai/chat?q=", icon: MISTRAL_ICON },
      huggingchat: { name: "HuggingChat", url: "https://huggingface.co/chat/?q=", icon: HUGGINGCHAT_ICON },
      perplexity: { name: "Perplexity", url: "https://www.perplexity.ai/search/?q=", icon: PERPLEXITY_ICON },
    },
  },
];

const ENGINES = Object.fromEntries(ENGINE_GROUPS.flatMap((group) => Object.entries(group.engines)));

const ENGINE_STORAGE_KEY = "homepage.engine";

export const form = document.getElementById("search-form");
export const input = document.getElementById("search-input");
const engineToggle = document.getElementById("engine-toggle");
const engineMenu = document.getElementById("engine-menu");
const engineIcon = document.getElementById("engine-icon");
const engineName = document.getElementById("engine-name");

let currentEngine = localStorage.getItem(ENGINE_STORAGE_KEY) || "google";
if (!ENGINES[currentEngine]) currentEngine = "google";

function renderEngineMenu() {
  engineMenu.replaceChildren();

  ENGINE_GROUPS.forEach((group, groupIndex) => {
    if (groupIndex > 0) {
      const divider = document.createElement("li");
      divider.className = "engine-menu-divider";
      divider.setAttribute("role", "separator");
      engineMenu.append(divider);
    }

    const heading = document.createElement("li");
    heading.className = "engine-menu-heading";
    heading.textContent = group.label;
    engineMenu.append(heading);

    for (const [key, option] of Object.entries(group.engines)) {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.dataset.engine = key;

      const icon = document.createElement("span");
      icon.className = "engine-icon";
      icon.innerHTML = option.icon;

      const label = document.createElement("span");
      label.textContent = option.name;

      li.append(icon, label);
      engineMenu.append(li);
    }
  });
}

function applyEngine(key) {
  currentEngine = key;
  localStorage.setItem(ENGINE_STORAGE_KEY, key);

  engineIcon.innerHTML = ENGINES[key].icon;
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

onClickOutside([engineMenu, engineToggle], closeEngineMenu);
onEscape(closeEngineMenu);

function resolveCommand(query) {
  if (!query.startsWith("/")) return null;

  const match = query.match(/^\/(\S+)\s*(.*)$/);
  if (!match) return null;

  const key = match[1].toLowerCase();
  const command = loadCommands().find((c) => c.key === key);
  if (!command) return null;

  const rest = match[2].trim();
  return rest ? command.url + encodeURIComponent(rest) : command.home;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  const commandUrl = resolveCommand(query);
  window.location.href = commandUrl || ENGINES[currentEngine].url + encodeURIComponent(query);
});

renderEngineMenu();
applyEngine(currentEngine);
