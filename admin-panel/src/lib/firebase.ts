import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAQc8vgqCQNemO8cI1re6hJfRTlY7xTqJA",
  authDomain: "mess-b93b5.firebaseapp.com",
  projectId: "mess-b93b5",
  storageBucket: "mess-b93b5.firebasestorage.app",
  messagingSenderId: "399472683367",
  appId: "1:399472683367:web:068172c3666f9797f3a7c2"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
