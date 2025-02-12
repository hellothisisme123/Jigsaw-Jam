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

// fill puzzles
let database
fetch('http://192.168.240.9:3006/jigsawJam/data')
.then(response => response.json())
.then(data => {
    const puzzleContainer = document.querySelector(".container .main .mainResponsive")

    data.Puzzles.forEach(puzzle => {
        // gets the current user data
        const thisUserData = data.Users.filter((user) => {
            if (user.Username == localStorage.getItem('username') &&
            user.Password == localStorage.getItem('password')) {
                return user
            }
        })
        
        // gets the user data for the puzzle the user pressed
        let puzzleDataUser = JSON.parse(thisUserData[0].SaveData).filter(filterData => {
            if (filterData.id == puzzle.ID) {
                return filterData
            }
        })[0]
    
        
        puzzleContainer.innerHTML += `
            <div class="puzzle" onclick="focusPuzzle(${puzzle.ID})">
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
    database = data
})
.catch(error => {
    console.error('Error fetching data:', error);
});

function resetPuzzle(id) {
    alertPopup(
        "Are you sure?", 
        "You would like to reset this puzzle to it's default state. This will permanently remove all progress on the puzzle. The process is non-reversible.", 
        "Yes, Reset Puzzle", 
        "No, Cancel", 
        () => { // yesFunc
            fetch('http://192.168.240.9:3006/jigsawJam/data')
            .then(response => response.json())
            .then(async data => {
                // gets all of the current users data
                const thisUserData = data.Users.filter((user) => {
                    if (user.Username == localStorage.getItem('username') &&
                    user.Password == localStorage.getItem('password')) {
                        return user
                    }
                })
                // console.log(thisUserData[0], data);

                let newSaveDataValue = JSON.parse(thisUserData[0].SaveData)
                console.log(newSaveDataValue);
                newSaveDataValue = JSON.stringify(newSaveDataValue.filter(puzzleSave => {
                    if (puzzleSave.id == id) return
                    else return puzzleSave 
                }))
                console.log(JSON.parse(newSaveDataValue));

                // update row
                const response = fetch('/jigsawJam/updateRowByIDFilter', {
                    method: 'POST', // or 'PUT' if your API supports it
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: id,
                        value: newSaveDataValue,
                        table: "Users",
                        column: "SaveData"
                    })
                }); 
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            })
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

// focusPuzzle
function focusPuzzle(id) {
    unFocusPuzzle()
    
    let focusDatabase
    fetch('http://192.168.240.9:3006/jigsawJam/data')
    .then(response => response.json())
    .then(data => {
        // gets all of the current users data
        const thisUserData = data.Users.filter((user) => {
            if (user.Username == localStorage.getItem('username') &&
            user.Password == localStorage.getItem('password')) {
                return user
            }
        })
        console.log(thisUserData[0], data);

        // gets the user table data for the clicked puzzle 
        let focusedPuzzleUser = JSON.parse(thisUserData[0].SaveData).filter(filterData => {
            if (filterData.id == id) {
                return filterData
            }
        })[0]
        console.log(focusedPuzzleUser);

        // gets the puzzle table data for the clicked puzzle 
        let focusedPuzzlePuzzle = data.Puzzles.filter(filterData => {
            if (filterData.ID == id) {
                return filterData
            }
        })[0]
        // focusedPuzzlePuzzle.sizes = JSON.parse(focusedPuzzlePuzzle.sizes)
        console.log(focusedPuzzlePuzzle);

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
            console.log(focusedPuzzleUser, focusedPuzzlePuzzle);
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
                        <div class="bookmark">
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

