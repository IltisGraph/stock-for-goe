if (localStorage.getItem("login") !== "true") {
    window.location.replace("./login.html");
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";
import { ref, set, get, getDatabase, onValue, child } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getAuth, updatePassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
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

// if (auth.currentUser === null) {
//     localStorage.setItem("login", "false");
//     console.log(auth.currentUser);
//     // window.location.replace("./login.html");
// }
let user;

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      user = auth.currentUser;
      
      // ...
    } else {
      // User is signed out
      // ...
      localStorage.setItem("login", "false");
      window.location.replace("./login.html");
    }
});


document.getElementById("change-password-b").onclick = function() {
    let new_password = window.prompt("Gib ein neues Passwort ein!");
    // console.log(new_password);
    // console.log(auth.currentUser);
    updatePassword(auth.currentUser, new_password).then(() => {
        // Update successful.
        window.alert("Neues Passwort erfolgreich eingesetzt!");
      }).catch((error) => {
        // An error ocurred
        // ...
        window.alert("Ups... Etwas ist schiefgelaufen...☹️☹️☹️");
        console.error(error);
      });
      
}

document.getElementById("logout-b").onclick = function() {
    signOut(auth).then(() => {
        // Sign-out successful.
        location.reload();
      }).catch((error) => {
        // An error happened.
        window.alert("Ups... Etwas ist schiefgelaufen...☹️☹️☹️");
        console.error(error);
      });
}

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
document.getElementById("goe").onclick = function() {
    localStorage.setItem("selected", "GOE");
    console.log("registered click on ZGE");
    window.location.href = "./stock.html";
}
document.getElementById("abx").onclick = function() {
    localStorage.setItem("selected", "ABX");
    window.location.href = "./stock.html";
}
document.getElementById("mvd").onclick = function() {
    localStorage.setItem("selected", "MVD");
    window.location.href = "./stock.html";
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
            if (holder["name"] == undefined || holder["stock"] == undefined) {
                console.warn("holder or name undefined!")
                continue;
            }
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

            if (holder["name"] == undefined || holder["stock"] == undefined) {
                console.warn("holder or name undefined!")
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



// put user stats on top
onValue(ref(db, "users/" + localStorage.getItem("user")), (snapshot) => {
    const user_data = snapshot.val();
    document.getElementById("money").innerHTML = "Geld: <br>" + user_data["money"] + "ℛ";
    document.getElementById("zge-text").innerHTML = "ZGE: " + user_data["zge"] + " | ";
    document.getElementById("zgx-text").innerHTML = "ZGX: " + user_data["zgx"] + " | ";
    document.getElementById("fmr-text").innerHTML = "FMR: " + user_data["fmr"] + " | ";    
    document.getElementById("goe-text").innerHTML = "GOE: " + user_data["goe"] + " | ";
    document.getElementById("abx-text").innerHTML = "ABX: " + user_data["abx"];
    document.getElementById("mvd-text").innerHTML = "MVD: " + user_data["mvd"] + " | "; 
});

// put the price in the buttons
function fill_buttons(stock) {
    let price_list;
    
    get(child(ref(db), "orders/sell/" + stock.toLowerCase())).then((snapshot) => {
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
                document.getElementById(stock).innerHTML += " |  K: " + min + "ℛ | ";
            } else {
                document.getElementById(stock).innerHTML += " | (K: " + min + "ℛ) | ";
            }
            logEvent(analytics, "buy-price-" + stock.toLocaleLowerCase(), {
                price: min
            });
            calc_cur_sell_price(stock);
        } else {
            console.log("No data available + bruh moment rn");
            document.getElementById(stock).innerHTML += "K: -- | ";
            min = 0;
            calc_cur_sell_price(stock);
        }
        //statistik
        get(child(ref(db), "history/" + stock.toLowerCase() + "/num")).then((snapshot) => {
            const cur_count = snapshot.val();
            set(ref(db, "history/" + stock.toLowerCase() + "/" + (cur_count + 1) + "/num"), min);
            console.log("Statistic: ", min);
            set(ref(db, "history/" + stock.toLowerCase() + "/num"), cur_count + 1);
        });
        
    });
}

function calc_cur_sell_price(stock) {
    let price_list;
    
    get(child(ref(db), "orders/buy/" + stock.toLowerCase())).then((snapshot) => {
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
                document.getElementById(stock).innerHTML += "V: -- ";
                return;
            }
            if (min_user != localStorage.getItem("user")) {
                document.getElementById(stock).innerHTML += "V: " + min + "ℛ";
            } else {
                document.getElementById(stock).innerHTML += "(V: " + min + "ℛ)";
            }
            logEvent(analytics, "sell-price-" + stock.toLocaleLowerCase(), {
                price: min
            })
        } else {
            console.log("No data available + bruh moment rn");
            document.getElementById(stock).innerHTML += "V: -- ";
        }
    });
}

let stocks = ["fmr", "zge", "zgx", "goe", "abx", "mvd"];
for (let stock of stocks) {
    fill_buttons(stock);
    
}

let r_time = 0;

