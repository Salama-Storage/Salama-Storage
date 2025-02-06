// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBP5AM1B2jeKSLzaZgRNyxHBim9o5lBoEo",
  authDomain: "storage-664bd.firebaseapp.com",
  databaseURL: "https://storage-664bd-default-rtdb.firebaseio.com",
  projectId: "storage-664bd",
  storageBucket: "storage-664bd.appspot.com",
  messagingSenderId: "491491744319",
  appId: "1:491491744319:web:d0e4cf121797fa8fcd768a",
  measurementId: "G-YE1ZM52BQ6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();

// Sign Up
function signUp() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => alert("Account created!"))
        .catch(error => alert("Error: " + error.message));
}

// Sign In
function signIn() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(user => {
            document.getElementById("userStatus").innerText = "Signed in as " + user.user.email;
            listFiles();
        })
        .catch(error => alert("Error: " + error.message));
}

// Sign Out
function signOut() {
    auth.signOut().then(() => {
        document.getElementById("userStatus").innerText = "Not signed in";
        document.getElementById("fileList").innerHTML = "";
    });
}

// Upload File
function uploadFile() {
    const user = auth.currentUser;
    if (!user) {
        alert("Please sign in first!");
        return;
    }

    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files.length) {
        alert("Select a file first!");
        return;
    }

    const file = fileInput.files[0];
    const storageRef = storage.ref(`users/${user.uid}/${file.name}`);

    storageRef.put(file).then(() => {
        alert("File uploaded!");
        listFiles();
    }).catch(error => alert("Upload failed: " + error.message));
}

// List Files and Preview
function listFiles() {
    const user = auth.currentUser;
    if (!user) {
        document.getElementById("fileList").innerHTML = "Sign in to see your files.";
        return;
    }

    const storageRef = storage.ref(`users/${user.uid}/`);
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = "Loading...";

    storageRef.listAll().then(result => {
        fileList.innerHTML = "";
        result.items.forEach(fileRef => {
            fileRef.getDownloadURL().then(url => {
                const fileItem = document.createElement("div");
                fileItem.classList.add("file-item");

                let previewElement = "";

                if (url.match(/\.(jpg|jpeg|png|gif)$/)) {
                    previewElement = `<img src="${url}" class="file-preview" width="200">`;
                } else if (url.match(/\.(mp4|webm|ogg)$/)) {
                    previewElement = `<video controls class="file-preview" width="300"><source src="${url}" type="video/mp4">Your browser does not support the video tag.</video>`;
                } else if (url.match(/\.(pdf)$/)) {
                    previewElement = `<iframe src="${url}" class="file-preview" width="300" height="200"></iframe>`;
                } else if (url.match(/\.(txt|json|csv)$/)) {
                    fetch(url).then(response => response.text()).then(text => {
                        previewElement = `<pre class="file-preview">${text.substring(0, 200)}...</pre>`;
                        fileItem.innerHTML += previewElement;
                    });
                } else {
                    previewElement = `<a href="${url}" target="_blank">Download ${fileRef.name}</a>`;
                }

                fileItem.innerHTML = `<strong>${fileRef.name}</strong><br>${previewElement}`;
                fileList.appendChild(fileItem);
            });
        });
    }).catch(error => {
        fileList.innerHTML = "Error loading files!";
        console.error(error);
    });
}

// Listen for Auth Changes
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById("userStatus").innerText = "Signed in as " + user.email;
        listFiles();
    } else {
        document.getElementById("userStatus").innerText = "Not signed in";
        document.getElementById("fileList").innerHTML = "";
    }
});
