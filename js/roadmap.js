// ============================================================
//  roadmap.js  —  Roadmap with Firebase-synced skill tracking
// ============================================================

let activePhase = 0;
let checkedSkills = {};

async function pageInit(user) {
  // Load checked skills from Firebase
  const doc = await db.collection('users').doc(user.uid).get();
  checkedSkills = doc.data()?.checkedSkills || {};

  renderPhaseTabs();
  renderPhase();
  updateOverallProgress();
}

function renderPhaseTabs() {
  const container = document.getElementById('phase-tabs');
  container.innerHTML = PHASES.map((p, i) => `
    <button class="phase-tab ${i === activePhase ? 'active' : ''}"
      style="${i === activePhase ? `background:${p.color}` : ''}"
      onclick="switchPhase(${i})">${p.emoji} ${p.title}</button>
  `).join('');
}

function switchPhase(i) {
  activePhase = i;
  renderPhaseTabs();
  renderPhase();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderPhase() {
  const p   = PHASES[activePhase];
  const el  = document.getElementById('phase-content');

  const skillsHtml = p.skills.map(skill => {
    const key  = `${p.id}-${skill.name}`;
    const done = checkedSkills[key] === true;
    return `
      <div class="skill-row ${done ? 'done' : ''}" onclick="toggleSkill('${p.id}','${skill.name}')">
        <div class="skill-checkbox">${done ? '✓' : ''}</div>
        <div class="skill-info">
          <div class="skill-name">${skill.name}</div>
          <div class="skill-desc">${skill.desc}</div>
        </div>
        <div class="skill-time" style="color:${p.color}">${skill.time}</div>
      </div>`;
  }).join('');

  const resourcesHtml = p.resources.map(r =>
    `<a class="resource-link" href="${r.url}" target="_blank" rel="noopener">${r.name}</a>`
  ).join('');

  const backBtn = activePhase > 0
    ? `<button class="btn-back" onclick="switchPhase(${activePhase-1})">← Back</button>` : '';
  const nextBtn = activePhase < PHASES.length - 1
    ? `<button class="btn-next" style="background:${p.color}" onclick="switchPhase(${activePhase+1})">Next Phase →</button>` : '';

  el.innerHTML = `
    <div class="phase-header-card" style="background:${p.color}18;border:1px solid ${p.color}44">
      <div class="phase-duration" style="color:${p.color}">${p.duration}</div>
      <div class="phase-title-text">${p.emoji} ${p.title}</div>
      <div class="phase-goal">🎯 Goal: ${p.goal}</div>
    </div>

    <div class="skills-list">
      <div class="skills-section-label">Skills to learn — tap to check off</div>
      ${skillsHtml}
    </div>

    <div class="project-box" style="background:${p.color}10;border:1px solid ${p.color}44">
      <div class="project-box-label" style="color:${p.color}">🛠️ BUILD THIS PROJECT</div>
      <div class="project-name">${p.project}</div>
      <div class="project-milestone">✅ Milestone: ${p.milestone}</div>
    </div>

    <div class="skills-section-label" style="margin-top:20px">Free resources</div>
    <div class="resources-list">${resourcesHtml}</div>

    <div class="phase-nav">${backBtn}${nextBtn}</div>
  `;
}

async function toggleSkill(phaseId, skillName) {
  const key  = `${phaseId}-${skillName}`;
  checkedSkills[key] = !checkedSkills[key];

  // Save to Firebase
  const uid = getUID();
  if (uid) {
    await db.collection('users').doc(uid).update({
      [`checkedSkills.${key}`]: checkedSkills[key]
    });
  }

  renderPhase();
  updateOverallProgress();
}

function updateOverallProgress() {
  const total = PHASES.reduce((a, p) => a + p.skills.length, 0);
  const done  = Object.values(checkedSkills).filter(Boolean).length;
  const pct   = Math.round((done / total) * 100);

  document.getElementById('overall-pct').textContent   = `${pct}%`;
  document.getElementById('overall-fill').style.width  = `${pct}%`;
}
