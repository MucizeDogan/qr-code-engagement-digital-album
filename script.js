const CLOUDINARY_CLOUD_NAME = "dovxqvdl5";
const CLOUDINARY_UPLOAD_PRESET = "mucizeTest";
const CLOUDINARY_UPLOAD_ENDPOINT = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
const MAX_IMAGE_UPLOAD_BYTES = 9 * 1024 * 1024;
const MAX_UPLOAD_ATTEMPTS = 3;

const state = {
  files: [],
  guestName: "",
  previewUrls: [],
};
state.flowType = null;
// "media" | "note"
const elements = {
  photoButton: document.querySelector("#photoButton"),
  videoButton: document.querySelector("#videoButton"),
  noteButton: document.querySelector("#noteButton"),
  photoInput: document.querySelector("#photoInput"),
  videoInput: document.querySelector("#videoInput"),
  noteInput: document.querySelector("#noteInput"),
  review: document.querySelector("#review"),
  guest: document.querySelector("#guest"),
  upload: document.querySelector("#upload"),
  thanks: document.querySelector("#thanks"),
  mediaList: document.querySelector("#mediaList"),
  fileSummary: document.querySelector("#fileSummary"),
  addMoreButton: document.querySelector("#addMoreButton"),
  continueButton: document.querySelector("#continueButton"),
  guestForm: document.querySelector("#guestForm"),
  guestName: document.querySelector("#guestName"),
  progressBar: document.querySelector("#progressBar"),
  uploadStatus: document.querySelector("#uploadStatus"),
  noteModal: document.querySelector("#noteModal"),
  noteText: document.querySelector("#noteText"),
  saveNoteButton: document.querySelector("#saveNoteButton"),
  cancelNoteButton: document.querySelector("#cancelNoteButton"),
  noteGuestName: document.querySelector("#noteGuestName"),
};

// elements.photoButton.addEventListener("click", () => elements.photoInput.click());
// elements.videoButton.addEventListener("click", () => elements.videoInput.click());
elements.photoButton.addEventListener("click", () => {
  state.flowType = "media";
  elements.photoInput.click();
});

elements.videoButton.addEventListener("click", () => {
  state.flowType = "media";
  elements.videoInput.click();
});
elements.addMoreButton.addEventListener("click", () => elements.photoInput.click());
elements.noteButton.addEventListener("click", () => {
  state.flowType = "note";

  elements.noteModal.classList.remove("hidden");
  elements.noteGuestName.value = state.guestName || "";
  elements.noteText.focus();
});
elements.cancelNoteButton.addEventListener("click", () => {
  elements.noteModal.classList.add("hidden");
  elements.noteText.value = "";
});

// elements.cancelNoteButton.addEventListener("click", () => {
//   elements.noteText.value = "";
//   elements.noteModal.classList.add("hidden");
// });

elements.saveNoteButton.addEventListener("click", () => {

  const note = elements.noteText.value.trim();

  if (!note) {
    alert("Lütfen bir not yazın.");
    return;
  }

const senderName = elements.noteGuestName.value.trim();

const txtContent =
`İrem & Doğan Dijital Anı Albümü

Gönderen: ${senderName || "Misafir"}

Tarih: ${new Date().toLocaleString("tr-TR")}

Mesaj:
${note}`;

  const blob = new Blob([txtContent], {
    type: "text/plain"
  });

  const file = new File(
    [blob],
    `not-${Date.now()}.txt`,
    {
      type: "text/plain",
      lastModified: Date.now()
    }
  );

  addFiles([file]);
  state.flowType = "note";
state.guestName = elements.noteGuestName.value.trim();

  elements.noteText.value = "";
  elements.noteModal.classList.add("hidden");
  elements.noteGuestName.value = "";
});

elements.photoInput.addEventListener("change", (event) => addFiles(event.target.files));
elements.videoInput.addEventListener("change", (event) => addFiles(event.target.files));

// elements.continueButton.addEventListener("click", () => {
//   elements.guest.classList.remove("hidden");
//   elements.guest.scrollIntoView({ behavior: "smooth", block: "start" });
//   window.setTimeout(() => elements.guestName.focus(), 380);
// });

elements.continueButton.addEventListener("click", () => {

  // SADECE MEDIA FLOW'DA isim sor
  if (state.flowType === "media") {

    elements.guest.classList.remove("hidden");
    elements.guest.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => elements.guestName.focus(), 300);

    return;
  }

  // note flow ise direkt upload'a geç
  elements.upload.classList.remove("hidden");
  elements.upload.scrollIntoView({ behavior: "smooth", block: "start" });

  uploadMemories();

});

