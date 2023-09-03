if (localStorage.getItem("login") === "false") {
    window.location.replace("./login.html");
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";
import { ref, set, get, getDatabase, onValue, child } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
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
    measurementId: "G-3Z5FLW5YX9",
    databaseURL: "https://stock-for-goe-default-rtdb.europe-west1.firebasedatabase.app" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getDatabase();

const stock_name = localStorage.getItem("selected");
document.getElementById("overview").innerHTML = "Ansicht von: " + stock_name.toUpperCase();

const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

// ctx.rect(0, 0, 20, 20)
// ctx.fill()



function calc_cur_buy_price() {
    let price_list;
    
    get(child(ref(db), "orders/sell/" + stock_name.toLowerCase())).then((snapshot) => {
        if (snapshot.exists()) {
            price_list = snapshot.val();
            console.log(price_list);
            let keys = Object.keys(price_list);
            let min = price_list[keys[0]]["price"];
            for (let key of keys) {
                if (price_list[key]["price"] < min) {
                    min = price_list[key]["price"];
                }
            }
            console.log("Min Price:" + min);
            document.getElementById("buy-price").innerHTML = "Kaufen: " + min + "ℛ";
        } else {
            console.log("No data available + bruh moment rn");
            document.getElementById("buy-price").innerHTML = "Kaufen: -- (kein Angebot)";
        }
    });
}

function calc_cur_sell_price() {
    let price_list;
    
    get(child(ref(db), "orders/buy/" + stock_name.toLowerCase())).then((snapshot) => {
        if (snapshot.exists()) {
            price_list = snapshot.val();
            console.log(price_list);
            let keys = Object.keys(price_list);
            let min = price_list[keys[0]]["price"];
            for (let key of keys) {
                if (price_list[key]["price"] > min) {
                    min = price_list[key]["price"];
                }
            }
            console.log("Min sell Price:" + min);
            document.getElementById("sell-price").innerHTML = "Verkaufen: " + min + "ℛ";
        } else {
            console.log("No data available + bruh moment rn");
            document.getElementById("sell-price").innerHTML = "Verkaufen: -- (kein Angebot)";
        }
    });
}

function count_wallet() {
    console.log("User " + localStorage.getItem("user"));
    get(child(ref(db), "users/" + localStorage.getItem("user") + "/" + localStorage.getItem("selected").toLocaleLowerCase())).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
            document.getElementById("has").innerHTML = "Im Besitz: " + snapshot.val();
        } else {
            document.writeln("Invalid User or stock!")
        }
    });
}

calc_cur_buy_price()
calc_cur_sell_price()
count_wallet()

// localStorage.setItem("login", "false");
