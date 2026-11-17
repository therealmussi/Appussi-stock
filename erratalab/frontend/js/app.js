const TRAP_LABELS = {
  signe: "Erreur de signe",
  confusion_regle: "Confusion de règle",
  inattention: "Inattention",
  formule_mal_appliquee: "Formule mal appliquée",
  calcul: "Glissement de calcul",
  vocabulaire: "Vocabulaire / notation",
  autre: "Autre",
};

const SUBJECT_LABELS = {
  mathematiques: "Maths",
  physique: "Physique",
  langues: "Langues",
  autre: "Autre",
};

const state = { file: null, quizQuestions: [], quizDemo: false, answers: {} };

const $ = (sel) => document.querySelector(sel);

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function api(path, options = {}) {
  const resp = await fetch(path, options);
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.detail || `Erreur ${resp.status}`);
  return data;
}

document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    btn.classList.add("active");
    $(`#view-${btn.dataset.view}`).classList.add("active");
    if (btn.dataset.view === "history") loadHistory();
    if (btn.dataset.view === "dashboard") loadDashboard();
  });
});

const dropzone = $("#dropzone");
const fileInput = $("#file-input");

dropzone.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => setFile(fileInput.files[0]));
["dragover", "dragenter"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  })
);
["dragleave", "drop"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  })
);
dropzone.addEventListener("drop", (e) => setFile(e.dataTransfer.files[0]));

function setFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showStatus("Veuillez choisir une image (JPEG, PNG, WebP).", true);
    return;
  }
  state.file = file;
  const url = URL.createObjectURL(file);
  const preview = $("#dz-preview");
  preview.src = url;
  preview.classList.remove("hidden");
  $("#dz-empty").classList.add("hidden");
  $("#btn-analyze").disabled = false;
  $("#btn-reset").classList.remove("hidden");
  hideStatus();
}

$("#btn-reset").addEventListener("click", () => {
  state.file = null;
  fileInput.value = "";
  $("#dz-preview").classList.add("hidden");
  $("#dz-empty").classList.remove("hidden");
  $("#btn-analyze").disabled = true;
  $("#btn-reset").classList.add("hidden");
  $("#analyze-result").classList.add("hidden");
  hideStatus();
});

function showStatus(msg, isError = false) {
  const el = $("#analyze-status");
  el.textContent = msg;
  el.classList.toggle("error", isError);
  el.classList.remove("hidden");
}
function hideStatus() {
  $("#analyze-status").classList.add("hidden");
}

$("#btn-analyze").addEventListener("click", async () => {
  if (!state.file) return;
  const btn = $("#btn-analyze");
  btn.disabled = true;
  showStatus("⟳ OCR Mistral en cours — extraction du texte, des formules et des ratures…");
  $("#analyze-result").classList.add("hidden");
  try {
    const form = new FormData();
    form.append("file", state.file);
    const data = await api("/api/analyze", { method: "POST", body: form });
    renderAnalyze(data);
    hideStatus();
  } catch (err) {
    showStatus(`✗ ${err.message}`, true);
  } finally {
    btn.disabled = false;
  }
});

function errorCardHtml(e, showDate = true) {
  const trap = TRAP_LABELS[e.trap_type] || e.trap_type;
  const subject = SUBJECT_LABELS[e.subject] || e.subject;
  const wrong = e.original_text
    ? `<div class="diff">
         ${e.original_text ? `<span class="wrong">✗ ${escapeHtml(e.original_text)}</span>` : ""}
         ${e.corrected_text ? `<span class="right">✓ ${escapeHtml(e.corrected_text)}</span>` : ""}
       </div>`
    : "";
  return `
    <article class="error-card trap-${escapeHtml(e.trap_type)}">
      <div class="error-head">
        <div class="row gap-small" style="margin:0">
          <span class="badge b-subject">${escapeHtml(subject)}</span>
          <span class="badge b-trap t-${escapeHtml(e.trap_type)}">${escapeHtml(trap)}</span>
        </div>
        ${showDate ? `<span class="date">${fmtDate(e.created_at)}</span>` : ""}
      </div>
      <div class="notion">${escapeHtml(e.notion)}</div>
      ${wrong}
      ${e.explanation ? `<p class="explain">${escapeHtml(e.explanation)}</p>` : ""}
    </article>`;
}

