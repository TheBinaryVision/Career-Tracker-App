// ============================================================
//  roadmap.js — FULL SYLLABUS VERSION
//  Phase > Skill > Topics > Subtopics (all checkable)
//  Saves every tick to Firebase + localStorage
// ============================================================

let checkedItems = {};   // key: "phaseId-skillName-topicName-subtopic"
let activePhase  = 1;

// ---- PAGE INIT ----
async function pageInit(user) {
  await loadProgress(user.uid);
  renderPhaseNav();
  renderPhase(activePhase);
  updateOverallProgress();
}

// ---- LOAD PROGRESS ----
async function loadProgress(uid) {
  // Load from localStorage first (instant)
  try {
    const local = localStorage.getItem(`aidev_roadmap_${uid}`);
    if (local) checkedItems = JSON.parse(local);
  } catch {}

  // Then sync from Firebase
  if (navigator.onLine) {
    try {
      const snap = await db.collection('users').doc(uid).get();
      if (snap.exists && snap.data().checkedItems) {
        checkedItems = snap.data().checkedItems;
        saveLocal(uid);
      }
    } catch (e) {
      console.warn('[Roadmap] Firebase load failed, using local:', e.message);
    }
  }
}

// ---- SAVE LOCAL ----
function saveLocal(uid) {
  try {
    const id = uid || getUID();
    localStorage.setItem(`aidev_roadmap_${id}`, JSON.stringify(checkedItems));
  } catch {}
}

// ---- SAVE TO FIREBASE ----
async function saveProgress() {
  const uid = getUID();
  if (!uid) return;
  saveLocal(uid);
  await OfflineQueue.safeUpdate(`users/${uid}`, { checkedItems });
}

// ---- ITEM KEY ----
function itemKey(phaseId, skillName, topicName, subtopic) {
  return `${phaseId}||${skillName}||${topicName}||${subtopic}`;
}

// ---- TOGGLE A SUBTOPIC ----
async function toggleSubtopic(key, el) {
  checkedItems[key] = !checkedItems[key];
  if (!checkedItems[key]) delete checkedItems[key];

  // Update checkbox visually
  const cb = document.querySelector(`[data-key="${CSS.escape(key)}"]`);
  if (cb) updateCheckbox(cb, !!checkedItems[key]);

  // Update parent topic & skill progress bars
  refreshProgressBars();
  updateOverallProgress();
  await saveProgress();
}

// ---- TOGGLE ALL SUBTOPICS IN A TOPIC ----
async function toggleTopic(phaseId, skillName, topicName) {
  const phase = PHASES.find(p => p.id === phaseId);
  const skill = phase?.skills.find(s => s.name === skillName);
  const topic = skill?.topics.find(t => t.name === topicName);
  if (!topic) return;

  const keys    = topic.subtopics.map(s => itemKey(phaseId, skillName, topicName, s));
  const allDone = keys.every(k => checkedItems[k]);

  keys.forEach(k => {
    if (allDone) delete checkedItems[k];
    else checkedItems[k] = true;
  });

  refreshProgressBars();
  updateOverallProgress();
  renderPhase(activePhase); // re-render to update all states
  await saveProgress();
}

// ---- RENDER PHASE NAV ----
function renderPhaseNav() {
  const nav = document.getElementById('phase-nav');
  if (!nav) return;

  nav.innerHTML = PHASES.map(p => {
    const pct = phasePercent(p.id);
    return `
      <button class="phase-nav-btn ${p.id === activePhase ? 'active' : ''}"
        onclick="switchPhase(${p.id})"
        style="--phase-color:${p.color}">
        <span class="phase-nav-emoji">${p.emoji}</span>
        <span class="phase-nav-title">${p.title}</span>
        <span class="phase-nav-pct">${pct}%</span>
        <div class="phase-nav-bar">
          <div class="phase-nav-bar-fill" style="width:${pct}%;background:${p.color}"></div>
        </div>
      </button>`;
  }).join('');
}

function switchPhase(id) {
  activePhase = id;
  renderPhaseNav();
  renderPhase(id);
}

