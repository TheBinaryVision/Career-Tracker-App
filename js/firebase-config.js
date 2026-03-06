// ============================================================
//  firebase-config.js — FIXED with your real Firebase keys
//  No import statements — uses compat CDN (loaded in HTML)
// ============================================================

const firebaseConfig = {
  apiKey:            "AIzaSyBKuEh12IHhdwWD-l3kk67OYB_ZFPVPvMo",
  authDomain:        "career-tracker-app-b7a41.firebaseapp.com",
  projectId:         "career-tracker-app-b7a41",
  storageBucket:     "career-tracker-app-b7a41.firebasestorage.app",
  messagingSenderId: "476415299757",
  appId:             "1:476415299757:web:18796d1bf75b6350ef7624"
};

// Initialize Firebase (compat style — works with CDN scripts in HTML)
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();