function renderAnalyze(data) {
  const p = data.page;
  const demoNote = data.demo_mode
    ? `<p class="explain" style="margin-top:12px">⚠️ Mode démonstration : définissez <code>MISTRAL_API_KEY</code> pour activer l'OCR et l'analyse réelles.</p>`
    : "";
  $("#analyze-result").innerHTML = `
    <div class="panel">
      <h2>Compte-rendu d'analyse — ${escapeHtml(p.filename)}</h2>
      <p class="muted">${p.error_count} erreur(s) isolée(s) · matière : ${escapeHtml(
        SUBJECT_LABELS[p.subject] || p.subject
      )} · moteur : ${p.engine_mode === "demo" ? "démo" : "Mistral"}</p>
      <h3 style="margin-top:16px">Transcription OCR</h3>
      <div class="ocr-box">${escapeHtml(p.ocr_text)}</div>
      ${demoNote}
    </div>
    <div class="error-list">
      ${
        p.errors.map((e) => errorCardHtml(e, false)).join("") ||
        `<div class="empty-state">Aucune erreur détectée sur cette page.</div>`
      }
    </div>`;
  $("#analyze-result").classList.remove("hidden");
}

async function loadHistory() {
  const subject = $("#filter-subject").value;
  const trap = $("#filter-trap").value;
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (trap) params.set("trap", trap);
  const list = $("#history-list");
  list.innerHTML = `<div class="empty-state">Chargement…</div>`;
  try {
    const errors = await api(`/api/errors?${params}`);
    list.innerHTML =
      errors.map((e) => errorCardHtml(e)).join("") ||
      `<div class="empty-state">Aucune erreur enregistrée pour ces filtres. Analysez une page de cahier !</div>`;
  } catch (err) {
    list.innerHTML = `<div class="empty-state">✗ ${escapeHtml(err.message)}</div>`;
  }
}

$("#filter-subject").addEventListener("change", loadHistory);
$("#filter-trap").addEventListener("change", loadHistory);

function barRows(obj, warnFrom = 3) {
  const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return `<div class="empty-state">Pas encore de données.</div>`;
  const max = Math.max(...entries.map(([, v]) => v));
  return entries
    .map(([k, v]) => {
      const pct = Math.round((v / max) * 100);
      const cls = v >= warnFrom * 2 ? "danger" : v >= warnFrom ? "warn" : "";
      return `<div class="bar-row"><span>${escapeHtml(k)}</span>
        <div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>
        <span class="bar-count">${v}</span></div>`;
    })
    .join("");
}

async function loadDashboard() {
  const el = $("#dashboard-content");
  el.innerHTML = `<div class="panel"><div class="empty-state">Chargement…</div></div>`;
  try {
    const d = await api("/api/dashboard");
    const accuracy = d.quiz_accuracy == null ? "—" : `${Math.round(d.quiz_accuracy * 100)} %`;
    el.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${d.total_errors}</div><div class="stat-label">erreurs cataloguées</div></div>
        <div class="stat-card"><div class="stat-value">${d.total_pages}</div><div class="stat-label">pages analysées</div></div>
        <div class="stat-card"><div class="stat-value">${d.total_questions}</div><div class="stat-label">questions de quiz</div></div>
        <div class="stat-card"><div class="stat-value">${accuracy}</div><div class="stat-label">réussite aux quiz</div></div>
      </div>
      <div class="two-col">
        <div class="panel">
          <h3>Points faibles récurrents</h3>
          ${
            d.weak_points.length
              ? d.weak_points
                  .map(
                    (w) => `
                <div class="bar-row">
                  <span title="${escapeHtml(w.notion)}">${escapeHtml(
                      w.notion.length > 26 ? w.notion.slice(0, 25) + "…" : w.notion
                    )}</span>
                  <div class="bar-track"><div class="bar-fill ${
                    w.count >= 3 ? "danger" : w.count >= 2 ? "warn" : ""
                  }" style="width:${Math.min(100, w.count * 25)}%"></div></div>
                  <span class="bar-count">${w.count}</span>
                </div>`
                  )
                  .join("")
              : `<div class="empty-state">Analysez des pages pour révéler vos points faibles.</div>`
          }
        </div>
        <div>
          <div class="panel">
            <h3>Pièges cognitifs</h3>
            ${barRows(d.by_trap)}
          </div>
          <div class="panel">
            <h3>Par matière</h3>
            ${barRows(d.by_subject)}
          </div>
          <div class="panel">
            <h3>7 derniers jours</h3>
            ${barRows(Object.fromEntries(d.weekly.map((w) => [w.date.slice(5), w.count])))}
          </div>
        </div>
      </div>`;
  } catch (err) {
    el.innerHTML = `<div class="panel"><div class="empty-state">✗ ${escapeHtml(err.message)}</div></div>`;
  }
}

$("#btn-quiz").addEventListener("click", generateQuiz);

async function generateQuiz() {
  const btn = $("#btn-quiz");
  btn.disabled = true;
  btn.textContent = "⟳ Concoction des pièges…";
  const area = $("#quiz-area");
  area.innerHTML = "";
  try {
    const data = await api("/api/quiz/generate", { method: "POST" });
    state.quizQuestions = data.questions;
    state.quizDemo = data.demo_mode;
    state.answers = {};
    renderQuiz();
  } catch (err) {
    area.innerHTML = `<div class="panel"><div class="empty-state">✗ ${escapeHtml(err.message)}</div></div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Générer mon quiz du jour";
  }
}

