let currentCard = null;
let revealed = false;
let latestStats = null;
let currentPhase = "stage1";
let visibleCalendarMonth = null;
let wordTableOffset = 0;
let wordTableHasMore = true;
let wordTableLoading = false;
let wordTableReturnView = "finish";
let wordTableSort = "score_desc";
let calendarAutoShownForDate = "";

const apiBase = window.location.protocol === "file:" ? "http://127.0.0.1:8000" : "";

const cardEl = document.querySelector("#card");
const finishPanel = document.querySelector("#finishPanel");
const calendarPanel = document.querySelector("#calendarPanel");
const calendarModal = document.querySelector("#calendarModal");
const wordTablePanel = document.querySelector("#wordTablePanel");
const undoButton = document.querySelector("#undoButton");
const returnPhaseButton = document.querySelector("#returnPhaseButton");
const progressText = document.querySelector("#progressText");
const progressFill = document.querySelector("#progressFill");
const calendarTitle = document.querySelector("#calendarTitle");
const calendarGrid = document.querySelector("#calendarGrid");
const prevMonthButton = document.querySelector("#prevMonthButton");
const nextMonthButton = document.querySelector("#nextMonthButton");
const openCalendarButton = document.querySelector("#openCalendarButton");
const focusCount = document.querySelector("#focusCount");
const focusList = document.querySelector("#focusList");
const continueStage2Button = document.querySelector("#continueStage2Button");
const continueKanjiButton = document.querySelector("#continueKanjiButton");
const openWordTableFromCalendar = document.querySelector("#openWordTableFromCalendar");
const openWordTableFromFinish = document.querySelector("#openWordTableFromFinish");
const continueKanjiFromFinish = document.querySelector("#continueKanjiFromFinish");
const closeWordTableButton = document.querySelector("#closeWordTableButton");
const wordTableCount = document.querySelector("#wordTableCount");
const wordTableSortEl = document.querySelector("#wordTableSort");
const wordTableList = document.querySelector("#wordTableList");
const wordTableLoadingEl = document.querySelector("#wordTableLoading");
const meaningPanel = document.querySelector("#meaningPanel");
const meaningEl = document.querySelector("#meaning");
const meaningEyeButton = document.querySelector("#meaningEyeButton");
const allMeaningsEl = document.querySelector("#allMeanings");
const answerPanel = document.querySelector("#answerPanel");
const actions = document.querySelector("#actions");
const kanaEl = document.querySelector("#kana");
const kanjiEl = document.querySelector("#kanji");
const posEl = document.querySelector("#pos");
const answerMeaningExtra = document.querySelector("#answerMeaningExtra");
const answerMeaningEyeButton = document.querySelector("#answerMeaningEyeButton");
const answerAllMeanings = document.querySelector("#answerAllMeanings");
const editMeaningButton = document.querySelector("#editMeaningButton");
const meaningEditorModal = document.querySelector("#meaningEditorModal");
const meaningEditorInput = document.querySelector("#meaningEditorInput");
const meaningEditorCancel = document.querySelector("#meaningEditorCancel");
const meaningEditorSave = document.querySelector("#meaningEditorSave");
const formsEl = document.querySelector("#forms");
const exampleBox = document.querySelector("#exampleBox");
const exampleJp = document.querySelector("#exampleJp");
const exampleMeaning = document.querySelector("#exampleMeaning");
const confusionFold = document.querySelector("#confusionFold");
const confusionToggle = document.querySelector("#confusionToggle");
const confusionsEl = document.querySelector("#confusions");
const knownButton = document.querySelector(".known");
const difficultPanel = document.querySelector("#difficultPanel");
const difficultCount = document.querySelector("#difficultCount");
const difficultList = document.querySelector("#difficultList");

const statEls = {
  oldToday: document.querySelector("#oldToday"),
  newLearnedToday: document.querySelector("#newLearnedToday"),
  lowCount: document.querySelector("#lowCount"),
  unseenCount: document.querySelector("#unseenCount"),
  knownForever: document.querySelector("#knownForever"),
};

