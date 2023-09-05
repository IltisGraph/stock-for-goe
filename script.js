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

document.getElementById("zge").onclick = function() {
    localStorage.setItem("selected", "ZGE");
    console.log("registered click on ZGE");
    window.location.href = "./stock.html";
}
document.getElementById("zgx").onclick = function() {
    localStorage.setItem("selected", "ZGX");
    window.location.href = "./stock.html";
}
document.getElementById("fmr").onclick = function() {
    localStorage.setItem("selected", "FMR");
    window.location.href = "./stock.html";
}

document.getElementById("history-b").onclick = function() {
    window.location.href = "./orders.html";
}



function sell_transaction(sell_data, buy_data) {
    /* processes your sell orders and adds stocks to the buyer of your order */
    console.log("Doing a sell transaction!");
    console.log("Sell data");
    console.log(sell_data);
    let sell_data_keys = Object.keys(sell_data);
    console.log("buy data")
    console.log(buy_data);
    let buy_data_keys = Object.keys(buy_data);
    
    for (let sell_key of sell_data_keys) {
        if (sell_data[sell_key]["name"] === localStorage.getItem("user")) {
            let holder = buy_data[buy_data_keys[0]];
            let max = buy_data[buy_data_keys[0]]["price"];
            let keyholder = buy_data_keys[0];
            for (let buy_key of buy_data_keys) {
                if (buy_data[buy_key]["price"] > max) {
                    max = buy_data[buy_key]["price"];
                    holder = buy_data[buy_key];
                    keyholder = buy_key;
                }
            }
            if (holder["price"] < sell_data[sell_key]["price"]) {
                continue;
            }
            
            // give buyer stocks
            let to_give;
            if (sell_data[sell_key]["amount"] - sell_data[sell_key]["filled"] > holder["amount"] - holder["filled"]) {
                to_give = holder["amount"] - holder["filled"];
            } else {
                to_give = sell_data[sell_key]["amount"] - sell_data[sell_key]["filled"];
            }
            // if (sell_data[sell_key]["filled"] + to_give == sell_data[sell_key]["amount"] || holder["filled"] + to_give == holder["amount"]) {
            //     continue;
            // }
            get(child(ref(db), "users/" + holder["name"] + "/" + holder["stock"])).then((snapshot) => {
                set(ref(db, "users/" + holder["name"] + "/" + holder["stock"]), Number(snapshot.val()) + Number(to_give));
            });
            // give this user money
            get(child(ref(db), "users/" + localStorage.getItem("user") + "/money")).then((snapshot) => {
                set(ref(db, "users/" + localStorage.getItem("user") + "/money"), snapshot.val() + to_give * holder["price"]);
            })
            console.log("gave user: " + holder["name"] + " stock-amount: " + to_give);
            // actualize both orders
            set(ref(db, "orders/sell/" + sell_data[sell_key]["stock"] + "/" + sell_key + "/filled"), sell_data[sell_key]["filled"] + to_give);
            if (sell_data[sell_key]["filled"] + to_give == sell_data[sell_key]["amount"]) {
                set(ref(db, "orders/sell/" + sell_data[sell_key]["stock"] + "/" + sell_key), {

                });
            }
            set(ref(db, "orders/buy/" + holder["stock"] + "/" + keyholder + "/filled"), holder["filled"] + to_give);
            if (holder["filled"] + to_give == holder["amount"]) {
                set(ref(db, "orders/buy/" + holder["stock"] + "/" + keyholder), {

                });
            }
        }
    }
}

