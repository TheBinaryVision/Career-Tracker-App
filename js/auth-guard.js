// ============================================================
//  auth-guard.js  —  Redirects to login if not authenticated
//  Include on every protected page (dashboard, roadmap, etc.)
// ============================================================

let currentUser = null;

auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = '../index.html';
    return;
  }
  currentUser = user;

  // Set nav username
  const nameEl = document.getElementById('nav-username');
  if (nameEl) nameEl.textContent = user.displayName || user.email;

  // Fire page-specific init if defined
  if (typeof pageInit === 'function') pageInit(user);
});

function logoutUser() {
  auth.signOut().then(() => { window.location.href = '../index.html'; });
}

function getUID() {
  return currentUser ? currentUser.uid : null;
}

async function getUserProfile() {
  if (!currentUser) return null;
  const doc = await db.collection('users').doc(currentUser.uid).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function updateUserProfile(data) {
  if (!currentUser) return;
  await db.collection('users').doc(currentUser.uid).update(data);
}