const minCalendarMonth = "2026-06";
const maxCalendarMonth = "2027-06";

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

function hasKatakana(value) {
  return /[\u30a0-\u30ff]/.test(value || "");
}

function hasAsciiLetters(value) {
  return /[A-Za-z]/.test(value || "");
}

function hasKanji(value) {
  return /[\u4e00-\u9fff]/.test(value || "");
}

function compactPromptText(value, maxLength = 8) {
  const text = value || "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function stage2PromptText(card) {
  if (
    card.kanji
    && card.kanji !== card.kana
    && hasKatakana(card.kanji)
    && !hasAsciiLetters(card.kanji)
    && !hasKanji(card.kanji)
  ) {
    return card.kanji;
  }
  return card.kana;
}

function answerDisplayText(card, phase = currentPhase) {
  if (phase === "kanji") {
    return {
      main: card.kana,
      sub: card.promptMeaning || card.primaryMeaning || card.meaning,
    };
  }
  if (phase === "stage2") {
    return {
      main: card.promptMeaning || card.primaryMeaning || card.meaning,
      sub: card.kanji || stage2PromptText(card),
    };
  }
  if (hasKatakana(card.kana) && hasAsciiLetters(card.kanji)) {
    return {
      main: card.kana,
      sub: card.kanji,
    };
  }
  if (card.kanji && card.kanji !== card.kana && hasKatakana(card.kanji)) {
    return {
      main: card.kanji,
      sub: card.kana,
    };
  }
  return {
    main: card.kana,
    sub: card.kanji,
  };
}

function renderKanjiComponent(item) {
  const sourceText = item.source === "manual" ? "手动" : "自动";
  const variantText = item.simplified && item.simplified !== item.char ? `简 ${item.simplified}` : "同形";
  return `
    <div class="form-chip kanji-component-chip ${item.marked ? "is-marked" : ""}" data-kanji-char="${escapeHtml(item.char)}">
      <span>${escapeHtml(sourceText)} · ${escapeHtml(variantText)}</span>
      <strong>${escapeHtml(item.char)}</strong>
      <button class="kanji-mark-button" data-kanji-mark="${item.marked ? "restore" : "mark"}" data-kanji-char="${escapeHtml(item.char)}" type="button">
        ${item.marked ? "还原" : "标红"}
      </button>
    </div>
  `;
}

function renderMarkedKanjiText(text, components = []) {
  const markedChars = new Set((components || []).filter((item) => item.marked).map((item) => item.char));
  return Array.from(text || "").map((char) => {
    const escaped = escapeHtml(char);
    return markedChars.has(char) ? `<span class="marked-kanji">${escaped}</span>` : escaped;
  }).join("");
}

function updateStats(stats) {
  latestStats = stats;
  returnPhaseButton.classList.toggle("hidden", !["stage2", "kanji"].includes(stats.phase));
  if (["stage2", "kanji"].includes(stats.phase)) returnPhaseButton.disabled = false;
  statEls.oldToday.textContent = stats.oldToday;
  statEls.newLearnedToday.textContent = stats.newToday;
  statEls.lowCount.textContent = stats.lowCount;
  statEls.unseenCount.textContent = stats.unseenCount;
  statEls.knownForever.textContent = stats.knownForever;
  const isStage2 = stats.phase === "stage2";
  const isKanji = stats.phase === "kanji";
  const activeTotal = isKanji ? stats.kanjiTotal : (isStage2 ? stats.stage2Total : stats.stage1ProgressTotal);
  const activeDone = isKanji ? stats.kanjiCompleted : (isStage2 ? stats.stage2Completed : stats.stage1ProgressDone);
  const progressTotal = Math.max(activeTotal, 1);
  const progressDone = Math.min(activeDone, progressTotal);
  const progressRatio = progressDone / progressTotal;
  const hue = Math.round(92 - progressRatio * 88);
  progressText.textContent = `${progressDone}/${progressTotal}`;
  progressFill.style.width = `${progressRatio * 100}%`;
  progressFill.style.setProperty("--progress-color", `hsl(${hue}, 38%, 48%)`);
  renderDifficultWords(stats.difficultWords || []);
}

