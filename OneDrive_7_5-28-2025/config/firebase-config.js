
// Initialize Firebase
//const app = initializeApp(firebaseConfig);
//export const auth = getAuth(app);
// .env


// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// app.js
import { auth } from './firebase-config.js';

// Now you can use auth throughout your application
// Example usage:
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('User is signed in:', user);
  } else {
    console.log('No user is signed in.');
  }
});