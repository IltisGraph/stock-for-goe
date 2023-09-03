if (localStorage.getItem("login") === "true") {
    window.location.replace("./stocks.html");
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBY967JMuyRz4bGjoM4IlzZPdQOOqCHxY4",
    authDomain: "stock-for-goe.firebaseapp.com",
    projectId: "stock-for-goe",
    storageBucket: "stock-for-goe.appspot.com",
    messagingSenderId: "869830173768",
    appId: "1:869830173768:web:7a36e94aa92482de7b247d",
    measurementId: "G-3Z5FLW5YX9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);

function signIn() {
    let name = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    // console.log(name);
    // console.log(password);
    signInWithEmailAndPassword(auth, name, password).then((userCredential) => {
        const user = userCredential.user;
        localStorage.setItem("user", user.uid);
        // console.log(user)
        // console.log(user.uid)
        console.log("logged in!");
        localStorage.setItem("login", "true");
        window.location.replace("./stocks.html")
    }).catch((error) => {
        console.log("not logged in")
        console.error(error);
    })
}

document.getElementById("login-button").onclick = function() {
    signIn();
}


