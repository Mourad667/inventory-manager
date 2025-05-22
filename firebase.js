// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOYJTZgMEPAU7XluTEkXyDmw9mROemfMM",
  authDomain: "pfaa-b01e2.firebaseapp.com",
  projectId: "pfaa-b01e2",
  storageBucket: "pfaa-b01e2.appspot.com",
  messagingSenderId: "815145873989",
  appId: "1:815145873989:web:34e17ba6fc68c1f871e92c",
  measurementId: "G-WCZHC4Q3KD"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    app = getApp();
  } else {
    console.error('Firebase initialization error:', error);
  }
}

// Initialize Firebase services
const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app, "gs://pfaa-b01e2.appspot.com");

export { firestore, auth, storage };