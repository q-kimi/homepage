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

// Delays a costly call (e.g. a full re-render) until `delay` ms after the
// last invocation, so a burst of calls (fast typing, rapid clicks) collapses
// into a single trailing one instead of one per event.
export function debounce(fn, delay) {
  let handle = null;
  return (...args) => {
    clearTimeout(handle);
    handle = setTimeout(() => fn(...args), delay);
  };
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

// Fields are pre-filled with "https://" so a pasted full URL that keeps that
// prefix (cursor left at the end, paste inserted after it) ends up doubled,
// e.g. "https://https://example.com". Strip the redundant leading scheme,
// keeping the cursor at the same spot in the remaining text.
export function dedupeUrlScheme(input) {
  const match = input.value.match(/^(https?:\/\/)(?=https?:\/\/)/i);
  if (!match) return;

  const removedLength = match[1].length;
  const cursor = input.selectionStart ?? input.value.length;
  input.value = input.value.slice(removedLength);
  const newCursor = Math.max(0, cursor - removedLength);
  input.setSelectionRange(newCursor, newCursor);
}