function showFinish() {
  cardEl.classList.add("hidden");
  calendarPanel.classList.add("hidden");
  wordTablePanel.classList.add("hidden");
  finishPanel.classList.remove("hidden");
  const kanjiDone = Boolean(latestStats.kanjiTotal && latestStats.kanjiCompleted >= latestStats.kanjiTotal);
  continueKanjiFromFinish.disabled = kanjiDone;
  continueKanjiFromFinish.textContent = kanjiDone ? "汉字已完成" : "汉字读音练习";
}

function renderDifficultWords(words) {
  if (!difficultPanel) return;
  if (!words.length) {
    difficultPanel.classList.add("hidden");
    difficultList.innerHTML = "";
    difficultCount.textContent = "0";
    return;
  }
  difficultPanel.classList.remove("hidden");
  difficultCount.textContent = `${words.length} 个`;
  difficultList.innerHTML = words.map((word) => {
    const typeText = word.taskType === "review" ? "复习" : "新学";
    const details = [
      `危险 ${word.risk}`,
      `一阶 ${word.stage1Seen}`,
      word.stage2Seen ? `二阶 ${word.stage2Seen}` : "",
      word.forgot ? `忘 ${word.forgot}` : "",
      word.fuzzy ? `糊 ${word.fuzzy}` : "",
      `最低 ${word.minScore}`,
      `现 ${word.finalScore}`,
    ].filter(Boolean).join(" · ");
    return `
      <article class="difficult-item">
        <div class="difficult-word">
          <strong>${escapeHtml(word.kana)}</strong>
          <span>${escapeHtml(word.kanji)}</span>
        </div>
        <p>${escapeHtml(word.meaning)}</p>
        <div class="difficult-meta">
          <span>${typeText}</span>
          <span>${escapeHtml(details)}</span>
        </div>
      </article>
    `;
  }).join("");
}

function showReview() {
  finishPanel.classList.add("hidden");
  calendarPanel.classList.add("hidden");
  wordTablePanel.classList.add("hidden");
  cardEl.classList.remove("hidden");
}

function monthKeyFromDate(dateText) {
  return dateText.slice(0, 7);
}

function shiftMonth(monthKey, delta) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function showCalendar() {
  cardEl.classList.add("hidden");
  finishPanel.classList.add("hidden");
  wordTablePanel.classList.add("hidden");
  calendarPanel.classList.remove("hidden");
  continueStage2Button.disabled = Boolean(latestStats.stage2Total && latestStats.stage2Completed >= latestStats.stage2Total);
  continueStage2Button.textContent = continueStage2Button.disabled ? "复盘已完成" : "继续复盘";
  continueKanjiButton.disabled = Boolean(latestStats.kanjiTotal && latestStats.kanjiCompleted >= latestStats.kanjiTotal);
  continueKanjiButton.textContent = continueKanjiButton.disabled ? "汉字已完成" : "汉字读音练习";
  if (!visibleCalendarMonth) {
    visibleCalendarMonth = monthKeyFromDate(latestStats.studyDate);
  }
  renderFocusWords(latestStats.difficultWords || []);
  if (calendarAutoShownForDate !== latestStats.studyDate) {
    calendarAutoShownForDate = latestStats.studyDate;
    openCalendarModal(true);
  }
}

function openCalendarModal(animateToday = false) {
  calendarModal.classList.remove("hidden");
  renderCalendar(animateToday);
}

function closeCalendarModal() {
  calendarModal.classList.add("hidden");
}

