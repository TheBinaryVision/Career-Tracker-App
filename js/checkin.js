// ============================================================
//  checkin.js  —  Daily check-in form logic
// ============================================================

const TOOLS = [
  'HTML/CSS','JavaScript','React','Node.js','Python','TypeScript',
  'SQL','MongoDB','Git','Firebase','REST APIs','Docker',
  'Tailwind CSS','Next.js','Express','System Design',
  'Data Structures','AI/ML','OpenAI API','VS Code'
];

let checkinData = {
  mood: null, energy: null, focus: null,
  tools: [], customTools: [],
  accomplishment: '', hoursWorked: null,
  efficiency: null, capacity: null,
  blocker: '', tomorrowGoal: '', alignment: null, win: ''
};

let currentStep = 1;

function pageInit(user) {
  // Set today's date in header
  document.getElementById('checkin-date').textContent =
    new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  // Build scale buttons
  buildScale('scale-energy', 10, 'energy');
  buildScale('scale-focus', 10, 'focus');
  buildScale('scale-efficiency', 10, 'efficiency');
  buildScale('scale-alignment', 10, 'alignment');

  // Build tool tags
  const grid = document.getElementById('tool-tags');
  TOOLS.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn';
    btn.textContent = t;
    btn.onclick = () => toggleTool(btn, t);
    grid.appendChild(btn);
  });

  // Build hour selector
  const hourDiv = document.getElementById('hour-select');
  [0.5,1,1.5,2,3,4,5,6,7,8].forEach(h => {
    const btn = document.createElement('button');
    btn.className = 'hour-btn';
    btn.textContent = h < 1 ? '30m' : `${h}h`;
    btn.dataset.val = h;
    btn.onclick = () => {
      document.querySelectorAll('.hour-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      checkinData.hoursWorked = h;
    };
    hourDiv.appendChild(btn);
  });
}

function buildScale(containerId, max, field) {
  const el = document.getElementById(containerId);
  for (let i = 1; i <= max; i++) {
    const btn = document.createElement('button');
    btn.className = 'scale-btn';
    btn.textContent = i;
    btn.onclick = () => {
      el.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      checkinData[field] = i;
    };
    el.appendChild(btn);
  }
}

function selectMood(val) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`.mood-btn[data-mood="${val}"]`).classList.add('selected');
  checkinData.mood = val;
}

function toggleTool(btn, tool) {
  btn.classList.toggle('selected');
  if (btn.classList.contains('selected')) {
    checkinData.tools.push(tool);
  } else {
    checkinData.tools = checkinData.tools.filter(t => t !== tool);
  }
}

function addCustomTool() {
  const input = document.getElementById('custom-tool');
  const val   = input.value.trim();
  if (!val) return;

  const grid = document.getElementById('tool-tags');
  const btn  = document.createElement('button');
  btn.className = 'tag-btn selected';
  btn.textContent = val;
  checkinData.tools.push(val);
  btn.onclick = () => toggleTool(btn, val);
  grid.appendChild(btn);
  input.value = '';
}

function selectCapacity(cap) {
  document.querySelectorAll('.cap-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`.cap-btn[data-cap="${cap}"]`).classList.add('selected');
  checkinData.capacity = cap;
}

function goStep(n) {
  // Update step dot
  document.getElementById(`dot-${currentStep}`)?.classList.add('done');
  document.getElementById(`dot-${n}`)?.classList.add('active');

  document.getElementById(`step-${currentStep}`).classList.add('hidden');
  document.getElementById(`step-${n}`).classList.remove('hidden');
  currentStep = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function submitCheckin() {
  // Collect text inputs
  checkinData.accomplishment = document.getElementById('accomplishment').value.trim();
  checkinData.blocker        = document.getElementById('blocker').value.trim();
  checkinData.tomorrowGoal   = document.getElementById('tomorrow-goal').value.trim();
  checkinData.win            = document.getElementById('win-today').value.trim();

  const uid = getUID();
  if (!uid) return;

  const today    = new Date().toISOString().split('T')[0];
  const deviceInfo = Tracker.getDeviceInfo();

  const payload = {
    ...checkinData,
    dateISO:   today,
    date:      new Date().toDateString(),
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    ...deviceInfo
  };

  // Save to Firestore under users/{uid}/checkins/{today}
  await db.collection('users').doc(uid)
    .collection('checkins').doc(today)
    .set(payload);

  // Show success screen
  document.getElementById(`step-${currentStep}`).classList.add('hidden');
  document.getElementById('step-success').classList.remove('hidden');

  const moodEmojis = { 5:'😄 Excellent',4:'🙂 Good',3:'😐 Okay',2:'😕 Tough',1:'😩 Bad' };
  document.getElementById('checkin-summary').innerHTML = `
    <div class="summary-row"><span>Mood</span><span>${moodEmojis[checkinData.mood] || '—'}</span></div>
    <div class="summary-row"><span>Energy</span><span>${checkinData.energy || '—'}/10</span></div>
    <div class="summary-row"><span>Hours worked</span><span>${checkinData.hoursWorked || '—'}h</span></div>
    <div class="summary-row"><span>Efficiency</span><span>${checkinData.efficiency || '—'}/10</span></div>
    <div class="summary-row"><span>Capacity</span><span>${checkinData.capacity || '—'}</span></div>
    ${checkinData.win ? `<div class="summary-row"><span>Win 🏆</span><span>${checkinData.win}</span></div>` : ''}
  `;
}
