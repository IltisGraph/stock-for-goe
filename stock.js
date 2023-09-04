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

onValue(ref(db, "orders/sell/" + localStorage.getItem("selected").toLocaleLowerCase()), (snapshot) => {
    calc_cur_buy_price();
});
onValue(ref(db, "orders/buy/" + localStorage.getItem("selected").toLocaleLowerCase()), (snapshot) => {
    calc_cur_sell_price();
});
onValue(ref(db, "users/" + localStorage.getItem("user")), (snapshot) => {
    count_wallet();
    get_user_money();
})


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
    if (isNaN(amount) || isNaN(price)) {
        window.alert("Error beim Parsen deiner Eingaben!");
    }
    
    get(child(ref(db), "orders/buy_num")).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
            let num = snapshot.val();
            set(ref(db, "orders/buy/" + localStorage.getItem("selected").toLocaleLowerCase() + "/" + num), {
                name: localStorage.getItem("user"),
                price: parseFloat(price),
                amount: Number(amount),
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
    if (isNaN(amount) || isNaN(price)) {
        window.alert("Error beim Parsen deiner Eingaben!");
    }
    
    get(child(ref(db), "orders/sell_num")).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
            let num = snapshot.val();
            set(ref(db, "orders/sell/" + localStorage.getItem("selected").toLocaleLowerCase() + "/" + num), {
                name: localStorage.getItem("user"),
                price: parseFloat(price),
                amount: Number(amount),
                filled: 0,
                stock: localStorage.getItem("selected").toLocaleLowerCase()
            });
            // increase buy_num
            set(ref(db, "orders/sell_num"), num + 1);
            
        } else {
            console.error("sell_num does not exist!");
        }
    });
    get(child(ref(db), "users/" + localStorage.getItem("user") + "/" + localStorage.getItem("selected").toLocaleLowerCase())).then((snapshot) => {
        let cur_stock_amount = snapshot.val();
        set(ref(db, "users/" + localStorage.getItem("user") + "/" + localStorage.getItem("selected").toLocaleLowerCase()), cur_stock_amount - amount);
    });
}


// the buy and sell transactions copied from script.js!
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
                return;
            }
            // give buyer stocks
            let to_give;
            if (sell_data[sell_key]["amount"] - sell_data[sell_key]["filled"] > holder["amount"] - holder["filled"]) {
                to_give = holder["amount"] - holder["filled"];
            } else {
                to_give = sell_data[sell_key]["amount"] - sell_data[sell_key]["filled"];
            }
            get(child(ref(db), "users/" + holder["name"] + "/" + holder["stock"])).then((snapshot) => {
                set(ref(db, "users/" + holder["name"] + "/" + holder["stock"]), snapshot.val() + to_give);
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
            // give buyer stocks
            let to_give;
            if (buy_data[buy_key]["amount"] - buy_data[buy_key]["filled"] > holder["amount"] - holder["filled"]) {
                to_give = holder["amount"] - holder["filled"];
            } else {
                to_give = buy_data[buy_key]["amount"] - buy_data[buy_key]["filled"];
            }
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
    get(child(ref(db), "orders/buy/fmr")).then((snapshot) => {
        if (!snapshot.exists()) {
            return;
        }
        // snapshot exists
        let buy_data = snapshot.val()
        console.log(buy_data);
        sell_transaction(sell_data, buy_data);
        buy_transaction(sell_data, buy_data)
        


    });
});
onValue(ref(db, "orders/sell/zge"), (snapshot) => {
    let sell_data = snapshot.val()
    console.log(sell_data);
    get(child(ref(db), "orders/buy/zge")).then((snapshot) => {
        if (!snapshot.exists()) {
            return;
        }
        // snapshot exists
        let buy_data = snapshot.val()
        console.log(buy_data);
        sell_transaction(sell_data, buy_data);
        buy_transaction(sell_data, buy_data);
        


    });
});

onValue(ref(db, "orders/sell/zgx"), (snapshot) => {
    let sell_data = snapshot.val()
    console.log(sell_data);
    get(child(ref(db), "orders/buy/zgx")).then((snapshot) => {
        if (!snapshot.exists()) {
            return;
        }
        // snapshot exists
        let buy_data = snapshot.val()
        console.log(buy_data);
        sell_transaction(sell_data, buy_data);
        buy_transaction(sell_data, buy_data);


    });
});