function renderCalendar(animateToday = false) {
  const [year, month] = visibleCalendarMonth.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const checkins = new Set(latestStats.checkins || []);
  calendarTitle.textContent = `${year}年${month}月`;
  calendarGrid.innerHTML = "";

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    calendarGrid.insertAdjacentHTML("beforeend", '<span class="calendar-empty"></span>');
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const dateText = `${visibleCalendarMonth}-${String(day).padStart(2, "0")}`;
    const classes = ["calendar-day"];
    const animateCurrentDay = animateToday && dateText === latestStats.studyDate && checkins.has(dateText);
    if (checkins.has(dateText) && !animateCurrentDay) classes.push("checked");
    if (dateText === latestStats.studyDate) classes.push("today");
    if (animateCurrentDay) classes.push("will-check");
    calendarGrid.insertAdjacentHTML("beforeend", `<span class="${classes.join(" ")}" data-date="${dateText}">${day}</span>`);
  }

  prevMonthButton.disabled = visibleCalendarMonth <= minCalendarMonth;
  nextMonthButton.disabled = visibleCalendarMonth >= maxCalendarMonth;
  if (animateToday) {
    window.setTimeout(() => {
      const todayEl = calendarGrid.querySelector(`[data-date="${latestStats.studyDate}"]`);
      if (todayEl) todayEl.classList.add("checked", "checking");
    }, 220);
  }
}

function renderFocusWords(words) {
  const list = words || [];
  focusCount.textContent = `${list.length} 个`;
  if (!list.length) {
    focusList.innerHTML = '<div class="focus-empty">今天还没有需要特别看的词</div>';
    return;
  }
  focusList.innerHTML = list.map((word) => {
    const details = [
      `见 ${word.todaySeen || word.stage1Seen + word.stage2Seen}`,
      word.forgot ? `忘 ${word.forgot}` : "",
      word.fuzzy ? `糊 ${word.fuzzy}` : "",
      `最低 ${word.minScore}`,
      `现 ${word.finalScore}`,
    ].filter(Boolean).join(" · ");
    return `
      <article class="focus-item">
        <div class="focus-word">
          <strong>${escapeHtml(word.kana)}</strong>
          <span>${escapeHtml(word.kanji)}</span>
        </div>
        <p>${escapeHtml(word.meaning)}</p>
        <div class="focus-meta">${escapeHtml(details)}</div>
      </article>
    `;
  }).join("");
}

