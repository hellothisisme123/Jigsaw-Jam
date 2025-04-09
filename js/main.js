// ----- nav -----
function enableNavbar() {
    const homeBtn = document.querySelector("nav .home")
    const settingsBtn = document.querySelector("nav .settings")
    homeBtn.addEventListener("click", () => {
        if (window.location.toString().split("/")[window.location.toString().split("/").length-1] == "addPuzzles.html") {
            window.location = "../index.html"
            return
        }
        window.location = "./index.html"
    })
    settingsBtn.addEventListener("click", () => {
        if (window.location.toString().split("/")[window.location.toString().split("/").length-1] == "addPuzzles.html") {
            window.location = "../settings.html"
            return
        }
        window.location = "./settings.html"
    })
}
enableNavbar()

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
    const alertPopup = document.createElement("div");
    alertPopup.classList.add("alertPopup");

    alertPopup.innerHTML = `
        <div class="bgWrapper">
            <div class="responsive">
                <div class="title">${title}</div>
                <div class="text">${text}</div>
                <div class="buttonWrapper">
                    <div class="yes">${yesText}</div>
                    <div class="no">${noText}</div>
                </div>
            </div>
        </div>
    `;

    const container = document.querySelector(".container");
    container.appendChild(alertPopup);

    const yesBtn = alertPopup.querySelector(".yes");
    const noBtn = alertPopup.querySelector(".no");

    yesBtn.addEventListener("click", () => {
        yesFunc();
        alertPopup.remove();
    });

    noBtn.addEventListener("click", () => {
        noFunc();
        alertPopup.remove();
    });

    console.log(alertPopup);
}

// alertPopup(
//     "Are you Sure?",
//     "You would like to permanently delete your account. Other users will be able to create a new account using the same username. All settings, saved puzzles, and saved data will be deleted. The process is non-reversible.",
//     "Yes, Delete Account",
//     "No, Cancel",
//     () => {console.log("yes")},
//     () => {console.log("no")}
// )

// ----- get db data -----
async function getDBData() {
    try {
        const response = await fetch('https://192.168.240.9:3006/jigsawJam/data')
        const data = await response.json()
        return data       
    } catch (error) {
        const currentPage = window.location.href.split("/")[window.location.href.split("/").length-1]
        if (currentPage != "failedToConnect.html") {
            // window.location = "./failedToConnect.html"
        }
    }
}
(async () => {
    // let dbConnCheck
    // try {
    //     let red = await getDBData()
    //     if (red.length != 0) {
    //         console.log(red);
    //         dbConnCheck = "-------Database Connected-------"
    //     }
    // } catch (error) {
    //     dbConnCheck = "---Database Connection Failed---"
    //     console.error(error);
    // } finally {
    //     console.log(dbConnCheck);
    // }
})()

async function getUserData() {
    const data = await getDBData()
    
    const thisUserData = data.Users.filter((user) => {
        if (user.Username == localStorage.getItem('username') &&
        user.Password == localStorage.getItem('password')) {
            return user
        }
    })[0]
    
    return thisUserData
}

async function getPuzzleDataUser(id) {
    const thisUserData = await getUserData(id)

    // gets the user table data for the clicked puzzle 
    let focusedPuzzleUser = JSON.parse(thisUserData.SaveData).filter(filterData => {
        if (filterData.id == id) {
            return filterData
        }
    })[0]

    return focusedPuzzleUser
}

async function getPuzzleDataPuzzle(id) {
    const data = await getDBData()
    
    // gets the puzzle table data for the clicked puzzle 
    let focusedPuzzlePuzzle = data.Puzzles.filter(filterData => {
        if (filterData.ID == id) {
            return filterData
        }
    })[0]

    return focusedPuzzlePuzzle
}

// shuffles array accordingly to the seed
function seededShuffle(array, seed) {
    const result = array.slice(); // make a copy

    // Seeded pseudorandom number generator (mulberry32)
    function mulberry32(a) {
        return function() {
            a |= 0; a = a + 0x6D2B79F5 | 0;
            var t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    const random = mulberry32(seed);

    // Fisher-Yates shuffle using the seeded PRNG
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}