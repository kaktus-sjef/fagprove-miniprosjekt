import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  browserPopupRedirectResolver
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseApiKey = process.env.REACT_APP_FIREBASE_API_KEY;

if (!firebaseApiKey) {
  throw new Error("Mangler miljøvariabelen REACT_APP_FIREBASE_API_KEY.");
}

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: "fagprove-miniprosjekt.firebaseapp.com",
  projectId: "fagprove-miniprosjekt",
  storageBucket: "fagprove-miniprosjekt.firebasestorage.app",
  messagingSenderId: "683430899031",
  appId: "1:683430899031:web:f9ddf1c9adefcf9cf12212",
  measurementId: "G-DP23DHZJQG"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver
});
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account"
});
