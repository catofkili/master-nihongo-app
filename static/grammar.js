let currentCard = null;
let revealed = false;

const apiBase = window.location.protocol === "file:" ? "http://127.0.0.1:8000" : "";

const cardEl = document.querySelector("#card");
const promptEl = document.querySelector("#prompt");
const answerPanel = document.querySelector("#answerPanel");
const actions = document.querySelector("#actions");
const patternEl = document.querySelector("#pattern");
const meaningEl = document.querySelector("#meaning");
const levelEl = document.querySelector("#level");
const detailsEl = document.querySelector("#details");
const exampleJp = document.querySelector("#exampleJp");
const exampleMeaning = document.querySelector("#exampleMeaning");
const confusionBox = document.querySelector("#confusionBox");
const confusionToggle = document.querySelector("#confusionToggle");
const confusionsEl = document.querySelector("#confusions");
const finishPanel = document.querySelector("#finishPanel");
const progressText = document.querySelector("#progressText");
const progressFill = document.querySelector("#progressFill");
const reloadButton = document.querySelector("#reloadButton");

const statEls = {
  reviewedToday: document.querySelector("#reviewedToday"),
  masteredToday: document.querySelector("#masteredToday"),
  lowCount: document.querySelector("#lowCount"),
  unseenCount: document.querySelector("#unseenCount"),
  knownForever: document.querySelector("#knownForever"),
};

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) throw new Error("请求失败");
  return response.json();
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function updateStats(stats) {
  statEls.reviewedToday.textContent = stats.reviewedToday;
  statEls.masteredToday.textContent = stats.masteredToday;
  statEls.lowCount.textContent = stats.lowCount;
  statEls.unseenCount.textContent = stats.unseenCount;
  statEls.knownForever.textContent = stats.knownForever;

  const total = Math.max(stats.progressTotal || 1, 1);
  const done = Math.min(stats.progressDone || 0, total);
  const ratio = done / total;
  const hue = Math.round(92 - ratio * 88);
  progressText.textContent = `${done}/${total}`;
  progressFill.style.width = `${ratio * 100}%`;
  progressFill.style.setProperty("--progress-color", `hsl(${hue}, 38%, 48%)`);
}

function showReview() {
  finishPanel.classList.add("hidden");
  cardEl.classList.remove("hidden");
}

function showFinish() {
  cardEl.classList.add("hidden");
  finishPanel.classList.remove("hidden");
}

function renderCard(card) {
  currentCard = card;
  revealed = false;
  cardEl.classList.remove("is-revealed");
  answerPanel.classList.add("hidden");
  actions.classList.add("hidden");
  confusionBox.classList.add("hidden");
  confusionsEl.classList.add("hidden");
  detailsEl.innerHTML = "";
  confusionsEl.innerHTML = "";

  if (!card) {
    showFinish();
    return;
  }

  showReview();
  promptEl.textContent = card.prompt;
  patternEl.textContent = card.pattern;
  meaningEl.textContent = card.meaning;
  levelEl.textContent = `${card.level} · 当前分数 ${card.score}`;
  detailsEl.innerHTML = [
    ["接续", card.formation],
    ["提醒", card.notes],
  ].filter((item) => item[1]).map((item) => (
    `<div class="form-chip"><span>${escapeHtml(item[0])}</span><strong>${escapeHtml(item[1])}</strong></div>`
  )).join("");
  exampleJp.textContent = card.example.jp || "";
  exampleMeaning.textContent = card.example.meaning || "";
  if (card.confusions && card.confusions.length > 0) {
    confusionsEl.innerHTML = card.confusions.map((item) => (
      `<div class="confusion-chip"><strong>${escapeHtml(item)}</strong><span>注意语境和接续差别</span></div>`
    )).join("");
    confusionBox.classList.remove("hidden");
  }
}

function reveal() {
  if (!currentCard || revealed) return;
  revealed = true;
  cardEl.classList.add("is-revealed");
  answerPanel.classList.remove("hidden");
  actions.classList.remove("hidden");
}

function shouldRevealFromClick(event) {
  if (!currentCard || revealed) return false;
  if (cardEl.classList.contains("hidden")) return false;
  return !event.target.closest("button, a, .daily-progress, .actions, .confusions, .fold-toggle");
}

async function loadNext() {
  const data = await request("/api/grammar/next");
  updateStats(data.stats);
  renderCard(data.card);
}

async function answer(answerValue) {
  if (!currentCard) return;
  actions.classList.add("hidden");
  const data = await request("/api/grammar/answer", {
    method: "POST",
    body: JSON.stringify({ grammarId: currentCard.id, answer: answerValue }),
  });
  updateStats(data.stats);
  renderCard(data.card);
}

cardEl.addEventListener("click", (event) => {
  if (shouldRevealFromClick(event)) reveal();
});

document.addEventListener("click", (event) => {
  if (shouldRevealFromClick(event)) reveal();
});

confusionToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  confusionsEl.classList.toggle("hidden");
});

actions.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-answer]");
  if (!button) return;
  answer(button.dataset.answer);
});

reloadButton.addEventListener("click", loadNext);

loadNext().catch(() => {
  promptEl.textContent = "加载失败，请确认本地服务已启动。";
});