function renderCard(card) {
  currentCard = card;
  revealed = false;
  cardEl.classList.remove("is-revealed");
  answerPanel.classList.add("hidden");
  actions.classList.add("hidden");
  meaningEyeButton.classList.add("hidden");
  allMeaningsEl.classList.add("hidden");
  answerMeaningExtra.classList.add("hidden");
  answerAllMeanings.classList.add("hidden");
  editMeaningButton.classList.add("hidden");
  formsEl.classList.add("hidden");
  exampleBox.classList.add("hidden");
  confusionFold.classList.add("hidden");
  confusionsEl.classList.add("hidden");
  formsEl.innerHTML = "";
  allMeaningsEl.textContent = "";
  answerAllMeanings.textContent = "";
  exampleJp.textContent = "";
  exampleMeaning.textContent = "";
  confusionsEl.innerHTML = "";

  if (!card) {
    if (currentPhase === "checkin") {
      showCalendar();
      return;
    }
    showFinish();
    return;
  }

  showReview();
  cardEl.classList.toggle("kanji-mode", currentPhase === "kanji");
  const fullMeaning = card.meaning || "";
  const primaryMeaning = card.primaryMeaning || fullMeaning;
  const visibleMeaning = card.promptMeaning || primaryMeaning;
  const stage2Prompt = stage2PromptText(card);
  const visiblePrompt = compactPromptText(stage2Prompt);
  const kanjiPrompt = card.kanji || "";
  const visibleKanjiPrompt = compactPromptText(kanjiPrompt);
  if (currentPhase === "kanji") {
    meaningEl.innerHTML = renderMarkedKanjiText(visibleKanjiPrompt, card.kanjiComponents);
  } else {
    meaningEl.textContent = currentPhase === "stage2" ? visiblePrompt : visibleMeaning;
  }
  if (currentPhase === "kanji" && kanjiPrompt && kanjiPrompt !== visibleKanjiPrompt) {
    allMeaningsEl.innerHTML = renderMarkedKanjiText(kanjiPrompt, card.kanjiComponents);
    meaningEyeButton.classList.remove("hidden");
  } else if (currentPhase === "stage2" && stage2Prompt && stage2Prompt !== visiblePrompt) {
    allMeaningsEl.textContent = stage2Prompt;
    meaningEyeButton.classList.remove("hidden");
  } else if (currentPhase === "stage1" && fullMeaning && fullMeaning !== visibleMeaning) {
    allMeaningsEl.textContent = fullMeaning;
    meaningEyeButton.classList.remove("hidden");
  }
  const displayText = answerDisplayText(card);
  if (currentPhase === "stage1") {
    kanaEl.textContent = displayText.main;
    kanjiEl.innerHTML = renderMarkedKanjiText(displayText.sub, card.kanjiComponents);
  } else if (currentPhase === "stage2") {
    kanaEl.textContent = displayText.main;
    kanjiEl.innerHTML = renderMarkedKanjiText(displayText.sub, card.kanjiComponents);
  } else if (currentPhase === "kanji") {
    kanaEl.textContent = displayText.main;
    kanjiEl.textContent = displayText.sub;
  } else {
    kanaEl.textContent = displayText.main;
    kanjiEl.textContent = displayText.sub;
  }
  posEl.textContent = card.pos;
  knownButton.classList.toggle("hidden", currentPhase === "stage2");
  if (currentPhase === "stage2" && fullMeaning && fullMeaning !== displayText.main) {
    answerAllMeanings.textContent = fullMeaning;
    answerMeaningExtra.classList.remove("hidden");
  }

  if (card.confusions.length > 0) {
    confusionsEl.innerHTML = card.confusions.map((item) => (
      `<div class="confusion-chip ${item.kind === "sense" ? "sense-chip" : ""}"><strong>${escapeHtml(item.kana)}</strong><span>${escapeHtml(item.kanji)} · ${escapeHtml(item.meaning)}</span></div>`
    )).join("");
    confusionFold.classList.remove("hidden");
    confusionsEl.classList.remove("hidden");
  }

  if (currentPhase === "kanji" && card.kanjiComponents && card.kanjiComponents.length > 0) {
    formsEl.innerHTML = card.kanjiComponents.map(renderKanjiComponent).join("");
    formsEl.classList.remove("hidden");
  } else if (card.conjugations.length > 0) {
    const pairHtml = card.verbPair ? `
      <div class="form-chip verb-pair-chip">
        <span>${escapeHtml(card.verbPair.voice)} · 对应${escapeHtml(card.verbPair.pairVoice)}</span>
        <strong>${escapeHtml(card.verbPair.kanji)}（${escapeHtml(card.verbPair.kana)}）</strong>
        <em>${escapeHtml(card.verbPair.note || card.verbPair.meaning || "")}</em>
      </div>
    ` : "";
    formsEl.innerHTML = pairHtml + card.conjugations.map((item) => (
      `<div class="form-chip"><span>${item.label}</span><strong>${renderMarkedKanjiText(item.value, card.kanjiComponents)}</strong></div>`
    )).join("");
    formsEl.classList.remove("hidden");
  }

  if (card.example && (card.example.jp || card.example.meaning)) {
    exampleJp.textContent = card.example.jp || "";
    exampleMeaning.textContent = card.example.meaning || "";
    exampleBox.classList.remove("hidden");
  }

  editMeaningButton.classList.remove("hidden");
}

