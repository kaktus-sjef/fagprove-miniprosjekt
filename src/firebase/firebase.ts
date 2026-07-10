// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBn44lNLuXopmvUuHdwL_rYy9a9qAJlCZE",
  authDomain: "fagprove-miniprosjekt.firebaseapp.com",
  projectId: "fagprove-miniprosjekt",
  storageBucket: "fagprove-miniprosjekt.firebasestorage.app",
  messagingSenderId: "683430899031",
  appId: "1:683430899031:web:f9ddf1c9adefcf9cf12212",
  measurementId: "G-DP23DHZJQG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();