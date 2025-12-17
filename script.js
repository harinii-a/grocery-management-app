

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, push, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js"

// Get this from Firebase Console → Project Settings → Your Apps → Web App (</> icon)
const appSettings = {
  apiKey: "AIzaSyBxYH8c46V-v1N1gMERapUrSjNjcaVJ9Dk",
  authDomain: "grocery-list-firebase-c08ba.firebaseapp.com",
  databaseURL: "https://grocery-list-firebase-c08ba-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "grocery-list-firebase-c08ba",
  storageBucket: "grocery-list-firebase-c08ba.firebasestorage.app",
  messagingSenderId: "1073273137406",
  appId: "1:1073273137406:web:f7efb04bfca767fa241daf"
};

const app = initializeApp(appSettings)
const database = getDatabase(app)
const auth = getAuth(app)

let currentUserId = null
let shoppingListInDB = null

// Show loading while authenticating
document.body.innerHTML += '<div id="loading">Signing you in...</div>'

// Force anonymous sign-in first
signInAnonymously(auth)
    .then((userCredential) => {
        currentUserId = userCredential.user.uid
        console.log("✅ User signed in:", currentUserId)
        shoppingListInDB = ref(database, `users/${currentUserId}/shoppingList`)
        document.getElementById("loading").remove()
        setupApp()
    })
    .catch((error) => {
        console.error("❌ Auth failed:", error)
        document.body.innerHTML = `<h2>Login failed: ${error.message}</h2>`
    })

function setupApp() {
    const input = document.getElementById("input-id")
    const addbutton = document.getElementById("button-id")
    const shoplist = document.getElementById("shopping-list")

    addbutton.addEventListener("click", function() {
        let inputValue = input.value.trim()
        if (inputValue && shoppingListInDB) {
            push(shoppingListInDB, inputValue)
            input.value = ""
        }
    })

    /*
 createElement() -> creates an HTML element specified in the parameter
 textContent -> sets or returns the text content of the specified node
 append() -> adds a node to the end of the list of children of a specified parent node

 used to convert to clickable elements
*/

//ref(the database, name to be called) , accepted by push() function to add elements into the database



    function appendNewItem(item) {
        let itemID = item[0]
        let itemValue = item[1]
        let newEl = document.createElement("li")
        newEl.textContent = itemValue
        newEl.addEventListener("click", function() {
            let exactLocationOfItemInDB = ref(database, `users/${currentUserId}/shoppingList/${itemID}`)
            remove(exactLocationOfItemInDB)
        })
        shoplist.append(newEl)
    }

    //to convert Object to array , Object.values(objName) / Object.keys(objName) / Object.entries(objName) [[],[]]
//eg) converting json into array

// const booksInDB = ref(database, "books")
// onValue(booksInDB, function(snapshot) {
//     let booksArray = Object.values(snapshot.val())

/*
onValue runs everytime there is an edit to the DB

onValue is used to listen for changes in the database at the specified reference (in this case, booksInDB). 
When the data at that reference changes, the provided callback function is executed with a snapshot 
of the current data.

onValue used to get data from DB in real-time

snapshot returns object, use snapshot.val() to get the value of the data at that reference.
*/

//snapshot -> in database



    // Real-time listener
    onValue(shoppingListInDB, function(snapshot) {
        const shoplist = document.getElementById("shopping-list")
        if (snapshot.exists()) {
            let arr = Object.entries(snapshot.val())
            shoplist.innerHTML = ""
            arr.forEach(item => appendNewItem(item))
        } else {
            shoplist.innerHTML = "No items here... yet"
        }
    })
}
