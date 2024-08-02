// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Importa a autenticação
import { getFirestore } from "firebase/firestore"; // Importa Firestore se necessário

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3tzna3npRAunU6vHulIXTX6-ALOYNMRg",
  authDomain: "tarefista.firebaseapp.com",
  projectId: "tarefista",
  storageBucket: "tarefista.appspot.com",
  messagingSenderId: "104050667822",
  appId: "1:104050667822:web:515935d732fc3aaf228abf",
  measurementId: "G-QJPPMWLBZY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Inicializa a autenticação
const db = getFirestore(app); // Inicializa o Firestore

// Exporta os módulos para uso em outros lugares
export { app, analytics, auth, db };
