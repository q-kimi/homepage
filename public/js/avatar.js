const AVATAR_KEY = "homepage.avatar";
const MAX_SOURCE_SIZE = 15 * 1024 * 1024;
const AVATAR_DIMENSION = 256;
const AVATAR_QUALITY = 0.85;

const avatarBadge = document.getElementById("avatar-badge");
const avatarPicker = document.getElementById("avatar-picker");
const avatarPlaceholder = document.getElementById("avatar-placeholder");
const avatarInput = document.getElementById("avatar-input");
const avatarRemove = document.getElementById("avatar-remove");
const avatarError = document.getElementById("avatar-error");

export function showAvatarError(message) {
  avatarError.textContent = message;
  avatarError.hidden = !message;
}

function applyAvatar(dataUrl) {
  if (dataUrl) {
    avatarPicker.style.backgroundImage = `url("${dataUrl}")`;
    avatarPlaceholder.hidden = true;
    avatarBadge.style.backgroundImage = `url("${dataUrl}")`;
    avatarBadge.hidden = false;
  } else {
    avatarPicker.style.backgroundImage = "none";
    avatarPlaceholder.hidden = false;
    avatarBadge.style.backgroundImage = "none";
    avatarBadge.hidden = true;
  }
}

function resizeAvatar(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = AVATAR_DIMENSION;
      canvas.height = AVATAR_DIMENSION;
      canvas
        .getContext("2d")
        .drawImage(img, sx, sy, size, size, 0, 0, AVATAR_DIMENSION, AVATAR_DIMENSION);

      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", AVATAR_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("image-decode-failed"));
    };
    img.src = objectUrl;
  });
}

avatarPicker.addEventListener("click", () => avatarInput.click());

avatarInput.addEventListener("change", async () => {
  const file = avatarInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showAvatarError("Choisis un fichier image.");
    return;
  }

  if (file.size > MAX_SOURCE_SIZE) {
    showAvatarError("Image trop lourde (15 Mo max).");
    return;
  }

  try {
    const dataUrl = await resizeAvatar(file);
    localStorage.setItem(AVATAR_KEY, dataUrl);
    showAvatarError("");
    applyAvatar(dataUrl);
  } catch {
    showAvatarError("Impossible d'enregistrer cette image.");
  }
});

avatarRemove.addEventListener("click", () => {
  localStorage.removeItem(AVATAR_KEY);
  avatarInput.value = "";
  showAvatarError("");
  applyAvatar(null);
});

applyAvatar(localStorage.getItem(AVATAR_KEY));
