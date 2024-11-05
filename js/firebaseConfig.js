// firebaseConfig.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-analytics.js';


// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCXku2yi-fO6LzaiUCGJ7QeLzMTd34tTxw",
  authDomain: "shortener-dc19f.firebaseapp.com",
  projectId: "shortener-dc19f",
  storageBucket: "shortener-dc19f.firebasestorage.app",
  messagingSenderId: "971932586814",
  appId: "1:971932586814:web:11a4a85aaac77b2f87926f",
  measurementId: "G-B5JNKVWH9M"
};


// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Exporta Firebase y Firestore para usarlos en otros archivos
export { app, analytics, db };