// ---- RENDER A FULL PHASE ----
function renderPhase(phaseId) {
  const phase    = PHASES.find(p => p.id === phaseId);
  const container = document.getElementById('phase-content');
  if (!phase || !container) return;

  const phasePct = phasePercent(phaseId);

  let html = `
    <div class="phase-header" style="border-color:${phase.color}20">
      <div class="phase-header-top">
        <div>
          <div class="phase-badge" style="background:${phase.color}20;color:${phase.color}">
            ${phase.emoji} Phase ${phase.id} — ${phase.duration}
          </div>
          <h2 class="phase-title">${phase.title}</h2>
          <p class="phase-goal">🎯 Goal: ${phase.goal}</p>
        </div>
        <div class="phase-pct-ring">
          <svg viewBox="0 0 60 60" width="70" height="70">
            <circle cx="30" cy="30" r="25" fill="none" stroke="#1e2340" stroke-width="5"/>
            <circle cx="30" cy="30" r="25" fill="none" stroke="${phase.color}" stroke-width="5"
              stroke-dasharray="${(phasePct/100)*157} 157"
              stroke-dashoffset="39" stroke-linecap="round"/>
          </svg>
          <span class="phase-pct-label">${phasePct}%</span>
        </div>
      </div>

      <div class="phase-project-box">
        🛠️ <strong>Phase Project:</strong> ${phase.project}
      </div>
      <div class="phase-milestone-box">
        ✅ <strong>Milestone:</strong> ${phase.milestone}
      </div>
    </div>`;

  // Skills
  phase.skills.forEach(skill => {
    const skillPct  = skillPercent(phaseId, skill);
    const skillDone = skillPct === 100;

    html += `
      <div class="skill-card ${skillDone ? 'skill-done' : ''}" id="skill-${phaseId}-${slugify(skill.name)}">
        <div class="skill-card-header" onclick="toggleSkillExpand('${phaseId}-${slugify(skill.name)}')">
          <div class="skill-info">
            <div class="skill-done-icon">${skillDone ? '✅' : '○'}</div>
            <div>
              <div class="skill-name">${skill.name}
                ${skillDone ? '<span class="skill-complete-badge">Complete!</span>' : ''}
              </div>
              <div class="skill-meta">${skill.desc} · ⏱ ${skill.time}</div>
            </div>
          </div>
          <div class="skill-right">
            <div class="skill-pct-label">${skillPct}%</div>
            <div class="skill-expand-arrow" id="arrow-${phaseId}-${slugify(skill.name)}">▼</div>
          </div>
        </div>

        <div class="skill-progress-bar-wrap">
          <div class="skill-progress-bar" style="width:${skillPct}%;background:${phase.color}"></div>
        </div>

        <div class="skill-topics" id="topics-${phaseId}-${slugify(skill.name)}">`;

    skill.topics.forEach(topic => {
      const topicKeys  = topic.subtopics.map(s => itemKey(phaseId, skill.name, topic.name, s));
      const doneCnt    = topicKeys.filter(k => checkedItems[k]).length;
      const total      = topicKeys.length;
      const topicDone  = doneCnt === total;
      const topicPct   = Math.round((doneCnt / total) * 100);

      html += `
        <div class="topic-block">
          <div class="topic-header">
            <button class="topic-check-all ${topicDone ? 'all-done' : ''}"
              onclick="toggleTopic(${phaseId}, '${esc(skill.name)}', '${esc(topic.name)}')"
              title="${topicDone ? 'Uncheck all' : 'Check all'}">
              ${topicDone ? '✅' : '☐'}
            </button>
            <div class="topic-info">
              <span class="topic-name">${topic.name}</span>
              <span class="topic-count ${topicDone ? 'count-done' : ''}">${doneCnt}/${total}</span>
            </div>
            <div class="topic-mini-bar-wrap">
              <div class="topic-mini-bar" style="width:${topicPct}%;background:${phase.color}"></div>
            </div>
          </div>

          <div class="subtopics-list">`;

      topic.subtopics.forEach(sub => {
        const key   = itemKey(phaseId, skill.name, topic.name, sub);
        const done  = !!checkedItems[key];
        html += `
          <label class="subtopic-row ${done ? 'sub-done' : ''}" data-key="${key}">
            <span class="sub-checkbox ${done ? 'checked' : ''}" 
              data-key="${key}"
              onclick="event.preventDefault(); toggleSubtopic('${escKey(key)}', this)">
              ${done ? '✓' : ''}
            </span>
            <span class="sub-text">${sub}</span>
          </label>`;
      });

      html += `</div></div>`; // close subtopics-list, topic-block
    });

    html += `</div></div>`; // close skill-topics, skill-card
  });

  // Resources
  html += `<div class="resources-card">
    <div class="resources-title">📚 Resources for this phase</div>
    <div class="resources-list">
      ${phase.resources.map(r => `
        <a href="${r.url}" target="_blank" class="resource-link">${r.name}</a>
      `).join('')}
    </div>
  </div>`;

  container.innerHTML = html;

  // Expand first skill by default
  const firstSkill = phase.skills[0];
  if (firstSkill) expandSkill(`${phaseId}-${slugify(firstSkill.name)}`);
}

