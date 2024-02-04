import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  storageBucket: "cargo-linker.appspot.com",
};
const app = initializeApp(firebaseConfig);

export default getStorage(app);
