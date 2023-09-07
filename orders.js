if (localStorage.getItem("login") !== "true") {
    window.location.replace("./login.html");
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";
import { ref, set, get, getDatabase, onValue, child } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
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
    measurementId: "G-3Z5FLW5YX9",
    databaseURL: "https://stock-for-goe-default-rtdb.europe-west1.firebasedatabase.app" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getDatabase();
const auth = getAuth(app);

console.log(auth.currentUser);

// if (!auth.currentUser) {
//     localStorage.setItem("login", "false");
//     window.location.replace("./login.html");
// }

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      
      // ...
    } else {
      // User is signed out
      // ...
      localStorage.setItem("login", "false");
      window.location.replace("./login.html");
    }
});

let orders = [];
let count = 0;

get(child(ref(db), "orders")).then((snapshot) => {
    //sell
    if (! snapshot.exists()) return;

    const value = snapshot.val();
    let stocks = ["fmr", "zge", "zgx"];
    for (let stock of stocks) {
        try {
            let keys = Object.keys(value["sell"][stock]);
            for (let key of keys) {
                let order = value["sell"][stock][key];
                if (order["name"] === localStorage.getItem("user")) {
                    // add the order;
                    orders.push([order, "orders/sell/" + stock + "/" + key]);
                    document.getElementById("orders").innerHTML += `<div class="order">
                <span>Typ: verkaufen | Aktie: ${order["stock"]}</span> | <span>Anzahl: ${order["amount"] - order["filled"]}/${order["amount"]}</span> | <span>Preis: ${order["price"]}</span><br>
                <button class="cancel-button" id="${"b" + count}">Abbrechen</button>
            </div>`;
                    document.getElementById("b" + count).onclick = function () {
                        // refund stocks
                        let refund_stocks = order["amount"] - order["filled"];


                        console.log("Refunding: " + refund_stocks + " of stock: " + order["stock"]);
                        get(child(ref(db), "users/" + localStorage.getItem("user") + "/" + order["stock"])).then((snapshot) => {
                            set(ref(db, "users/" + localStorage.getItem("user") + "/" + order["stock"]), snapshot.val() + refund_stocks);
                            console.log("Successfully refunded stocks!");
                        });
                        set(ref(db, "orders/sell/" + stock + "/" + key), {});
                        location.reload()
                    }
                    count++;
                }
            }
        } catch(e) {

        }
    }
    for (let stock of stocks) {
        try {
            let keys = Object.keys(value["buy"][stock]);
            for (let key of keys) {
                let order = value["buy"][stock][key];
                if (order["name"] === localStorage.getItem("user")) {
                    // add the order;
                    orders.push([order, "orders/buy/" + stock + "/" + key]);
                    document.getElementById("orders").innerHTML += `<div class="order">
                <span>Typ: kaufen | Aktie: ${order["stock"]}</span> | <span>Anzahl: ${order["amount"] - order["filled"]}/${order["amount"]}</span> | <span>Preis: ${order["price"]}</span><br>
                <button class="cancel-button" id="${"b" + count}">Abbrechen</button>
            </div>`;
                    document.getElementById("b" + count).onclick = function() {
                        // delete this order and refund;
                        let refund_money = (order["amount"] - order["filled"]) * order["price"];
                        console.log("refunding: ", refund_money);
                        get(child(ref(db), "users/" + localStorage.getItem("user") + "/money")).then((snapshot) => {
                            set(ref(db, "users/" + localStorage.getItem("user") + "/money"), snapshot.val() + refund_money);
                            console.log("successfully refunded money!");
                        });
                        set(ref(db, "orders/buy/" + stock + "/" + key), {});
                        location.reload();
                    }
                    count++;
                }
            }
        } catch(e) {

        }
    }
});