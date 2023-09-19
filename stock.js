if (localStorage.getItem("login") !== "true") {
    window.location.replace("./login.html");
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";
import { ref, set, get, getDatabase, onValue, child } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
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

// check if stock is dead
get(child(ref(db), "stocks/" + localStorage.getItem("selected").toLocaleLowerCase() + "/dead")).then((snapshot) => {
    if (snapshot.val() == true) {
        document.writeln("Aktie ist insolvent...");
    }
})

const stock_name = localStorage.getItem("selected");
document.getElementById("overview").innerHTML = "Ansicht von: " + stock_name.toUpperCase();

// const canvas = document.getElementById("graph");
// const ctx = canvas.getContext("2d");

// draw the graph
// get(child(ref(db), "history/" + stock_name.toLowerCase())).then((snapshot) => {
//     if (snapshot.exists()) {
//         const hist_keys = Object.keys(snapshot.val());
//         const hist_data = snapshot.val();
//         let counter = 0;
//         ctx.lineWidth = 5;
//         for (let hist_key of hist_keys) {
//             ctx.beginPath()
//             ctx.moveTo(counter * 5, 450);
//             ctx.lineTo(counter * 5, hist_data[hist_key]["num"]);
//             ctx.stroke()
//             counter++;
//         }
//     }
// })

// ctx.rect(0, 0, 20, 20)
// ctx.fill()


function calc_cur_buy_price() {
    let price_list;
    
    get(child(ref(db), "orders/sell/" + stock_name.toLowerCase())).then((snapshot) => {
        let min;
        if (snapshot.exists()) {
            price_list = snapshot.val();
            console.log(price_list);
            let keys = Object.keys(price_list);
            min = price_list[keys[0]]["price"];
            let min_amount = price_list[keys[0]]["amount"] - price_list[keys[0]]["filled"];
            let min_user = price_list[keys[0]]["name"];
            for (let key of keys) {
                if (price_list[key]["price"] < min) {
                    min = price_list[key]["price"];
                    min_amount = price_list[key]["amount"] - price_list[key]["filled"];
                    min_user = price_list[key]["name"];
                }
            }
            console.log("Min Price:" + min);
            if (min_user != localStorage.getItem("user")) {
                document.getElementById("buy-price").innerHTML = "Kaufen: " + min + "ℛ; Anzahl: " + min_amount + " ";
            } else {
                document.getElementById("buy-price").innerHTML = "(Kaufen: " + min + "ℛ; Anzahl: " + min_amount + ") ";
            }
            logEvent(analytics, "buy-price-" + localStorage.getItem("selected").toLocaleLowerCase(), {
                price: min
            });
        } else {
            console.log("No data available + bruh moment rn");
            document.getElementById("buy-price").innerHTML = "Kaufen: -- (kein Angebot)";
            min = 0;
        }
        //statistik
        get(child(ref(db), "history/" + stock_name.toLowerCase() + "/num")).then((snapshot) => {
            const cur_count = snapshot.val();
            set(ref(db, "history/" + stock_name.toLowerCase() + "/" + (cur_count + 1) + "/num"), min);
            console.log("Statistic: ", min);
            set(ref(db, "history/" + stock_name.toLowerCase() + "/num"), cur_count + 1);
        })
        
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
            let min_amount = price_list[keys[0]]["amount"] - price_list[keys[0]]["filled"];
            let min_user = price_list[keys[0]]["name"];
            for (let key of keys) {
                if (price_list[key]["price"] > min) {
                    min = price_list[key]["price"];
                    min_amount = price_list[key]["amount"] - price_list[key]["filled"];
                    min_user = price_list[key]["name"];
                }
            }
            console.log("Min sell Price:" + min);
            if (min === undefined) {
                document.getElementById("sell-price").innerHTML = "Verkaufen: -- (kein Angebot)";
                return;
            }
            if (min_user != localStorage.getItem("user")) {
                document.getElementById("sell-price").innerHTML = "Verkaufen: " + min + "ℛ; Anzahl: " + min_amount + " ";
            } else {
                document.getElementById("sell-price").innerHTML = "(Verkaufen: " + min + "ℛ; Anzahl: " + min_amount + ") ";
            }
            logEvent(analytics, "sell-price-" + localStorage.getItem("selected").toLocaleLowerCase(), {
                price: min
            })
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
    if (isNaN(amount) || isNaN(price) || price <= 0 || amount <= 0) {
        window.alert("Error beim Parsen deiner Eingaben!");
        logEvent(analytics, "parse-error-" + localStorage.getItem("selected").toLocaleLowerCase());
        return;
    }
    if (amount * price > money) {
        window.alert("Du hast nicht genug Geld!");
        logEvent(analytics, "not-enough-money-" + localStorage.getItem("selected").toLocaleLowerCase());
        return;
    } else {
        window.alert("Wird eingefügt! " + amount * price + "ℛ abgezogen!");
    }

    logEvent(analytics, "buy-" + localStorage.getItem("selected").toLocaleLowerCase(), {
        price: price,
        amount: amount
    })
    
    
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
    if (isNaN(amount) || isNaN(price) || amount <= 0 || price <= 0) {
        window.alert("Error beim Parsen deiner Eingaben!");
        logEvent(analytics, "parse-error-" + localStorage.getItem("selected").toLocaleLowerCase());
        return;
    }
    if (amount > has) {
        window.alert("Du hast nicht genug Aktien!");
        logEvent(analytics, "not-enough-stocks-" + localStorage.getItem("selected").toLocaleLowerCase());
        return;
    } else {
        window.alert("Wird eingefügt! Sobald es gekauft wird, landet das Geld auf deinem Konto!");
    }

    logEvent(analytics, "sell-" + localStorage.getItem("selected").toLocaleLowerCase(), {
        price: price,
        amount: amount
    })
    
    
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
                continue;
            }
            
            // give buyer stocks
            let to_give;
            if (sell_data[sell_key]["amount"] - sell_data[sell_key]["filled"] > holder["amount"] - holder["filled"]) {
                to_give = holder["amount"] - holder["filled"];
            } else {
                to_give = sell_data[sell_key]["amount"] - sell_data[sell_key]["filled"];
            }
            if (holder["name"] == undefined || holder["stock"] == undefined) {
                console.warn("holder or name undefined!");
                logEvent(analytics, "holder-undefined");
                continue;
            }
            // if (sell_data[sell_key]["filled"] + to_give == sell_data[sell_key]["amount"] || holder["filled"] + to_give == holder["amount"]) {
            //     continue;
            // }
            console.log("gave user: " + holder["name"] + " stock-amount: " + to_give + "from stock: " + holder["stock"]);
            console.log("holder data:");
            console.log(holder);
            get(child(ref(db), "users/" + holder["name"] + "/" + holder["stock"])).then((snapshot) => {
                set(ref(db, "users/" + holder["name"] + "/" + holder["stock"]), Number(snapshot.val()) + Number(to_give));
                console.log("User: " + holder["name"] + " now has " + snapshot.val() + to_give + " stocks of stock: " + holder["stock"]);
            });
            // give this user money
            get(child(ref(db), "users/" + localStorage.getItem("user") + "/money")).then((snapshot) => {
                set(ref(db, "users/" + localStorage.getItem("user") + "/money"), snapshot.val() + to_give * holder["price"]);
            })
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
            logEvent(analytics, "sell-match-" + localStorage.getItem("selected").toLocaleLowerCase());
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
            if (holder["name"] == undefined || holder["stock"] == undefined) {
                console.warn("holder or name undefined!");
                logEvent(analytics, "holder-undefined");
                continue;
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
            logEvent(analytics, "buy-match-" + localStorage.getItem("selected").toLocaleLowerCase());
        }
    }
}

let on_1 = false;

onValue(ref(db, "orders/sell/fmr"), (snapshot) => {
    if (on_1) {
        on_1 = false;
        return;
    }
    let sell_data = snapshot.val()
    console.log(sell_data);
    on_1 = true;
    if (! snapshot.exists()) return;
    get(child(ref(db), "orders/buy/fmr")).then((snapshot_2) => {
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

let on_2 = false;
onValue(ref(db, "orders/sell/zge"), (snapshot) => {
    if (on_2) {
        on_2 = false;
        return;
    }
    on_2 = true;
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

let on_3 = false;

onValue(ref(db, "orders/sell/zgx"), (snapshot) => {
    if (on_3) {
        on_3 = false;
        return;
    }
    on_3 = true;
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

let on_4 = false;

onValue(ref(db, "orders/sell/goe"), (snapshot) => {
    if (on_4) {
        on_4 = false;
        return;
    }
    let sell_data = snapshot.val()
    console.log(sell_data);
    on_4 = true;
    if (! snapshot.exists()) return;
    get(child(ref(db), "orders/buy/goe")).then((snapshot_2) => {
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

let on_5 = false;
onValue(ref(db, "orders/sell/abx"), (snapshot) => {
    if (on_5) {
        on_5 = false;
        return;
    }
    on_5 = true;
    let sell_data = snapshot.val()
    console.log(sell_data);
    if (! snapshot.exists()) return;
    get(child(ref(db), "orders/buy/abx")).then((snapshot_2) => {
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

let on_6 = false;

onValue(ref(db, "orders/sell/mvd"), (snapshot) => {
    if (on_6) {
        on_6 = false;
        return;
    }
    on_6 = true;
    let sell_data = snapshot.val()
    console.log(sell_data);
    if (! snapshot.exists()) return;
    get(child(ref(db), "orders/buy/mvd")).then((snapshot_2) => {
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

let on_7 = false;

onValue(ref(db, "orders/sell/igg"), (snapshot) => {
    if (on_7) {
        on_7 = false;
        return;
    }
    let sell_data = snapshot.val()
    console.log(sell_data);
    on_7 = true;
    if (! snapshot.exists()) return;
    get(child(ref(db), "orders/buy/igg")).then((snapshot_2) => {
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

let on_8 = false;
onValue(ref(db, "orders/sell/fms"), (snapshot) => {
    if (on_8) {
        on_8 = false;
        return;
    }
    on_8 = true;
    let sell_data = snapshot.val()
    console.log(sell_data);
    if (! snapshot.exists()) return;
    get(child(ref(db), "orders/buy/fms")).then((snapshot_2) => {
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

let on_9 = false;

onValue(ref(db, "orders/sell/rel"), (snapshot) => {
    if (on_9) {
        on_9 = false;
        return;
    }
    on_9 = true;
    let sell_data = snapshot.val()
    console.log(sell_data);
    if (! snapshot.exists()) return;
    get(child(ref(db), "orders/buy/rel")).then((snapshot_2) => {
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
