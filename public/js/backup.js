const BACKUP_KEYS = [
  "homepage.shortcuts",
  "homepage.engine",
  "homepage.aiProvider",
  "homepage.shortcuts.hidden",
  "homepage.searchHistory",
];

const exportBtn = document.getElementById("backup-export-btn");
const importBtn = document.getElementById("backup-import-btn");
const importInput = document.getElementById("backup-import-input");
const confirmHint = document.getElementById("backup-confirm");

function showHint(message, isError) {
  confirmHint.textContent = message;
  confirmHint.classList.toggle("error", isError);
  confirmHint.hidden = false;
}

function exportBackup() {
  const data = {};
  for (const key of BACKUP_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }

  const payload = { version: 1, exportedAt: new Date().toISOString(), data };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `homepage-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      const data = payload?.data;
      if (!data || typeof data !== "object") throw new Error("invalid");

      for (const key of BACKUP_KEYS) {
        if (typeof data[key] === "string") localStorage.setItem(key, data[key]);
      }

      showHint("Importé, la page va se recharger...", false);
      setTimeout(() => window.location.reload(), 900);
    } catch {
      showHint("Fichier invalide.", true);
    }
  };
  reader.readAsText(file);
}

exportBtn.addEventListener("click", exportBackup);

importBtn.addEventListener("click", () => importInput.click());

importInput.addEventListener("change", () => {
  const file = importInput.files[0];
  importInput.value = "";
  if (file) importBackup(file);
});