function renderSeenWordRow(word) {
  const status = word.knownForever ? "已熟识" : `分数 ${word.score}`;
  const displayText = answerDisplayText(word, "stage1");
  const mistakeText = [
    word.forgotCount ? `忘 ${word.forgotCount}` : "",
    word.fuzzyCount ? `糊 ${word.fuzzyCount}` : "",
    word.rightCount ? `对 ${word.rightCount}` : "",
    word.seenCount ? `见 ${word.seenCount}` : "",
  ].filter(Boolean).join(" · ");
  return `
    <article class="word-table-row ${word.knownForever ? "is-known" : ""}" data-word-id="${word.id}">
      <div class="word-table-score">
        <strong>${escapeHtml(status)}</strong>
        <span>${escapeHtml(mistakeText || "未记录")}</span>
      </div>
      <div class="word-table-word">
        <strong>${escapeHtml(displayText.main)}</strong>
        <span>${escapeHtml(displayText.sub)}</span>
      </div>
      <p>${escapeHtml(word.meaning)}</p>
      <div class="word-table-actions">
        <button class="quick-master" data-quick-answer="known_forever" type="button">熟识</button>
        <button data-quick-answer="know" type="button">认识</button>
        <button data-quick-answer="forgot" type="button">忘记</button>
        <button data-quick-answer="fuzzy" type="button">模糊</button>
      </div>
    </article>
  `;
}

function updateSeenWordRow(word) {
  const row = wordTableList.querySelector(`[data-word-id="${word.id}"]`);
  if (!row) return;
  if (word.knownForever) {
    row.classList.add("removing");
    setTimeout(() => row.remove(), 180);
    return;
  }
  row.outerHTML = renderSeenWordRow(word);
}

async function loadSeenWords(reset = false) {
  if (wordTableLoading || (!wordTableHasMore && !reset)) return;
  wordTableLoading = true;
  if (reset) {
    wordTableOffset = 0;
    wordTableHasMore = true;
    wordTableList.innerHTML = "";
  }
  wordTableLoadingEl.textContent = "加载中...";
  wordTableLoadingEl.classList.remove("hidden");
  try {
    const data = await request(`/api/seen-words?offset=${wordTableOffset}&limit=80&sort=${wordTableSort}`);
    wordTableOffset = data.nextOffset;
    wordTableHasMore = data.hasMore;
    wordTableCount.textContent = `${wordTableOffset}/${data.total}`;
    wordTableList.insertAdjacentHTML("beforeend", data.words.map(renderSeenWordRow).join(""));
    wordTableLoadingEl.textContent = wordTableHasMore ? "继续下滑加载" : "已经到底";
  } catch (error) {
    wordTableLoadingEl.textContent = "加载失败，稍后重试";
  } finally {
    wordTableLoading = false;
  }
}

function showWordTable(returnView) {
  wordTableReturnView = returnView;
  cardEl.classList.add("hidden");
  calendarPanel.classList.add("hidden");
  finishPanel.classList.add("hidden");
  wordTablePanel.classList.remove("hidden");
  wordTablePanel.scrollTop = 0;
  loadSeenWords(true);
}

function closeWordTable() {
  wordTablePanel.classList.add("hidden");
  if (wordTableReturnView === "calendar") {
    showCalendar();
    return;
  }
  showFinish();
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
  return !event.target.closest([
    "button",
    ".ghost-eye",
    ".daily-progress",
    ".actions",
    ".kanji-mark-button",
    ".fold-toggle",
    ".confusions",
    ".calendar-modal",
    ".calendar-panel",
    ".finish-panel",
    ".word-table-panel",
    ".meaning-editor-modal",
  ].join(","));
}

async function loadNext() {
  const data = await request("/api/next");
  currentPhase = data.phase || data.stats.phase || "stage1";
  updateStats(data.stats);
  renderCard(data.card);
}

async function continueStage2() {
  try {
    continueStage2Button.disabled = true;
    const data = await request("/api/continue-stage2", { method: "POST", body: "{}" });
    currentPhase = data.phase || data.stats.phase || "stage2";
    updateStats(data.stats);
    renderCard(data.card);
  } catch (error) {
    continueStage2Button.disabled = false;
    continueStage2Button.textContent = "连接失败，刷新重试";
  }
}

