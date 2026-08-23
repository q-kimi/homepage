const AVATAR_KEY = "homepage.avatar";
const MAX_AVATAR_SIZE = 10 * 1024 * 1024;

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

avatarPicker.addEventListener("click", () => avatarInput.click());

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showAvatarError("Choisis un fichier image.");
    return;
  }

  if (file.size > MAX_AVATAR_SIZE) {
    showAvatarError("Image trop lourde (10 Mo max).");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      localStorage.setItem(AVATAR_KEY, reader.result);
      showAvatarError("");
      applyAvatar(reader.result);
    } catch {
      showAvatarError("Impossible d'enregistrer cette image.");
    }
  };
  reader.readAsDataURL(file);
});

avatarRemove.addEventListener("click", () => {
  localStorage.removeItem(AVATAR_KEY);
  avatarInput.value = "";
  showAvatarError("");
  applyAvatar(null);
});

applyAvatar(localStorage.getItem(AVATAR_KEY));
