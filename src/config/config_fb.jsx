import { initializeApp } from "firebase/app";
import { getAuth, EmailAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseConfig = {
    apiKey: "AIzaSyAnKyN29Z9k2JOb0PLOZFtGwgtAcHt1xxs",
    authDomain: "filmfest-59e62.firebaseapp.com",
    projectId: "filmfest-59e62",
    storageBucket: "filmfest-59e62.appspot.com",
    messagingSenderId: "725454563119",
    appId: "1:725454563119:web:dd5644ab9de55b1e8d23da",
    measurementId: "G-HJBD20Z7SQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new EmailAuthProvider();
export const db = getFirestore(app);
export { getAuth } from "firebase/auth";