async function continueKanji() {
  try {
    continueKanjiButton.disabled = true;
    continueKanjiFromFinish.disabled = true;
    const data = await request("/api/continue-kanji", { method: "POST", body: "{}" });
    currentPhase = data.phase || data.stats.phase || "kanji";
    updateStats(data.stats);
    renderCard(data.card);
  } catch (error) {
    continueKanjiButton.disabled = false;
    continueKanjiFromFinish.disabled = false;
    continueKanjiButton.textContent = "连接失败，刷新重试";
    continueKanjiFromFinish.textContent = "连接失败，刷新重试";
  }
}

async function answer(answerValue) {
  if (!currentCard) return;
  actions.classList.add("hidden");
  const data = await request("/api/answer", {
    method: "POST",
    body: JSON.stringify({ wordId: currentCard.id, answer: answerValue }),
  });
  currentPhase = data.phase || data.stats.phase || currentPhase;
  undoButton.disabled = false;
  updateStats(data.stats);
  renderCard(data.card);
}

async function undoLast() {
  const data = await request("/api/undo", { method: "POST", body: "{}" });
  currentPhase = data.phase || data.stats.phase || currentPhase;
  updateStats(data.stats);
  renderCard(data.card);
  undoButton.disabled = true;
}

async function returnToPhaseMenu() {
  if (returnPhaseButton.dataset.busy === "1") return;
  try {
    returnPhaseButton.dataset.busy = "1";
    const data = await request("/api/return-checkin", { method: "POST", body: "{}" });
    currentPhase = data.phase || data.stats.phase || "checkin";
    updateStats(data.stats);
    returnPhaseButton.classList.add("hidden");
    delete returnPhaseButton.dataset.busy;
    renderCard(data.card);
  } catch (error) {
    delete returnPhaseButton.dataset.busy;
  }
}

async function markKanjiComponent(char, marked) {
  const data = await request("/api/kanji-mark", {
    method: "POST",
    body: JSON.stringify({ char, marked }),
  });
  if (currentCard && Array.isArray(currentCard.kanjiComponents)) {
    currentCard.kanjiComponents = currentCard.kanjiComponents.map((item) => (
      item.char === data.component.char ? data.component : item
    ));
    formsEl.innerHTML = currentCard.kanjiComponents.map(renderKanjiComponent).join("");
    if (currentPhase === "kanji") {
      meaningEl.innerHTML = renderMarkedKanjiText(compactPromptText(currentCard.kanji || ""), currentCard.kanjiComponents);
    } else {
      const displayText = answerDisplayText(currentCard);
      kanjiEl.innerHTML = renderMarkedKanjiText(displayText.sub, currentCard.kanjiComponents);
    }
  }
}

function openMeaningEditor() {
  if (!currentCard) return;
  meaningEditorInput.value = currentCard.meaning || "";
  meaningEditorModal.classList.remove("hidden");
  meaningEditorInput.focus();
  meaningEditorInput.select();
}

function closeMeaningEditor() {
  meaningEditorModal.classList.add("hidden");
}

async function saveMeaningEdit() {
  if (!currentCard) return;
  const trimmed = meaningEditorInput.value.trim();
  if (!trimmed) return;
  const wasRevealed = revealed;
  meaningEditorSave.disabled = true;
  try {
    const data = await request("/api/update-meaning", {
      method: "POST",
      body: JSON.stringify({ wordId: currentCard.id, meaning: trimmed }),
    });
    currentCard = { ...currentCard, ...data.card };
    closeMeaningEditor();
    renderCard(currentCard);
    if (wasRevealed) reveal();
  } finally {
    meaningEditorSave.disabled = false;
  }
}

