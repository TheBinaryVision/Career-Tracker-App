// ============================================================
//  todo.js — NEW FILE
//  To-do list: add, complete, delete, filter, sort
//  Works offline — syncs to Firebase when back online
// ============================================================

let allTasks     = [];
let currentFilter = 'all';
let quickAddOpen  = false;
let localTasksKey = ''; // set after auth

// ---- PAGE INIT ----
async function pageInit(user) {
  localTasksKey = `aidev_tasks_${user.uid}`;
  await loadTasks(user.uid);
  renderRoadmapQuickAdd();
  renderTasks();

  // Enter key to add task
  document.getElementById('new-task-text').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });

  // Set today's date as default due date
  document.getElementById('new-task-due').value = new Date().toISOString().split('T')[0];
}

// ---- LOAD TASKS ----
async function loadTasks(uid) {
  // Load from localStorage first (instant, works offline)
  const local = localStorage.getItem(localTasksKey);
  if (local) {
    try { allTasks = JSON.parse(local); } catch { allTasks = []; }
  }
  renderTasks(); // show immediately from cache

  // Then load from Firebase if online
  if (navigator.onLine) {
    try {
      const snap = await db.collection('users').doc(uid)
        .collection('todos')
        .orderBy('createdAt', 'desc')
        .limit(200)
        .get();

      if (!snap.empty) {
        allTasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        saveLocal();
        renderTasks();
      }
    } catch (e) {
      console.warn('[Todo] Firebase load failed, using local cache:', e.message);
    }
  }
}

// ---- SAVE TO LOCALSTORAGE ----
function saveLocal() {
  localStorage.setItem(localTasksKey, JSON.stringify(allTasks));
}

// ---- ADD TASK ----
async function addTask() {
  const text     = document.getElementById('new-task-text').value.trim();
  const category = document.getElementById('new-task-category').value;
  const priority = document.getElementById('new-task-priority').value;
  const due      = document.getElementById('new-task-due').value;

  if (!text) {
    document.getElementById('new-task-text').focus();
    return;
  }

  const uid = getUID();
  if (!uid) return;

  const task = {
    text,
    category,
    priority,
    due:       due || null,
    done:      false,
    doneAt:    null,
    createdAt: Date.now(),
    dateISO:   new Date().toISOString().split('T')[0],
  };

  // Optimistically add to local list immediately
  const tempId = `local_${Date.now()}`;
  const localTask = { ...task, id: tempId };
  allTasks.unshift(localTask);
  saveLocal();
  renderTasks();

  // Clear input
  document.getElementById('new-task-text').value = '';

  // Save to Firebase
  try {
    const docRef = await OfflineQueue.safeAdd(
      `users/${uid}/todos`,
      { ...task, createdAt: firebase.firestore.FieldValue.serverTimestamp() }
    );

    // Replace temp local entry with real Firebase ID if online
    if (navigator.onLine && docRef) {
      allTasks = allTasks.filter(t => t.id !== tempId);
      allTasks.unshift({ ...task, id: docRef.id });
      saveLocal();
      renderTasks();
    }
  } catch (e) {
    console.warn('[Todo] Add failed, kept locally:', e.message);
  }
}

// ---- TOGGLE DONE ----
async function toggleTask(taskId) {
  const uid  = getUID();
  const task = allTasks.find(t => t.id === taskId);
  if (!task) return;

  task.done  = !task.done;
  task.doneAt = task.done ? Date.now() : null;
  saveLocal();
  renderTasks();

  const path = `users/${uid}/todos/${taskId}`;
  if (!taskId.startsWith('local_')) {
    await OfflineQueue.safeUpdate(path, { done: task.done, doneAt: task.doneAt });
  }
}

// ---- DELETE TASK ----
async function deleteTask(taskId) {
  const uid = getUID();
  allTasks   = allTasks.filter(t => t.id !== taskId);
  saveLocal();
  renderTasks();

  if (!taskId.startsWith('local_') && navigator.onLine) {
    try {
      await db.collection('users').doc(uid).collection('todos').doc(taskId).delete();
    } catch (e) {
      console.warn('[Todo] Delete failed:', e.message);
    }
  }
}

// ---- SET FILTER ----
function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

// ---- TOGGLE QUICK ADD ----
function toggleQuickAdd() {
  quickAddOpen = !quickAddOpen;
  document.getElementById('roadmap-quickadd-list').style.display = quickAddOpen ? 'block' : 'none';
}

