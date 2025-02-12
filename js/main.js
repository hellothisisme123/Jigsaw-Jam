// just to be able to access the whole site without doing storage stuff
localStorage.setItem("username", "username")
localStorage.setItem("password", "password")

// ----- get db connection -----
let databaseEx
fetch('http://192.168.240.9:3006/jigsawJam/data')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        databaseEx = data
    })
.catch(error => {
    console.error('Error fetching data:', error);
});

// ----- nav -----
const homeBtn = document.querySelector("nav .home")
const settingsBtn = document.querySelector("nav .settings")
homeBtn.addEventListener("click", () => {window.location = "./index.html"})
settingsBtn.addEventListener("click", () => {window.location = "./settings.html"})

// ----- force javascript -----
const requireJavascript = document.querySelectorAll(".requireJavascript")
requireJavascript.forEach(el => {
    el.classList.remove("requireJavascript") 
})

// ----- alert popup -----
// title   | the title text
// text    | the main text
// yesText | the text  in the yes button
// noText  | the text in the no button
// yesFunc | a function that runs when the user presses yes
// noFunc  | a function that runs when the user presses no
function alertPopup(title, text, yesText, noText, yesFunc, noFunc) {
    let html = 
    `<div class="alertPopup">
        <div class="bgWrapper">
            <div class="responsive">
                <div class="title">${title}</div>
                <div class="text">
                    ${text} 
                </div>
                <div class="buttonWrapper">
                    <div class="yes">
                        ${yesText}
                    </div>
                    <div class="no">
                        ${noText}                    
                    </div>
                </div>
            </div>
        </div>
    </div>`
    const container = document.querySelector(".container")
    container.innerHTML += html
    const alertPopup = container.querySelector(".alertPopup")
    const yesBtn = alertPopup.querySelector(".yes")
    const noBtn = alertPopup.querySelector(".no")
    console.log(alertPopup);

    yesBtn.addEventListener("click", (e) => {
        yesFunc()
        alertPopup.remove()
    })
    
    noBtn.addEventListener("click", (e) => {
        noFunc()
        alertPopup.remove()
    })
}

// alertPopup(
//     "Are you Sure?",
//     "You would like to permanently delete your account. Other users will be able to create a new account using the same username. All settings, saved puzzles, and saved data will be deleted. The process is non-reversible.",
//     "Yes, Delete Account",
//     "No, Cancel",
//     () => {console.log("yes")},
//     () => {console.log("no")}
// )