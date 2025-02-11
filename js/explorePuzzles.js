// fill puzzles
let database
fetch('http://192.168.240.9:3006/jigsawJam/data')
.then(response => response.json())
.then(data => {
    const puzzleContainer = document.querySelector(".container .main .mainResponsive")
    data.Puzzles.forEach(puzzle => {
        // getStar | requires "data" variable
        function getStar(puzz, alt) {
            // gets the current user data
            const thisUserData = data.Users.filter((user) => {
                if (user.Username == localStorage.getItem('username') &&
                user.Password == localStorage.getItem('password')) {
                    return user
                }
            })
            
            // gets the user data for the puzzle the user pressed
            let focusedPuzzle = JSON.parse(thisUserData[0].SaveData).filter(filterData => {
                if (filterData.id == puzz.ID) {
                    return filterData
                }
            })[0]

            // returns the value accordingly
            if (alt) {
                if (!focusedPuzzle) {
                    return "hollow star icon"
                }
                
                if (focusedPuzzle.completed) {
                    return "solid star icon"
                } else {
                    return "half solid star icon"
                }
            } else {
                if (!focusedPuzzle) {
                    return "star-regular.svg"
                }

                if (focusedPuzzle.completed) {
                    return "star-solid.svg"
                } else {
                    return "star-half-stroke-regular.svg"
                }
            }
            focusDatabase = data
        }

        // getBookmark | requires "data" variable
        function getBookmark(puzz, alt) {
            // gets the current user data
            const thisUserData = data.Users.filter((user) => {
                if (user.Username == localStorage.getItem('username') &&
                user.Password == localStorage.getItem('password')) {
                    return user
                }
            })
            
            // gets the user data for the puzzle the user pressed
            let focusedPuzzle = JSON.parse(thisUserData[0].SaveData).filter(filterData => {
                if (filterData.id == puzz.ID) {
                    return filterData
                }
            })[0]

            // returns the value accordingly
            if (alt) {
                if (focusedPuzzle && focusedPuzzle.completed) {
                    return "solid bookmark icon"
                } else {
                    return "hollow bookmark icon"
                }
            } else {
                if (focusedPuzzle && focusedPuzzle.completed) {
                    return "bookmark-solid.svg"
                } else {
                    return "bookmark-hollow.svg"
                }
            }
            focusDatabase = data
        }
        
        puzzleContainer.innerHTML += `
            <div class="puzzle" onclick="focusPuzzle(${puzzle.ID})">
                <div class="star">
                    <img src="./production/images/${getStar(puzzle, false)}" alt="${getStar(puzzle, true)}">
                </div>
                <div class="background">
                    <img src="./production/images/puzzle-images/${puzzle.Src}" alt="${puzzle.Alt}">
                </div>
                <div class="bookmark">
                    <img src="./production/images/${getBookmark(puzzle, false)}" alt="${getBookmark(puzzle, true)}">
                </div>
            </div>
        `

    })
    database = data
})
.catch(error => {
    console.error('Error fetching data:', error);
});

// focusPuzzle
function focusPuzzle(id) {
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

        getSizeOptions(focusedPuzzleUser, focusedPuzzlePuzzle)
        function getSizeOptions(puzz, userPuzz) {
            console.log(puzz, userPuzz);
            let res = ""

            res += `<option value="table">10x15 - 150 Pieces</option>`
            // <option value="table">10x15 - 150 Pieces</option>
            // <option value="shuffle">25x12 - 300 Pieces</option>
            // <option value="table">20x20 - 400 Pieces</option>
        }

        // brings up the focus puzzle section   
        document.querySelector(".container").innerHTML += `
            <div class="focusPuzzlePopup">
                <div class="responsive">
                    <div class="space"></div>
                    <div class="exitButton">
                        <img src="./production/images/xmark-solid.svg" alt="exit button">
                    </div>
                    <div class="title">100% Complete</div>
                    <div class="buttonWrapper">
                        <div class="dropdown wrapper">
                            <select name="boardMode" id="boardMode">
                                
                            </select>
                        </div>
                        <div class="reset">
                            Reset Puzzle
                        </div>
                    </div>
                    <div class="puzzle">
                        <div class="bookmark">
                            <img src="./production/images/bookmark-hollow.svg" alt="hollow bookmark icon">
                        </div>
                        <div class="background"><img src="./production/images/puzzle-images/cat-3.jpg" alt="cat image"></div>
                        <div class="star">
                            <img src="./production/images/star-regular.svg" alt="hollow star icon">
                        </div>
                    </div>
                    <div class="tagWrapper">
                        <div class="label">Tags:</div>
                        <div class="tag active account">Saved</div>
                        <div class="tag active game">Animals</div>
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

