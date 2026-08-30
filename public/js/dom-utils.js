export function onClickOutside(elements, callback) {
  document.addEventListener("click", (e) => {
    const isInside = elements.some((el) => el === e.target || el.contains(e.target));
    if (!isInside) callback();
  });
}

export function onEscape(callback) {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") callback();
  });
}

export function readJsonArray(key, { filter } = {}) {
  try {
    const raw = JSON.parse(localStorage.getItem(key));
    if (!Array.isArray(raw)) return null;
    return filter ? raw.filter(filter) : raw;
  } catch {
    return null;
  }
}
