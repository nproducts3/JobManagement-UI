import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCnzdH2LrkQvVW-DYK7qUmNCi4iepQDCFg",
  authDomain: "jobmanagement-9313e.firebaseapp.com",
  projectId: "jobmanagement-9313e",
  storageBucket: "jobmanagement-9313e.firebasestorage.app",
  messagingSenderId: "905712972391",
  appId: "1:905712972391:web:49e2b82cae8f44ddeedac2",
  measurementId: "G-JCBKL0YWHT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 