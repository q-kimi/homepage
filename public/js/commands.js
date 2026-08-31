import { readJsonArray } from "./dom-utils.js";

const COMMANDS_KEY = "homepage.commands";

export const DEFAULT_COMMANDS = [
  // Sites présents en raccourcis par défaut sur la page
  { key: "yt", name: "YouTube", url: "https://www.youtube.com/results?search_query=", home: "https://www.youtube.com/" },
  { key: "gmail", name: "Gmail", url: "https://mail.google.com/mail/u/0/#search/", home: "https://mail.google.com/" },
  { key: "gh", name: "GitHub", url: "https://github.com/search?q=", home: "https://github.com/" },
  { key: "netflix", name: "Netflix", url: "https://www.netflix.com/search?q=", home: "https://www.netflix.com/" },
  { key: "x", name: "X", url: "https://x.com/search?q=", home: "https://x.com/" },
  { key: "ig", name: "Instagram", url: "https://www.instagram.com/explore/search/keyword/?q=", home: "https://www.instagram.com/" },
  { key: "wa", name: "WhatsApp", url: "https://web.whatsapp.com/", home: "https://web.whatsapp.com/" },

  // Assistants IA
  { key: "gpt", name: "ChatGPT", url: "https://chatgpt.com/?q=", home: "https://chatgpt.com/" },
  { key: "claude", name: "Claude", url: "https://claude.ai/new?q=", home: "https://claude.ai/new" },
  { key: "grok", name: "Grok", url: "https://grok.com/?q=", home: "https://grok.com/" },
  { key: "mistral", name: "Mistral AI", url: "https://chat.mistral.ai/chat?q=", home: "https://chat.mistral.ai/chat" },
  { key: "hf", name: "HuggingChat", url: "https://huggingface.co/chat/?q=", home: "https://huggingface.co/chat/" },
  { key: "pplx", name: "Perplexity", url: "https://www.perplexity.ai/search/?q=", home: "https://www.perplexity.ai/" },

  // Recherche générale
  { key: "wiki", name: "Wikipédia", url: "https://fr.wikipedia.org/w/index.php?search=", home: "https://fr.wikipedia.org/" },
  { key: "reddit", name: "Reddit", url: "https://www.reddit.com/search/?q=", home: "https://www.reddit.com/" },
  { key: "maps", name: "Google Maps", url: "https://www.google.com/maps/search/", home: "https://www.google.com/maps" },
  { key: "img", name: "Google Images", url: "https://www.google.com/search?tbm=isch&q=", home: "https://images.google.com/" },
  { key: "amazon", name: "Amazon", url: "https://www.amazon.fr/s?k=", home: "https://www.amazon.fr/" },
  { key: "tr", name: "Traduction", url: "https://translate.google.com/?sl=auto&tl=fr&text=", home: "https://translate.google.com/" },
];

export function loadCommands() {
  return (
    readJsonArray(COMMANDS_KEY, {
      filter: (c) => c && typeof c.key === "string" && typeof c.url === "string",
    }) ?? DEFAULT_COMMANDS.slice()
  );
}

export function saveCommands(list) {
  localStorage.setItem(COMMANDS_KEY, JSON.stringify(list));
}

export function deriveHome(url) {
  try {
    return new URL(url).origin + "/";
  } catch {
    return url;
  }
}
