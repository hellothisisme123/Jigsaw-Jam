// getStar | requires "data" variable
function getStar(puzz, alt) {
    // returns the value accordingly
    if (alt) {
        if (!puzz) {
            return "hollow star icon"
        }
        
        if (puzz.completed) {
            return "solid star icon"
        } else {
            return "half solid star icon"
        }
    } else {
        if (!puzz) {
            return "star-regular.svg"
        }

        if (puzz.completed) {
            return "star-solid.svg"
        } else {
            return "star-half-stroke-regular.svg"
        }
    }
}

// getBookmark | requires "data" variable
function getBookmark(puzz, alt) {
    console.log(puzz);
    // returns the value accordingly
    if (alt) {
        if (puzz && puzz.completed) {
            return "solid bookmark icon"
        } else {
            return "hollow bookmark icon"
        }
    } else {
        if (puzz && puzz.completed) {
            return "bookmark-solid.svg"
        } else {
            return "bookmark-hollow.svg"
        }
    }
}

(async function fillPuzzles() {
    const puzzleContainer = document.querySelector(".container .main .mainResponsive")
    try {
        const data = await getDBData()
        data.Puzzles.forEach(async puzzle => {
            // gets the user data for the puzzle the user pressed
            let puzzleDataUser = await getPuzzleDataUser(puzzle.ID)
            console.log("---------------------");
            console.log(puzzle.ID, puzzleDataUser);
            
            puzzleContainer.innerHTML += `
                <div class="puzzle" onclick="focusPuzzle(${puzzle.ID})" data-id="${puzzle.ID}">
                    <div class="star">
                        <img src="./production/images/${getStar(puzzleDataUser, false)}" alt="${getStar(puzzle, true)}">
                    </div>
                    <div class="background">
                        <img src="./production/images/puzzle-images/${puzzle.Src}" alt="${puzzle.Alt}">
                    </div>
                    <div class="bookmark">
                        <img src="./production/images/${getBookmark(puzzleDataUser, false)}" alt="${getBookmark(puzzle, true)}">
                    </div>
                </div>
            `
        })
    } catch (error) {
        console.error('Error:', error);
        const failedToLoad = document.querySelector(".container .main .mainResponsive .failedToLoad")
        failedToLoad.classList.add("active")


        console.log(navigator.userAgent);
        if (navigator.userAgent.includes("Opera")) {
            failedToLoad.querySelector('li:nth-child(2)').innerHTML = "Click on \"Help me understand\""
        } else if (navigator.userAgent.includes("Firefox")) {
            failedToLoad.querySelector('li:nth-child(3)').innerHTML = "Click on \"Accept the Risk and Continue\""
        }
    }
})()

function resetPuzzle(id) {
    alertPopup(
        "Are you sure?", 
        "You would like to reset this puzzle to it's default state. This will permanently remove all progress on the puzzle. The process is non-reversible.", 
        "Yes, Reset Puzzle", 
        "No, Cancel", 
        async () => { // yesFunc
            try {
                /*const getResponse = await */fetch('https://192.168.240.9:3006/jigsawJam/data')
                .then(response => response.json())
                .then(async data => {
                    // gets all of the current users data
                    const thisUserData = await getUserData()
                    // console.log(thisUserData[0], data);
    
                    let newSaveDataValue = JSON.parse(thisUserData.SaveData)
                    // console.log(newSaveDataValue);
                    newSaveDataValue = JSON.stringify(newSaveDataValue.filter(puzzleSave => {
                        if (puzzleSave.id == id) return
                        else return puzzleSave 
                    }))
                    // console.log(JSON.parse(newSaveDataValue));

                    // update row
                    const response = fetch('https://192.168.240.9:3006/jigsawJam/updateRowByIDFilter', {
                        method: 'POST', // or 'PUT' if your API supports it
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: thisUserData.ID,
                            value: newSaveDataValue,
                            table: "Users",
                            column: "SaveData"
                        })
                    }); 
                    console.log((await response).json());
            
                    unFocusPuzzle()
                    focusPuzzle(id)
                    reloadPuzzleThumbnail(id)
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                })
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        () => { // noFunc

        }
    )
}