// the dividends
function dividents() {
    get(child(ref(db), "users/" + localStorage.getItem("user") + "/rendite")).then((snapshot) => {
        if (!snapshot.exists()) {
            document.writeln("broken user account...");
            return;
        }
        let rendite_time = snapshot.val();
        const cur_time = Date.now();
        const sec_time = Math.ceil(cur_time / 1000);
        let money = 0;

        let rendite_per_stock = { "fmr": 0, "zge": 0, "zgx": 0, "abx": 0, "goe": 0, "mvd": 0 };
        let rendite_for_user = { "fmr": 0, "zge": 0, "zgx": 0, "abx": 0, "goe": 0, "mvd": 0 };

        get(child(ref(db), "stocks")).then((stock_snapshot) => {
            get(child(ref(db), "users/" + localStorage.getItem("user"))).then((user_snapshot) => {
                // let keys = Object.keys(stock_snapshot.val());
                // console.log(user_snapshot)
                for (let stock_name of stocks) {
                    if (stock_snapshot.val()[stock_name]["health"] / 10 > 0 && stock_snapshot.val()["dead"] != true) {
                        rendite_per_stock[stock_name] = stock_snapshot.val()[stock_name]["health"] / 10;
                        document.getElementById(stock_name + "-rendite").innerHTML = " | R: " + stock_snapshot.val()[stock_name]["health"] / 10 + "ℛ";
                    } else {
                        console.log(stock_name);
                        document.getElementById(stock_name + "-rendite").innerHTML = " | R: 0ℛ";
                    }
                }
                for (let stock_name of stocks) {
                    rendite_for_user[stock_name] = Math.ceil(rendite_per_stock[stock_name] * user_snapshot.val()[stock_name]);
                    // console.log(user_snapshot.val()[stock_name]);
                    // console.log(rendite_per_stock[stock_name])
                }
                console.log("rendite for user: ");
                console.log(rendite_for_user);

                while (rendite_time < sec_time) {
                    rendite_time += 60 * 60; // 1 hour?
                    for (let stock_name of stocks) {
                        money += rendite_for_user[stock_name];
                        // console.log(rendite_for_user[stock_name])
                    }
                }
                console.log("User got money from rendites: " + money);
                set(ref(db, "users/" + localStorage.getItem("user") + "/money"), Math.ceil(Number(user_snapshot.val()["money"]) + money));
                set(ref(db, "users/" + localStorage.getItem("user") + "/rendite"), rendite_time);
                console.log("User got money from rendites: " + money);
                if (money != 0) {
                    window.alert("Du hast " + Math.ceil(money) + "ℛ als Rendite bekommen!");
                }
                console.log("new rendite time: " + rendite_time);
                r_time = rendite_time;
            });
        });



    });
}
dividents()

// the simulation

function update_health(previous_health) {
    let add = 0;
    let r_num = Math.random() * 100;
    if (r_num <= 25) {
        add = 1;
    }
    if (25 < r_num && r_num< 47) {
        add = -1;
    }
    let out = previous_health + add;
    if (out > 10) {
        out = 10;
    }
    if (out < -10) {
        out = -10;
    }
    return out;

}

let h_time = 0;

function calc_health() {

    get(child(ref(db), "stocks")).then((snapshot) => {
        const cur_time = Date.now();
        const sec_time = Math.ceil(cur_time / 1000);
        const val = snapshot.val();
        if (sec_time > val["time"]) {
            logEvent(analytics, "health_update");
            for (let stock_name of stocks) {
                let new_health = update_health(val[stock_name]["health"]);
                set(ref(db, "stocks/" + stock_name + "/health"), new_health);
                if (new_health == -10) {
                    set(ref(db, "stocks" + stock_name + "/dead"), true);
                }
            }
            set(ref(db, "stocks/time"), val["time"] + 60 * 10);
            h_time = val["time"] + 60 * 10;
        }
        // change the color of the buttons
        console.log("changing button colors");
        for (let stock_name of stocks) {
            if (val[stock_name]["health"] >= 5) {
                document.getElementById(stock_name).style = "background-color: green;";
            } else if (val[stock_name]["health"] <= -5) {
                document.getElementById(stock_name).style = "background-color: red;";
            } else {
                document.getElementById(stock_name).style = "background-color: lightgray;";
            }
        }
    });
}

calc_health()

function health_timeout() {
    setTimeout(health_timeout, 1000 * 10);
    let cur_time = Date.now()
    let cur_sek_time = Math.ceil(cur_time / 1000);
    if ((h_time - cur_sek_time) <= 0) {
        calc_health();
    }
}

setTimeout(health_timeout, 1000 * 10);

function count() {
    setTimeout(count, 1000);
    let cur_time = Date.now()
    let cur_sek_time = Math.ceil(cur_time / 1000);
    // console.log(cur_sek_time);3
    document.getElementById("rendite-time").innerHTML = "Rendite: <br>" + (r_time - cur_sek_time) + " sek";
    if ((r_time - cur_sek_time) <= 0) {
        dividents()
    }
}

setTimeout(count, 1000);