// ---- RENDER ROADMAP QUICK-ADD ----
function renderRoadmapQuickAdd() {
  const container = document.getElementById('roadmap-quickadd-list');
  let html = '';

  PHASES.forEach(phase => {
    html += `<div style="margin-bottom:12px">
      <div style="font-size:12px;color:var(--muted);margin-bottom:6px;font-weight:600">${phase.emoji} ${phase.title}</div>`;
    phase.skills.forEach(skill => {
      const alreadyAdded = allTasks.some(t => t.text === skill.name && t.category === 'roadmap');
      html += `<button class="roadmap-skill-btn ${alreadyAdded ? 'already-added' : ''}"
        onclick="quickAddSkill('${skill.name.replace(/'/g,"\\'")}', '${phase.title}')">
        ${alreadyAdded ? '✓' : '+'} ${skill.name}
        <span style="color:var(--muted);font-size:11px">${skill.time}</span>
      </button>`;
    });
    html += '</div>';
  });

  container.innerHTML = html;
}

async function quickAddSkill(skillName, phaseName) {
  document.getElementById('new-task-text').value     = skillName;
  document.getElementById('new-task-category').value = 'roadmap';
  document.getElementById('new-task-priority').value = 'high';
  await addTask();
  renderRoadmapQuickAdd(); // refresh to show as added
}

// ---- RENDER TASKS ----
function renderTasks() {
  const today     = new Date().toISOString().split('T')[0];
  const sortBy    = document.getElementById('sort-select')?.value || 'created';
  const listEl    = document.getElementById('task-list');
  const emptyEl   = document.getElementById('todo-empty');

  // Filter
  let filtered = allTasks.filter(t => {
    if (currentFilter === 'all')      return !t.done;
    if (currentFilter === 'today')    return t.dateISO === today && !t.done;
    if (currentFilter === 'done')     return t.done;
    return t.category === currentFilter && !t.done;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'priority') {
      const order = { high: 0, medium: 1, low: 2 };
      return (order[a.priority] || 1) - (order[b.priority] || 1);
    }
    if (sortBy === 'due') {
      if (!a.due && !b.due) return 0;
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    }
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  // Stats
  const todayTotal = allTasks.filter(t => t.dateISO === today).length;
  const todayDone  = allTasks.filter(t => t.dateISO === today && t.done).length;
  const pct = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  document.getElementById('todo-done-count').textContent  = todayDone;
  document.getElementById('todo-total-count').textContent = todayTotal;
  document.getElementById('todo-progress-fill').style.width = `${pct}%`;
  document.getElementById('todo-progress-label').textContent = `${pct}% complete`;

  if (!filtered.length) {
    listEl.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';

  const tagLabels = {
    roadmap: '🗺️ Roadmap', daily: '📅 Daily', learning: '📚 Learning',
    project: '🛠️ Project', other: '📌 Other'
  };
  const tagClasses = {
    roadmap: 'tag-roadmap', daily: 'tag-daily', learning: 'tag-learning',
    project: 'tag-project', other: 'tag-other'
  };

  listEl.innerHTML = filtered.map(task => {
    const dueLabel   = task.due ? formatDue(task.due, today) : '';
    const createdLabel = task.createdAt
      ? new Date(task.createdAt).toLocaleDateString('en-IN', { month:'short', day:'numeric' })
      : '';

    return `
      <div class="task-item ${task.done ? 'done' : ''}" id="task-${task.id}">
        <div class="task-check-wrap">
          <button class="task-check" onclick="toggleTask('${task.id}')" title="Mark ${task.done ? 'undone' : 'done'}">
            ${task.done ? '✓' : ''}
          </button>
        </div>
        <div class="task-body">
          <div class="task-text">${escHtml(task.text)}</div>
          <div class="task-meta">
            <span class="task-tag ${tagClasses[task.category] || 'tag-other'}">${tagLabels[task.category] || task.category}</span>
            <div class="priority-dot priority-${task.priority}" title="${task.priority} priority"></div>
            ${dueLabel ? `<span class="task-due ${isOverdue(task.due, today, task.done) ? 'overdue' : ''}">${dueLabel}</span>` : ''}
            <span class="task-created">${createdLabel}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="task-action-btn delete" onclick="deleteTask('${task.id}')" title="Delete">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

// ---- HELPERS ----
function formatDue(due, today) {
  if (due === today) return '📅 Today';
  if (due < today)   return `⚠️ ${due}`;
  return `📅 ${due}`;
}

function isOverdue(due, today, done) {
  return !done && due && due < today;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
