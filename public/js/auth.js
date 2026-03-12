// ============================================================
//  auth.js — FIXED
//  Handles existing users missing new fields
// ============================================================

auth.onAuthStateChanged(user => {
  if (user) window.location.href = 'pages/dashboard.html';
});

function switchTab(tab) {
  document.getElementById('form-login').style.display  = tab === 'login'  ? 'block' : 'none';
  document.getElementById('form-signup').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('active',  tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
}

async function loginUser() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  errEl.textContent = '';
  if (!email || !password) { errEl.textContent = 'Please fill in all fields.'; return; }
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (e) {
    errEl.textContent = friendlyError(e.code);
  }
}

async function signupUser() {
  const name     = document.getElementById('signup-name').value.trim();
  const email    = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const github   = document.getElementById('signup-github').value.trim().replace('@','');
  const errEl    = document.getElementById('signup-error');
  errEl.textContent = '';

  if (!name || !email || !password) { errEl.textContent = 'Please fill in all required fields.'; return; }
  if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
    await db.collection('users').doc(cred.user.uid).set({
      name, email,
      github: github || '',
      createdAt:       firebase.firestore.FieldValue.serverTimestamp(),
      streak:          0,
      longestStreak:   0,
      totalDaysActive: 0,
      totalHours:      0,
      totalOpens:      0,
      checkedSkills:   {},
      checkedItems:    {}
    });
  } catch (e) {
    errEl.textContent = friendlyError(e.code);
  }
}

async function loginGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const user   = result.user;
    const doc    = await db.collection('users').doc(user.uid).get();

    if (!doc.exists) {
      // New Google user
      await db.collection('users').doc(user.uid).set({
        name:            user.displayName || 'Developer',
        email:           user.email,
        github:          '',
        createdAt:       firebase.firestore.FieldValue.serverTimestamp(),
        streak:          0,
        longestStreak:   0,
        totalDaysActive: 0,
        totalHours:      0,
        totalOpens:      0,
        checkedSkills:   {},
        checkedItems:    {}
      });
    } else {
      // Existing user — add any missing fields
      const data    = doc.data();
      const missing = {};
      if (data.totalOpens  === undefined) missing.totalOpens  = 0;
      if (data.checkedItems === undefined) missing.checkedItems = {};
      if (Object.keys(missing).length > 0) {
        await db.collection('users').doc(user.uid).update(missing);
      }
    }
  } catch (e) {
    document.getElementById('login-error').textContent = friendlyError(e.code);
  }
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found':        'No account found with this email.',
    'auth/wrong-password':        'Incorrect password.',
    'auth/email-already-in-use':  'An account already exists with this email.',
    'auth/invalid-email':         'Please enter a valid email address.',
    'auth/weak-password':         'Password must be at least 6 characters.',
    'auth/popup-closed-by-user':  'Google sign-in was cancelled.',
    'auth/network-request-failed':'Network error. Check your connection.',
    'auth/invalid-credential':    'Incorrect email or password.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}