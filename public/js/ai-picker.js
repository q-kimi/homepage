import {
  CLAUDE_ICON,
  CHATGPT_ICON,
  GEMINI_ICON,
  MISTRAL_ICON,
  GROK_ICON,
  COPILOT_ICON,
  HUGGINGCHAT_ICON,
} from "./ai-icons.js";

const AI_KEY = "homepage.aiProvider";
const DEFAULT_AI = "chatgpt";

const AI_OPTIONS = {
  claude: { name: "Claude", url: "https://claude.ai/new", icon: CLAUDE_ICON },
  chatgpt: { name: "ChatGPT", url: "https://chatgpt.com/", icon: CHATGPT_ICON },
  grok: { name: "Grok", url: "https://grok.com/", icon: GROK_ICON },
  copilot: { name: "Copilot", url: "https://copilot.microsoft.com/", icon: COPILOT_ICON },
  gemini: { name: "Gemini", url: "https://gemini.google.com/app", icon: GEMINI_ICON },
  mistral: { name: "Mistral AI", url: "https://chat.mistral.ai/chat", icon: MISTRAL_ICON },
  huggingchat: { name: "HuggingChat", url: "https://huggingface.co/chat/", icon: HUGGINGCHAT_ICON },
};

const aiButton = document.getElementById("ai-button");
const aiPicker = document.getElementById("ai-picker");

function loadAiChoice() {
  const stored = localStorage.getItem(AI_KEY);
  return AI_OPTIONS[stored] ? stored : DEFAULT_AI;
}

function applyAiChoice(key) {
  const option = AI_OPTIONS[key];
  aiButton.href = option.url;
  aiButton.setAttribute("aria-label", `Ouvrir ${option.name}`);
  aiButton.innerHTML = option.icon;

  aiPicker.querySelectorAll(".ai-picker-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.ai === key);
  });
}

function renderAiPicker() {
  aiPicker.replaceChildren();

  for (const [key, option] of Object.entries(AI_OPTIONS)) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ai-picker-option";
    btn.dataset.ai = key;
    btn.setAttribute("aria-label", option.name);
    btn.title = option.name;
    btn.innerHTML = option.icon;

    btn.addEventListener("click", () => {
      localStorage.setItem(AI_KEY, key);
      applyAiChoice(key);
    });

    aiPicker.append(btn);
  }
}

renderAiPicker();
applyAiChoice(loadAiChoice());
