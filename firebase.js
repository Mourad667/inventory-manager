// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpoqsq197jaGnsF2CgvktIm8XQBQGMuKE",
  authDomain: "inventory-management-9a7d6.firebaseapp.com",
  projectId: "inventory-management-9a7d6",
  storageBucket: "inventory-management-9a7d6.appspot.com",
  messagingSenderId: "799202126617",
  appId: "1:799202126617:web:5825493c9758010b86b388",
  measurementId: "G-KFHQKJKVYH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
const auth = getAuth(app);

export{firestore , auth};