function renderQuiz() {
  const area = $("#quiz-area");
  area.innerHTML =
    (state.quizDemo
      ? `<div class="panel"><p class="explain">⚠️ Mode démonstration : définissez <code>MISTRAL_API_KEY</code> pour des quiz générés sur mesure par Mistral.</p></div>`
      : "") +
    state.quizQuestions
      .map(
        (q, i) => `
      <div class="quiz-q" id="q-${q.id}">
        <div class="error-head">
          <span class="badge b-trap t-${escapeHtml(q.trap_type)}">${escapeHtml(TRAP_LABELS[q.trap_type] || q.trap_type)}</span>
          <span class="date">Question ${i + 1}/${state.quizQuestions.length} · ${escapeHtml(SUBJECT_LABELS[q.subject] || q.subject)}</span>
        </div>
        <div class="notion">${escapeHtml(q.question)}</div>
        <div class="muted small" style="margin-top:2px">Notion : ${escapeHtml(q.notion)}</div>
        <div class="choices">
          ${q.choices
            .map(
              (c, ci) =>
                `<button class="choice" data-q="${q.id}" data-i="${ci}">${"ABCD"[ci]}. ${escapeHtml(c)}</button>`
            )
            .join("")}
        </div>
        <div class="feedback hidden" id="fb-${q.id}"></div>
      </div>`
      )
      .join("");

  area.querySelectorAll(".choice").forEach((btn) => {
    btn.addEventListener("click", () => answerQuestion(btn));
  });
}

async function answerQuestion(btn) {
  const qId = Number(btn.dataset.q);
  const choice = Number(btn.dataset.i);
  const qEl = $(`#q-${qId}`);
  qEl.querySelectorAll(".choice").forEach((b) => (b.disabled = true));
  try {
    const res = await api("/api/quiz/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: qId, choice_index: choice }),
    });
    state.answers[qId] = res.was_correct;
    qEl.classList.add("answered");
    qEl.querySelectorAll(".choice").forEach((b) => {
      const idx = Number(b.dataset.i);
      if (idx === res.correct_index) b.classList.add("correct");
      else if (idx === choice) b.classList.add("wrong");
    });
    const fb = $(`#fb-${qId}`);
    fb.classList.remove("hidden");
    fb.classList.toggle("bad", !res.was_correct);
    fb.innerHTML = `<strong>${res.was_correct ? "✓ Juste !" : "✗ Piégé !"}</strong> ${escapeHtml(res.explanation)}`;

    const answeredCount = Object.keys(state.answers).length;
    if (answeredCount === state.quizQuestions.length) {
      const score = Object.values(state.answers).filter(Boolean).length;
      const banner = document.createElement("div");
      banner.className = "score-banner";
      banner.textContent = `🧪 Expérience terminée — score : ${score}/${state.quizQuestions.length}`;
      area.prepend(banner);
    }
  } catch (err) {
    qEl.querySelectorAll(".choice").forEach((b) => (b.disabled = false));
    showStatus(`✗ ${err.message}`, true);
  }
}