// ---- EXPAND / COLLAPSE SKILL ----
function toggleSkillExpand(id) {
  const topics = document.getElementById(`topics-${id}`);
  const arrow  = document.getElementById(`arrow-${id}`);
  if (!topics) return;
  const open = topics.style.display !== 'none' && topics.style.display !== '';
  topics.style.display = open ? 'none' : 'block';
  if (arrow) arrow.textContent = open ? '▼' : '▲';
}

function expandSkill(id) {
  const topics = document.getElementById(`topics-${id}`);
  const arrow  = document.getElementById(`arrow-${id}`);
  if (topics) topics.style.display = 'block';
  if (arrow)  arrow.textContent = '▲';
}

// ---- REFRESH PROGRESS BARS (without full re-render) ----
function refreshProgressBars() {
  const phase = PHASES.find(p => p.id === activePhase);
  if (!phase) return;

  phase.skills.forEach(skill => {
    const skillPct = skillPercent(activePhase, skill);
    const bar      = document.querySelector(`#skill-${activePhase}-${slugify(skill.name)} .skill-progress-bar`);
    const lbl      = document.querySelector(`#skill-${activePhase}-${slugify(skill.name)} .skill-pct-label`);
    if (bar) bar.style.width = `${skillPct}%`;
    if (lbl) lbl.textContent = `${skillPct}%`;

    skill.topics.forEach(topic => {
      const keys     = topic.subtopics.map(s => itemKey(activePhase, skill.name, topic.name, s));
      const doneCnt  = keys.filter(k => checkedItems[k]).length;
      const total    = keys.length;
      const topicPct = Math.round((doneCnt / total) * 100);

      // Update mini bar & count for this topic
      document.querySelectorAll('.topic-block').forEach(block => {
        const nameEl = block.querySelector('.topic-name');
        if (nameEl && nameEl.textContent === topic.name) {
          const miniBar = block.querySelector('.topic-mini-bar');
          const countEl = block.querySelector('.topic-count');
          const btnEl   = block.querySelector('.topic-check-all');
          if (miniBar) miniBar.style.width = `${topicPct}%`;
          if (countEl) { countEl.textContent = `${doneCnt}/${total}`; countEl.className = `topic-count ${doneCnt===total?'count-done':''}`; }
          if (btnEl)   { btnEl.textContent = doneCnt===total ? '✅' : '☐'; btnEl.className = `topic-check-all ${doneCnt===total?'all-done':''}`; }
        }
      });
    });
  });

  renderPhaseNav(); // update phase nav percentages
}

// ---- OVERALL PROGRESS ----
function updateOverallProgress() {
  let totalSubs = 0, doneSubs = 0;
  PHASES.forEach(phase => {
    phase.skills.forEach(skill => {
      skill.topics.forEach(topic => {
        topic.subtopics.forEach(sub => {
          totalSubs++;
          if (checkedItems[itemKey(phase.id, skill.name, topic.name, sub)]) doneSubs++;
        });
      });
    });
  });

  const pct = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0;
  const el  = document.getElementById('overall-progress');
  const bar = document.getElementById('overall-bar');
  const lbl = document.getElementById('overall-label');
  if (el)  el.textContent  = `${doneSubs} / ${totalSubs} topics`;
  if (bar) bar.style.width = `${pct}%`;
  if (lbl) lbl.textContent = `${pct}% complete`;
}

// ---- PERCENT HELPERS ----
function phasePercent(phaseId) {
  const phase = PHASES.find(p => p.id === phaseId);
  if (!phase) return 0;
  let total = 0, done = 0;
  phase.skills.forEach(skill => {
    skill.topics.forEach(topic => {
      topic.subtopics.forEach(sub => {
        total++;
        if (checkedItems[itemKey(phaseId, skill.name, topic.name, sub)]) done++;
      });
    });
  });
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

function skillPercent(phaseId, skill) {
  let total = 0, done = 0;
  skill.topics.forEach(topic => {
    topic.subtopics.forEach(sub => {
      total++;
      if (checkedItems[itemKey(phaseId, skill.name, topic.name, sub)]) done++;
    });
  });
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

// ---- CHECKBOX UPDATE ----
function updateCheckbox(el, done) {
  el.textContent  = done ? '✓' : '';
  el.className    = `sub-checkbox ${done ? 'checked' : ''}`;
  const row       = el.closest('.subtopic-row');
  if (row) row.className = `subtopic-row ${done ? 'sub-done' : ''}`;
}

// ---- UTILS ----
function slugify(str) { return str.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
function esc(str)     { return str.replace(/'/g, "\\'"); }
function escKey(key)  { return key.replace(/'/g, "\\'"); }
