import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHpfTmnatswtyEN33TuwAY7mpw7uccbJ8",
  authDomain: "tickets-2a1ea.firebaseapp.com",
  projectId: "tickets-2a1ea",
  storageBucket: "tickets-2a1ea.firebasestorage.app",
  messagingSenderId: "468994408407",
  appId: "1:468994408407:web:2649a71c37b9104eaad592",
  measurementId: "G-DKSNW14N74"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, analytics };