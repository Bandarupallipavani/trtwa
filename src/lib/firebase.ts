import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANTx2x8Z2kfatRhEHThTo2bXTlu7RLOEg",
  authDomain: "trtwa-ro.firebaseapp.com",
  projectId: "trtwa-ro",
  storageBucket: "trtwa-ro.firebasestorage.app",
  messagingSenderId: "396566906074",
  appId: "1:396566906074:web:f53c7c4a28a585a39851e3",
  measurementId: "G-S1MLHFJYWK"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const db = getFirestore(app);

export { app, db };
