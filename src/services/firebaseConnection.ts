import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: AdSDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzRt6cNoOI3-Ja83JqgWsgXkDK4AfbthI",
  authDomain: "tarefasplus-71a70.firebaseapp.com",
  projectId: "tarefasplus-71a70",
  storageBucket: "tarefasplus-71a70.firebasestorage.app",
  messagingSenderId: "347870734256",
  appId: "1:347870734256:web:614055357a7a38357d5875",
  measurementId: "G-G4L0GWFJML"
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);
export { db };