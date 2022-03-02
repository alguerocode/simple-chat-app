import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getDocs,
  getFirestore,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  query,
  orderBy,
  collection,
} from "firebase/firestore";
import { getLoginFormData, toggleChatAndLoginFormVisability } from "./utils";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "961282809733",
  appId: "",
};


// init firebase;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const messagesRef = collection(firestore, "messages");
const messagesRefQuery = query(messagesRef, orderBy("createdAt"));

// first check if user loged in
if (!auth.currentUser) toggleChatAndLoginFormVisability("none", "block");

// authentication


const loginBtn = document.getElementById("login-btn");
loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const user = getLoginFormData();
  signInWithEmailAndPassword(auth, user.email, user.password)
  .then((cred) => toggleChatAndLoginFormVisability("none", "block"))
  .catch((err) => alert(err.message));
});

const signupBtn = document.getElementById("signup-btn");
signupBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const user = getLoginFormData();
  createUserWithEmailAndPassword(auth, user.email, user.password)
  .then((cred) => toggleChatAndLoginFormVisability("none", "block"))
  .catch((err) => alert(err.message));
});

const logoutBtn = document.getElementById("logout");
logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  chatTable.innerHTML = "";
  chatForm.reset();
  signOut(auth);
});

// authentication listener
onAuthStateChanged(auth, (user) => {
  if (!user) {
    toggleChatAndLoginFormVisability("block", "none");
    return;
  }
  const usernameEl = document.querySelector("p.username");
  usernameEl.textContent = `username: ${user.email}`;
  getDocs(messagesRefQuery)
    .then((snapshot) => messagesUIGenerator(snapshot))
    .catch((err) => console.log(err.message));
});

// chat
const chatTable = document.getElementById("chat-table");
const chatForm = document.getElementById("text-box");

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addDoc(messagesRef, {
    sender: auth.currentUser.email,
    text: chatForm.text.value,
    createdAt: serverTimestamp(),
  })
    .then(() => chatForm.reset())
    .catch((err) => console.log(err.message));
});


const messagesUIGenerator = (snapshot) => {
  chatTable.innerHTML = "";
  snapshot.docs.forEach((messageDoc) => {
    const message = messageDoc.data();
    const messageEl = document.createElement("div");
    messageEl.id = "id-" + messageDoc.id;
    messageEl.classList.add("message");
    messageEl.innerHTML = `
    <div>🧍 ${message.sender}</div>
    <p>${message.text}</p>
    `;

    chatTable.append(messageEl);

    // is current user messsage
    if (message.sender == auth.currentUser.email) {
      messageEl.classList.add("current-user-message");
      messageEl.innerHTML =
        messageEl.innerHTML +
        `<button class="delete-btn" id=${messageDoc.id}>delete</button>
      <button class="update-btn" id=${messageDoc.id}>update</button>`;
      const messageRef = doc(firestore, "messages", messageDoc.id);

      // delete message
      const deleteBtn = document.querySelector(`#id-${messageDoc.id} .delete-btn`);
      deleteBtn.addEventListener("click", () => {
        deleteDoc(messageRef);
      });

      // update message
      const updateBtn = document.querySelector(`#id-${messageDoc.id} .update-btn`);
      updateBtn.addEventListener("click", () => {
        const updatedMessage = prompt("update Message:");
        updateDoc(messageRef, { text: updatedMessage });
      });
    }
  });
};

// messages chat listener
onSnapshot(messagesRefQuery, (snapshot) => {
  messagesUIGenerator(snapshot);
});