elements.guestForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  state.guestName = elements.guestName.value.trim();

  // if (!state.guestName || state.files.length === 0) {
  //   return;
  // }

  // elements.upload.classList.remove("hidden");
  // elements.upload.scrollIntoView({ behavior: "smooth", block: "start" });

  if (state.flowType === "media") {

    if (!state.guestName || state.files.length === 0) return;

    elements.upload.classList.remove("hidden");
    elements.upload.scrollIntoView({ behavior: "smooth", block: "start" });

    await uploadMemories();
  }

  try {
    await uploadMemories();
  } catch (error) {
    elements.progressBar.style.width = "0%";
    elements.uploadStatus.textContent = getFriendlyUploadError(error);
    console.error(error);
  }
});

function addFiles(fileList) {
  const incomingFiles = Array.from(fileList || []);
  const uniqueFiles = incomingFiles.filter((file) => {
    return !state.files.some((saved) => {
      return (
        saved.name === file.name &&
        saved.size === file.size &&
        saved.lastModified === file.lastModified
      );
    });
  });

  state.files.push(...uniqueFiles);
  elements.photoInput.value = "";
  elements.videoInput.value = "";

  if (state.files.length > 0) {
    renderReview();
    elements.review.classList.remove("hidden");
    elements.review.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderReview() {
  revokePreviewUrls();

  const photos = state.files.filter((file) => file.type.startsWith("image/")).length;
  const videos = state.files.filter((file) => file.type.startsWith("video/")).length;
  const totalSize = state.files.reduce((sum, file) => sum + file.size, 0);

  elements.fileSummary.innerHTML = `
    <div class="summary__item">
      <span class="summary__value">${photos}</span>
      <span class="summary__label">Foto&#287;raf</span>
    </div>
    <div class="summary__item">
      <span class="summary__value">${videos}</span>
      <span class="summary__label">Video</span>
    </div>
    <div class="summary__item">
      <span class="summary__value">${formatFileSize(totalSize)}</span>
      <span class="summary__label">Toplam boyut</span>
    </div>
  `;

  elements.mediaList.innerHTML = "";

  state.files.forEach((file, index) => {
    const item = document.createElement("article");
    item.className = "media-item";

    // const preview = document.createElement(file.type.startsWith("video/") ? "video" : "img");
    // const previewUrl = URL.createObjectURL(file);
    // state.previewUrls.push(previewUrl);
    // preview.className = "media-item__preview";
    // preview.src = previewUrl;
    // preview.alt = file.name;
    // preview.muted = true;
    // preview.playsInline = true;

    let preview;

if (file.type.startsWith("video/")) {

  preview = document.createElement("video");

  const previewUrl = URL.createObjectURL(file);

  state.previewUrls.push(previewUrl);

  preview.src = previewUrl;
  preview.className = "media-item__preview";
  preview.muted = true;
  preview.playsInline = true;

}
else if (file.type.startsWith("image/")) {

  preview = document.createElement("img");

  const previewUrl = URL.createObjectURL(file);

  state.previewUrls.push(previewUrl);

  preview.src = previewUrl;
  preview.className = "media-item__preview";
  preview.alt = file.name;

}
else {

  preview = document.createElement("div");

  preview.className =
    "media-item__preview media-item__preview--text";

  preview.textContent = "📝";
}

    const text = document.createElement("div");
    // text.innerHTML = `
    //   <p class="media-item__title">${escapeHtml(file.name)}</p>
    //   <p class="media-item__meta">${file.type || "Dosya"} - ${formatFileSize(file.size)}</p>
    // `;

    if (file.type === "text/plain") {

  const reader = new FileReader();

  reader.onload = () => {

    text.innerHTML = `
      <p class="media-item__title">Misafir Notu</p>
      <p class="media-item__meta">
        ${escapeHtml(String(reader.result).substring(0, 120))}
      </p>
    `;
  };

  reader.readAsText(file);

} else {

  text.innerHTML = `
    <p class="media-item__title">${escapeHtml(file.name)}</p>
    <p class="media-item__meta">
      ${file.type || "Dosya"} - ${formatFileSize(file.size)}
    </p>
  `;
}

    const removeButton = document.createElement("button");
    removeButton.className = "media-item__remove";
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `${file.name} dosyasini kaldir`);
    removeButton.textContent = "x";
    removeButton.addEventListener("click", () => removeFile(index));

    item.append(preview, text, removeButton);
    elements.mediaList.append(item);
  });
}

function removeFile(index) {
  state.files.splice(index, 1);

  if (state.files.length === 0) {
    resetSelectedFiles();
    document.querySelector("#share").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  renderReview();
}

async function uploadMemories() {
  elements.progressBar.style.width = "0%";
  elements.uploadStatus.textContent = "Dosyalar hazirlaniyor...";

  await uploadToCloudinary();
  resetSelectedFiles();

  elements.thanks.classList.remove("hidden");
  elements.thanks.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function uploadToCloudinary() {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary cloud name ve upload preset doldurulmali.");
  }

  const filesToUpload = [...state.files];

  for (const [index, originalFile] of filesToUpload.entries()) {
    const current = index + 1;
    const uploadFile = await prepareFileForUpload(originalFile, current, filesToUpload.length);
    const basePercent = Math.round((index / filesToUpload.length) * 100);
    elements.progressBar.style.width = `${basePercent}%`;
    elements.uploadStatus.textContent = `${current}/${filesToUpload.length} dosya Cloudinary'ye yukleniyor...`;

    await uploadFileWithRetry(uploadFile, originalFile, current, filesToUpload.length);

    const percent = Math.round((current / filesToUpload.length) * 100);
    elements.progressBar.style.width = `${percent}%`;
    await wait(250);
  }

  elements.uploadStatus.textContent = "Tamamlandi.";
}

async function uploadFileWithRetry(uploadFile, originalFile, current, total) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_UPLOAD_ATTEMPTS; attempt += 1) {
    try {
      await uploadSingleFile(uploadFile);
      return;
    } catch (error) {
      lastError = error;
      if (attempt === MAX_UPLOAD_ATTEMPTS) {
        break;
      }

      elements.uploadStatus.textContent = `${current}/${total} dosya tekrar deneniyor (${attempt + 1}/${MAX_UPLOAD_ATTEMPTS})...`;
      await wait(900 * attempt);
    }
  }

  throw new Error(
    `${current}. dosya yuklenemedi: ${originalFile.name}. ${lastError?.message || ""}`
  );
}