function unFocusPuzzle() {
    document.querySelectorAll('.container .focusPuzzlePopup').forEach(popup => {
        popup.remove()
    })
}

async function reloadPuzzleThumbnail(id) {
    const thumbnail = document.querySelector(`.container .main .mainResponsive .puzzle[data-id="${id}"]`)
    console.log(thumbnail);
    
    const bookmark = thumbnail.querySelector(".bookmark img")
    const star = thumbnail.querySelector(".star img")

    const focusedPuzzleUser = await getPuzzleDataUser(id)
    const focusedPuzzlePuzzle = await getPuzzleDataPuzzle(id)

    bookmark.src = `./production/images/${getBookmark(focusedPuzzleUser, false)}`
    bookmark.alt = getBookmark(focusedPuzzleUser, true)
    
    star.src = `./production/images/${getStar(focusedPuzzleUser, false)}`
    star.alt = getStar(focusedPuzzleUser, true)
}

function focusPuzzle(id) {
    unFocusPuzzle()
    
    let focusDatabase
    fetch('https://192.168.240.9:3006/jigsawJam/data')
    .then(response => response.json())
    .then(async data => {
        let focusedPuzzleUser = await getPuzzleDataUser(id)
        let focusedPuzzlePuzzle = await getPuzzleDataPuzzle(id)

        console.log(focusedPuzzleUser);
        console.log(focusedPuzzlePuzzle);

        // brings up the focus puzzle section   
        console.log(focusedPuzzlePuzzle)
        document.querySelector(".container").innerHTML += `
            <div class="focusPuzzlePopup" data-id="${focusedPuzzlePuzzle.ID}">
                <div class="responsive">
                    <div class="space"></div>
                    <div class="exitButton" onclick="unFocusPuzzle()">
                        <img src="./production/images/xmark-solid.svg" alt="exit button">
                    </div>
                    <div class="title">${getPercentComplete(focusedPuzzleUser, focusedPuzzlePuzzle)}% Complete</div>
                    <div class="buttonWrapper">
                        <div class="dropdown wrapper">
                            <select name="boardMode" id="boardMode">
                                ${getSizeOptions(focusedPuzzleUser, focusedPuzzlePuzzle)}
                            </select>
                        </div>
                        <div class="reset" onclick="resetPuzzle(${focusedPuzzlePuzzle.ID})">
                            Reset Puzzle
                        </div>
                    </div>
                    <div class="puzzle">
                        <div class="bookmark" onclick="bookmarkBtn(${focusedPuzzlePuzzle.ID})">
                            <img src="./production/images/${getBookmark(focusedPuzzleUser, false)}" alt="${getBookmark(focusedPuzzleUser, true)}">
                        </div>
                        <div class="background"><img src="./production/images/puzzle-images/${focusedPuzzlePuzzle.Src}" alt="${focusedPuzzlePuzzle.Alt}"></div>
                        <div class="star">
                            <img src="./production/images/${getStar(focusedPuzzleUser, false)}" alt="${getStar(focusedPuzzleUser, true)}">
                        </div>
                    </div>
                    <div class="tagWrapper">
                        <div class="label">Tags:</div>
                        ${getTags(focusedPuzzleUser, focusedPuzzlePuzzle)}
                    </div>
                    <div class="openPuzzleButton">
                        <div class="text">
                            Open Puzzle
                        </div>
                        <div class="img">
                            <img src="./production/images/keep-puzzling-button.png" alt="">
                        </div>
                    </div>
                    <div class="space"></div>
                </div>
            </div>
        `

        focusDatabase = data
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

async function bookmarkBtn(id) {
    let newUserData = JSON.parse((await getUserData()).SaveData)
    
    const puzzleData_Puzzles = await getPuzzleDataPuzzle(id)
    const puzzleData_Users = await getPuzzleDataUser(id)
    
    if (puzzleData_Users == undefined) {
        newUserData.push({
            "id": id,
            "width": parseInt(JSON.parse(puzzleData_Puzzles.Sizes)[0].split("x")[0]),
            "height": parseInt(JSON.parse(puzzleData_Puzzles.Sizes)[0].split("x")[1]),
            "saved": true,
            "completed": false,
            "completionData": []
        })
    } else {
        console.log(newUserData);
        
        let tmp
        newUserData = newUserData.filter(data => {
            if (data.id == id) {
                tmp = data
                return
            }
            else return data
        })
        tmp.saved = !tmp.saved
        newUserData.push(tmp)

        console.log(newUserData);
        console.log(puzzleData_Puzzles);
        console.log(puzzleData_Users);
    }



    // console.log(thisPuzzleDataUsers)

    // update row
    // const response = fetch('https://192.168.240.9:3006/jigsawJam/updateRowByIDFilter', {
    //     method: 'POST', // or 'PUT' if your API supports it
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         id: (await getUserData()).ID,
    //         value: newSaveDataValue,
    //         table: "Users",
    //         column: "SaveData"
    //     })
    // }); 
    // console.log((await response).json());

    // console.log(userSaveData);
}

function getSizeOptions(userPuzz, puzz) {
    function getSelected(size) {
        if (userPuzz && userPuzz.width == size[0] && userPuzz.height == size[1]) return "selected"
        else return ""
    }
    
    let res = ""
    let sizes = JSON.parse(puzz.Sizes)
    sizes.forEach(size => {
        size = size.split("x")
        res += `<option ${getSelected(size)} value="table">${parseInt(size[0])}x${parseInt(size[1])} - ${parseInt(size[0]) * parseInt(size[1])} Pieces</option>`
    })

    return res
}

function getPercentComplete(userPuzz, puzz) {
    if (!userPuzz) return "0"
    return Math.round(userPuzz.completionData.length / userPuzz.height * userPuzz.width)
}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function getTags(userPuzz, puzz) {
    let res = ""
    let tags = JSON.parse(puzz.Tags)
    if (userPuzz && userPuzz.saved) res += `<div class="tag active">Saved</div>`
    tags.forEach(tag => {
        res += `<div class="tag active">${capitalizeFirstLetter(tag)}</div>`
    })

    return res
}

async function getDBData() {
    const response = await fetch('https://192.168.240.9:3006/jigsawJam/data')
    const data = await response.json()
    return data
}

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

// search bar x button
document.querySelector('.container .navigation .navResponsive .searchbar .xIcon img').addEventListener("click", (e) => {
    document.querySelector('.container .navigation .navResponsive .searchbar input').value = ""
})

// search bar tabs
const tabs = document.querySelectorAll('.container .navigation .navResponsive .settingsTabWrapper .tab'),
account = document.querySelector('.container .main .mainResponsive .settingsTab.account'),
game = document.querySelector('.container .main .mainResponsive .settingsTab.game'),
audio = document.querySelector('.container .main .mainResponsive .settingsTab.audio'),
video = document.querySelector('.container .main .mainResponsive .settingsTab.video'),
maintabs = [account, game, audio, video]
tabs.forEach(tab => {
    let active = true
    
    tab.addEventListener("click", (e) => {
        active = !active

        if (active) {
            tab.classList.add("active")
            if (tab.classList.contains("account")) {
                account.classList.add("active")
            } else if (tab.classList.contains("game")) {
                game.classList.add("active")
            } else if (tab.classList.contains("audio")) {
                audio.classList.add("active")
            } else if (tab.classList.contains("video")) {
                video.classList.add("active")
            }
        } else {
            tab.classList.remove("active")
            if (tab.classList.contains("account")) {
                account.classList.remove("active")
            } else if (tab.classList.contains("game")) {
                game.classList.remove("active")
            } else if (tab.classList.contains("audio")) {
                audio.classList.remove("active")
            } else if (tab.classList.contains("video")) {
                video.classList.remove("active")
            }
        }
    })
})