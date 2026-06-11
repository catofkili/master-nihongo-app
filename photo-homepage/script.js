const photos = [
  {
    title: "城市边缘",
    category: "街头人文",
    meta: "Shanghai / 2026",
    src: ""
  },
  {
    title: "风经过山脊",
    category: "自然风光",
    meta: "Mountain / 2026",
    src: ""
  },
  {
    title: "午后路口",
    category: "街头人文",
    meta: "Street / 2026",
    src: ""
  },
  {
    title: "雾里的树",
    category: "自然风光",
    meta: "Forest / 2026",
    src: ""
  },
  {
    title: "候车的人",
    category: "街头人文",
    meta: "Station / 2026",
    src: ""
  },
  {
    title: "海岸线",
    category: "自然风光",
    meta: "Coast / 2026",
    src: ""
  }
];

const gradients = [
  "linear-gradient(145deg, #303030, #111 52%, #777)",
  "linear-gradient(160deg, #101010, #5f5f5f 48%, #d5d5d5)",
  "linear-gradient(130deg, #dedede, #525252 44%, #080808)",
  "linear-gradient(155deg, #171717, #393939 55%, #bdbdbd)",
  "linear-gradient(135deg, #090909, #7b7b7b 46%, #242424)",
  "linear-gradient(150deg, #cfcfcf, #2c2c2c 50%, #050505)"
];

const photoGrid = document.querySelector("#photoGrid");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxTitle = document.querySelector("#lightboxTitle");
const lightboxMeta = document.querySelector("#lightboxMeta");
const closeLightbox = document.querySelector("#closeLightbox");

document.querySelector("#year").textContent = new Date().getFullYear();

photos.forEach((photo, index) => {
  const card = document.createElement("button");
  card.className = "photo-card";
  card.type = "button";

  const thumb = document.createElement("div");
  thumb.className = "photo-thumb";
  if (photo.src) {
    thumb.style.backgroundImage = `url("${photo.src}")`;
  } else {
    thumb.style.background = gradients[index % gradients.length];
  }

  const info = document.createElement("div");
  info.className = "photo-info";
  info.innerHTML = `<strong>${photo.title}</strong><span>${photo.category}</span>`;

  card.append(thumb, info);
  card.addEventListener("click", () => openLightbox(photo, index));
  photoGrid.append(card);
});

function openLightbox(photo, index) {
  lightboxTitle.textContent = photo.title;
  lightboxMeta.textContent = `${photo.category} · ${photo.meta}`;

  if (photo.src) {
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.title;
  } else {
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "请在 script.js 里给这张作品配置照片路径";
    lightboxImage.style.background = gradients[index % gradients.length];
  }

  lightbox.showModal();
}

closeLightbox.addEventListener("click", () => {
  lightbox.close();
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.close();
  }
});
