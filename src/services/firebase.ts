import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Configuração oficial do projeto nuvi-saas
export const firebaseConfig = {
  apiKey: "AIzaSyB6B8PFVPZntcoB20cQXP6MWPy0ngJCnQs",
  authDomain: "nuvi-saas.firebaseapp.com",
  projectId: "nuvi-saas",
  storageBucket: "nuvi-saas.firebasestorage.app",
  messagingSenderId: "720046762484",
  appId: "1:720046762484:web:4fa819bacb25b2b6be71a1",
  measurementId: "G-T2D8B85M8E"
};

// Inicialização segura (evita reinicializar em hot reload do Vite)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Instância do Banco de Dados Firestore
export const db = getFirestore(app);

// Google Analytics (inicializado apenas se o navegador suportar)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics opcional silencioso
  });
}
