import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBlELwN96oQ-2G-W2oRTBPO_x6GjoGDkhE",
    authDomain: "studio-115710634-bdcb8.firebaseapp.com",
    projectId: "studio-115710634-bdcb8",
    storageBucket: "studio-115710634-bdcb8.firebasestorage.app",
    messagingSenderId: "495124923706",
    appId: "1:495124923706:web:f17332ede1062b01c2fc03"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