function buy_transaction(sell_data, buy_data) {
    /* processes your buy orders and adds money to the seller */
    console.log("Doing a buy transaction!");
    console.log("Sell data");
    console.log(sell_data);
    let sell_data_keys = Object.keys(sell_data);
    console.log("buy data")
    console.log(buy_data);
    let buy_data_keys = Object.keys(buy_data);
    
    for (let buy_key of buy_data_keys) {
        console.log("doing buy order: " + buy_key);
        if (buy_data[buy_key]["name"] === localStorage.getItem("user")) {
            console.log("users match!");
            let holder = sell_data[sell_data_keys[0]];
            let max = sell_data[sell_data_keys[0]]["price"];
            let keyholder = sell_data_keys[0];
            for (let sell_key of sell_data_keys) {
                if (sell_data[sell_key]["price"] < max) {
                    max = sell_data[sell_key]["price"];
                    holder = sell_data[sell_key];
                    keyholder = sell_key;
                }
            }
            if (holder["price"] > buy_data[buy_key]["price"]) {
                // price does not match
                console.log("price does not match");
                continue;
            }
            
            console.log("Price comparison: " + holder["price"] + " | " + buy_data[buy_key]["price"]);
            // give buyer stocks
            let to_give;
            if (buy_data[buy_key]["amount"] - buy_data[buy_key]["filled"] > holder["amount"] - holder["filled"]) {
                to_give = holder["amount"] - holder["filled"];
            } else {
                to_give = buy_data[buy_key]["amount"] - buy_data[buy_key]["filled"];
            }
            // if (buy_data[buy_key]["filled"] + to_give == buy_data[buy_key]["amount"] || holder["filled"] + to_give == holder["amount"]) {
            //     continue;
            // }
            console.log("moving " + to_give + " stocks");
            get(child(ref(db), "users/" + localStorage.getItem("user") + "/" + holder["stock"])).then((snapshot) => {
                set(ref(db, "users/" + localStorage.getItem("user") + "/" + holder["stock"]), snapshot.val() + to_give);
            });
            // give that user money
            get(child(ref(db), "users/" + holder["name"] + "/money")).then((snapshot) => {
                set(ref(db, "users/" + holder["name"] + "/money"), snapshot.val() + to_give * buy_data[buy_key]["price"]);
            });
            console.log("giving money");
            // console.log("gave user: " + holder["name"] + " stock-amount: " + to_give);
            // actualize both orders
            set(ref(db, "orders/buy/" + buy_data[buy_key]["stock"] + "/" + buy_key + "/filled"), buy_data[buy_key]["filled"] + to_give);
            if (buy_data[buy_key]["filled"] + to_give == buy_data[buy_key]["amount"]) {
                set(ref(db, "orders/buy/" + buy_data[buy_key]["stock"] + "/" + buy_key), {

                });
            }
            set(ref(db, "orders/sell/" + holder["stock"] + "/" + keyholder + "/filled"), holder["filled"] + to_give);
            if (holder["filled"] + to_give == holder["amount"]) {
                set(ref(db, "orders/sell/" + holder["stock"] + "/" + keyholder), {

                });
            }
            console.log("actualized orders!");
        }
    }
}

onValue(ref(db, "orders/sell/fmr"), (snapshot) => {
    let sell_data = snapshot.val()
    console.log(sell_data);
    if (! snapshot.exists()) return;
    get(child(ref(db), "orders/buy/fmr")).then((snapshot_2) => {
        if (!snapshot_2.exists()) {
            return;
        }
        // snapshot exists
        let buy_data = snapshot_2.val()
        console.log(buy_data);
        sell_transaction(sell_data, buy_data);
        buy_transaction(sell_data, buy_data)
        


    });
});
onValue(ref(db, "orders/sell/zge"), (snapshot) => {
    let sell_data = snapshot.val()
    console.log(sell_data);
    if (! snapshot.exists()) return;
    get(child(ref(db), "orders/buy/zge")).then((snapshot_2) => {
        if (!snapshot_2.exists()) {
            return;
        }
        // snapshot exists
        let buy_data = snapshot_2.val()
        console.log(buy_data);
        sell_transaction(sell_data, buy_data);
        buy_transaction(sell_data, buy_data);
        


    });
});

onValue(ref(db, "orders/sell/zgx"), (snapshot) => {
    let sell_data = snapshot.val()
    console.log(sell_data);
    if (! snapshot.exists()) return;
    get(child(ref(db), "orders/buy/zgx")).then((snapshot_2) => {
        if (!snapshot_2.exists()) {
            return;
        }
        // snapshot exists
        let buy_data = snapshot_2.val()
        console.log(buy_data);
        sell_transaction(sell_data, buy_data);
        buy_transaction(sell_data, buy_data);


    });
});


// put user stats on top
onValue(ref(db, "users/" + localStorage.getItem("user")), (snapshot) => {
    const user_data = snapshot.val();
    document.getElementById("money").innerHTML = "Geld: " + user_data["money"] + "ℛ | ";
    document.getElementById("zge-text").innerHTML = "ZGE: " + user_data["zge"] + " | ";
    document.getElementById("zgx-text").innerHTML = "ZGX: " + user_data["zgx"] + " | ";
    document.getElementById("fmr-text").innerHTML = "FMR: " + user_data["fmr"];    
});



