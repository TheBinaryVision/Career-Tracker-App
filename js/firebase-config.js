// ============================================================
//  firebase-config.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKuEh12IHhdwWD-l3kk67OYB_ZFPVPvMo",
  authDomain: "career-tracker-app-b7a41.firebaseapp.com",
  projectId: "career-tracker-app-b7a41",
  storageBucket: "career-tracker-app-b7a41.firebasestorage.app",
  messagingSenderId: "476415299757",
  appId: "1:476415299757:web:18796d1bf75b6350ef7624",
  measurementId: "G-Q8YVYVNGVF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();
