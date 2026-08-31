import { readJsonArray } from "./dom-utils.js";

const COMMANDS_KEY = "homepage.commands";

export const DEFAULT_COMMANDS = [
  { key: "yt", name: "YouTube", url: "https://www.youtube.com/results?search_query=", home: "https://www.youtube.com/" },
  { key: "gh", name: "GitHub", url: "https://github.com/search?q=", home: "https://github.com/" },
  { key: "gpt", name: "ChatGPT", url: "https://chatgpt.com/?q=", home: "https://chatgpt.com/" },
  { key: "wiki", name: "Wikipédia", url: "https://fr.wikipedia.org/w/index.php?search=", home: "https://fr.wikipedia.org/" },
  { key: "so", name: "Stack Overflow", url: "https://stackoverflow.com/search?q=", home: "https://stackoverflow.com/" },
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
