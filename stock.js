if (localStorage.getItem("login") !== "true") {
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
let has;
function count_wallet() {
    console.log("User " + localStorage.getItem("user"));
    get(child(ref(db), "users/" + localStorage.getItem("user") + "/" + localStorage.getItem("selected").toLocaleLowerCase())).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
            has = snapshot.val();
            document.getElementById("has").innerHTML = "Im Besitz: " + snapshot.val();
        } else {
            document.writeln("Invalid User or stock!")
        }
    });
}
let money;
function get_user_money() {
    get(child(ref(db), "users/" + localStorage.getItem("user") + "/money")).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
            money = snapshot.val();
        } else {
            document.writeln("Invalid User or stock!");
        }
    });
}

calc_cur_buy_price()
calc_cur_sell_price()
count_wallet()
get_user_money()

// localStorage.setItem("login", "false");


document.getElementById("buy").onclick = function() {
    let amount = window.prompt("Gib die Anzahl ein, die du kaufen willst!");
    let price = window.prompt("Gib den Preis ein, zu dem du kaufen willst!");
    if (amount * price > money) {
        window.alert("Du hast nicht genug Geld!");
        return;
    } else {
        window.alert("Wird eingefügt! " + amount * price + "ℛ abgezogen!");
    }
    
    get(child(ref(db), "orders/buy_num")).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
            let num = snapshot.val();
            set(ref(db, "orders/buy/" + localStorage.getItem("selected").toLocaleLowerCase() + "/" + num), {
                name: localStorage.getItem("user"),
                price: price,
                amount: amount,
                filled: 0,
                stock: localStorage.getItem("selected").toLocaleLowerCase()
            });
            // increase buy_num
            set(ref(db, "orders/buy_num"), num + 1);
            //take the money
            set(ref(db, "users/" + localStorage.getItem("user") + "/money"), money - amount * price);
        } else {
            console.error("buy_num does not exist!");
        }
    });


}

document.getElementById("sell").onclick = function() {
    let amount = window.prompt("Gib die Anzahl ein, die du verkaufen willst!");
    let price = window.prompt("Gib den Preis ein, zu dem du verkaufen willst!");
    if (amount > has) {
        window.alert("Du hast nicht genug Aktien!");
        return;
    } else {
        window.alert("Wird eingefügt! Sobald es gekauft wird, landet das Geld auf deinem Konto!");
    }
    
    get(child(ref(db), "orders/sell_num")).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
            let num = snapshot.val();
            set(ref(db, "orders/sell/" + localStorage.getItem("selected").toLocaleLowerCase() + "/" + num), {
                name: localStorage.getItem("user"),
                price: price,
                amount: amount,
                filled: 0,
                stock: localStorage.getItem("selected").toLocaleLowerCase()
            });
            // increase buy_num
            set(ref(db, "orders/sell_num"), num + 1);
            
        } else {
            console.error("sell_num does not exist!");
        }
    });
}