async function uploadSingleFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", `irem-dogan/2026-08-08/${slugify(state.guestName)}`);
  formData.append("tags", "irem-dogan,nisan,qr-ani-albumu");
  formData.append(
    "context",
    `guest_name=${escapeCloudinaryContext(state.guestName)}|original_file_name=${escapeCloudinaryContext(file.name)}`
  );

  const response = await fetch(CLOUDINARY_UPLOAD_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const message = await readCloudinaryError(response);
    throw new Error(message);
  }
}

async function prepareFileForUpload(file, current, total) {
  if (!shouldCompressImage(file)) {
    return file;
  }

  elements.uploadStatus.textContent = `${current}/${total} buyuk fotograf yukleme icin kucultuluyor...`;

  try {
    return await compressImage(file);
  } catch (error) {
    console.warn("Fotoğraf sıkıştırılamadı, orijinal dosya yüklenecek.", error);
    return file;
  }
}

function shouldCompressImage(file) {
  return (
    file.size > MAX_IMAGE_UPLOAD_BYTES &&
    ["image/jpeg", "image/png", "image/webp"].includes(file.type)
  );
}

async function compressImage(file) {
  const image = await loadImage(file);
  const maxSide = 2400;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, "image/jpeg", 0.82);

  if (!blob || blob.size >= file.size) {
    return file;
  }

  const compressedName = file.name.replace(/\.[^.]+$/, "") + "-compressed.jpg";
  return new File([blob], compressedName, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Fotograf okunamadi."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function readCloudinaryError(response) {
  try {
    const data = await response.json();
    return data?.error?.message || `Cloudinary HTTP ${response.status}`;
  } catch {
    return `Cloudinary HTTP ${response.status}: ${await response.text()}`;
  }
}

function resetSelectedFiles() {
  state.files = [];
  state.guestName = "";
  elements.guestName.value = "";
  elements.photoInput.value = "";
  elements.videoInput.value = "";
  elements.fileSummary.innerHTML = "";
  elements.mediaList.innerHTML = "";
  elements.progressBar.style.width = "0%";
  revokePreviewUrls();
  elements.review.classList.add("hidden");
  elements.guest.classList.add("hidden");
  elements.upload.classList.add("hidden");
}

function revokePreviewUrls() {
  state.previewUrls.forEach((url) => URL.revokeObjectURL(url));
  state.previewUrls = [];
}

function getFriendlyUploadError(error) {
  const message = error?.message || "";

  if (message.includes("File size too large") || message.includes("exceeds")) {
    return "Bir dosya Cloudinary limitinden buyuk. Lutfen daha kucuk bir dosya sec veya Cloudinary preset/account limitini artir.";
  }

  if (message.includes("Invalid image file") || message.includes("format")) {
    return "Bir dosya formati Cloudinary preset tarafinda kabul edilmiyor. Preset allowed formats ayarini kontrol et.";
  }

  return `Yukleme sirasinda sorun olustu. ${message}`;
}

function formatFileSize(bytes) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function escapeCloudinaryContext(value) {
  return String(value).replace(/[=|\\]/g, "\\$&");
}

function slugify(value) {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "misafir";
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