cardEl.addEventListener("click", (event) => {
  if (shouldRevealFromClick(event)) reveal();
});
document.addEventListener("click", (event) => {
  if (shouldRevealFromClick(event)) reveal();
});
meaningEyeButton.addEventListener("click", (event) => {
  event.stopPropagation();
  allMeaningsEl.classList.toggle("hidden");
});
answerMeaningEyeButton.addEventListener("click", (event) => {
  event.stopPropagation();
  answerAllMeanings.classList.toggle("hidden");
});
editMeaningButton.addEventListener("click", (event) => {
  event.stopPropagation();
  openMeaningEditor();
});
meaningEditorCancel.addEventListener("click", closeMeaningEditor);
meaningEditorSave.addEventListener("click", saveMeaningEdit);
meaningEditorModal.addEventListener("click", (event) => {
  if (event.target === meaningEditorModal) closeMeaningEditor();
});
meaningEditorInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMeaningEditor();
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    saveMeaningEdit();
  }
});
formsEl.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-kanji-mark]");
  if (!button) return;
  event.stopPropagation();
  button.disabled = true;
  try {
    await markKanjiComponent(button.dataset.kanjiChar, button.dataset.kanjiMark === "mark");
  } catch (error) {
    button.disabled = false;
  }
});
confusionToggle.addEventListener("click", () => {
  confusionsEl.classList.toggle("hidden");
});
actions.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-answer]");
  if (!button) return;
  answer(button.dataset.answer);
});
undoButton.addEventListener("click", undoLast);
returnPhaseButton.addEventListener("click", returnToPhaseMenu);
continueStage2Button.addEventListener("click", continueStage2);
continueKanjiButton.addEventListener("click", continueKanji);
continueKanjiFromFinish.addEventListener("click", continueKanji);
prevMonthButton.addEventListener("click", () => {
  visibleCalendarMonth = shiftMonth(visibleCalendarMonth, -1);
  renderCalendar();
});
nextMonthButton.addEventListener("click", () => {
  visibleCalendarMonth = shiftMonth(visibleCalendarMonth, 1);
  renderCalendar();
});
openCalendarButton.addEventListener("click", () => openCalendarModal(false));
calendarModal.addEventListener("click", (event) => {
  if (event.target.closest(".month-button")) return;
  closeCalendarModal();
});
openWordTableFromCalendar.addEventListener("click", () => showWordTable("calendar"));
openWordTableFromFinish.addEventListener("click", () => showWordTable("finish"));
closeWordTableButton.addEventListener("click", closeWordTable);
wordTableSortEl.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-sort]");
  if (!button || button.dataset.sort === wordTableSort) return;
  wordTableSort = button.dataset.sort;
  wordTableSortEl.querySelectorAll("button").forEach((item) => {
    item.classList.toggle("active", item.dataset.sort === wordTableSort);
  });
  wordTablePanel.scrollTop = 0;
  loadSeenWords(true);
});
wordTablePanel.addEventListener("scroll", () => {
  if (wordTablePanel.scrollTop + wordTablePanel.clientHeight >= wordTablePanel.scrollHeight - 260) {
    loadSeenWords();
  }
});
wordTableList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-quick-answer]");
  if (!button) return;
  const row = button.closest("[data-word-id]");
  if (!row) return;
  const wordId = Number(row.dataset.wordId);
  button.disabled = true;
  try {
    const data = await request("/api/quick-grade", {
      method: "POST",
      body: JSON.stringify({ wordId, answer: button.dataset.quickAnswer }),
    });
    updateStats(data.stats);
    updateSeenWordRow(data.word);
  } catch (error) {
    button.disabled = false;
    row.classList.add("has-error");
    setTimeout(() => row.classList.remove("has-error"), 600);
  }
});

loadNext().catch(() => {
  meaningEl.textContent = "请先运行后端";
  kanaEl.textContent = "";
  kanjiEl.textContent = "";
  posEl.textContent = "";
  if (!latestStats) {
    finishPanel.classList.add("hidden");
    cardEl.classList.remove("hidden");
  }
});
