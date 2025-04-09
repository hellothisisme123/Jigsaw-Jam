function getStar(puzz, alt) {
    // returns the value accordingly
    if (alt) {
        if (!puzz) {
            return "hollow star icon"
        }
        
        if (puzz.completed) {
            return "solid star icon"
        } else {
            if (puzz.completionData.length < 1) {
                return "hollow star icon"
            }
            return "half solid star icon"
        }
    } else {
        if (!puzz) {
            return "star-regular.svg"
        }

        if (puzz.completed) {
            return "star-solid.svg"
        } else {
            if (puzz.completionData.length < 1) {
                return "star-regular.svg"
            }
            return "star-half-stroke-regular.svg"
        }
    }
}

function getBookmark(puzz, alt) {
    // console.log(puzz);
    // returns the value accordingly
    if (alt) {
        if (puzz && puzz.saved) {
            return "solid bookmark icon"
        } else {
            return "hollow bookmark icon"
        }
    } else {
        if (puzz && puzz.saved) {
            return "bookmark-solid.svg"
        } else {
            return "bookmark-hollow.svg"
        }
    }
}

function getPercentComplete(userPuzz, puzz) {
    if (!userPuzz) return "0"
    return Math.round(userPuzz.completionData.length / userPuzz.height * userPuzz.width)
}

function getSizeOptions(userPuzz, puzz) {
    function getSelected(size) {
        if (userPuzz && userPuzz.width == size[0] && userPuzz.height == size[1]) return "selected"
        else return ""
    }
    
    let res = ""
    let sizes = JSON.parse(puzz.Sizes)
    sizes.forEach((size, i) => {
        size = size.split("x")
        res += `<option ${getSelected(size)} value="${i}">${parseInt(size[0])}x${parseInt(size[1])} - ${parseInt(size[0]) * parseInt(size[1])} Pieces</option>`
    })

    return res
}

function getTags(userPuzz, puzz, list) {
    if (!list) {
        let res = ""
        let tags = JSON.parse(puzz.Tags)
        if (userPuzz && userPuzz.saved) res += `<div class="tag active">Saved</div>`
        tags.forEach(tag => {
            res += `<div class="tag active">${capitalizeFirstLetter(tag)}</div>`
        })
        
        return res
    } else {
        let res = ""
        let tags = JSON.parse(puzz.Tags)
        tags.forEach(tag => {
            res += ` ${tag}`
        })
        return res.trim()
    }
}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function unFocusPuzzle() {
    document.querySelectorAll('.container .focusPuzzlePopup').forEach(popup => {
        popup.remove()
    })
}

async function focusPuzzle(id) {
    unFocusPuzzle()
    console.log("red");
    
    let focusedPuzzleUser = await getPuzzleDataUser(id)
    let focusedPuzzlePuzzle = await getPuzzleDataPuzzle(id)

    // console.log(focusedPuzzleUser);
    // console.log(focusedPuzzlePuzzle)

    // brings up the focus puzzle section   
    let html = document.createElement("div")
    html.classList.add("focusPuzzlePopup")
    html.dataset.id = focusedPuzzlePuzzle.ID
    html.innerHTML = `
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
                ${getTags(focusedPuzzleUser, focusedPuzzlePuzzle, false)}
            </div>
            <div class="openPuzzleButton" onclick="openPuzzle(${focusedPuzzlePuzzle.ID})">
                <div class="text">
                    Open Puzzle
                </div>
                <div class="img">
                    <img src="./production/images/keep-puzzling-button.png" alt="">
                </div>
            </div>
            <div class="space"></div>
        </div>
    `
    document.querySelector(".container").appendChild(html)
}

function openPuzzle(id) {
    window.location = `./game.html?id=${id}`
}

async function bookmarkBtn(id) {
    let newUserData = JSON.parse((await getUserData()).SaveData)
    if (!newUserData) newUserData = []
    console.log(newUserData);

    const puzzleData_Puzzles = await getPuzzleDataPuzzle(id)
    const puzzleData_Users = await getPuzzleDataUser(id)
    
    if (puzzleData_Users == undefined) {
        newUserData.push({
            "id": id,
            "width": parseInt(JSON.parse(puzzleData_Puzzles.Sizes)[document.querySelector(".focusPuzzlePopup select#boardMode").value].split("x")[0]),
            "height": parseInt(JSON.parse(puzzleData_Puzzles.Sizes)[document.querySelector(".focusPuzzlePopup select#boardMode").value].split("x")[1]),
            "saved": true,
            "completed": false,
            "timeAccessed": Date.now(),
            "completionData": []
        })
    } else {
        newUserData = newUserData.filter(data => {
            if (data.id == id) {
                data.saved = !data.saved
            }
            return data
        })
    }
    
    // push to database
    // update row
    console.log(newUserData);
    const response = fetch('https://192.168.240.9:3006/jigsawJam/updateRowByIDFilter', {
        method: 'POST', // or 'PUT' if your API supports it
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: (await getUserData()).ID,
            value: JSON.stringify(newUserData),
            table: "Users",
            column: "SaveData"
        })
    }); 
    (await response).json().then(() => {
        unFocusPuzzle()
        focusPuzzle(id)
        reloadPuzzleThumbnails(id)
    })
}

async function reloadPuzzleThumbnails(id) {
    // explore puzzles page puzzle thumbnail
    let thumbnails = document.querySelectorAll(`.container .main .mainResponsive .puzzle[data-id="${id}"]`)
    
    console.log(thumbnails);
    if (thumbnails.length < 1) { // home page puzzle thumbnail
        thumbnails = document.querySelectorAll(`.container .quickPuzzles .puzzle[data-id="${id}"]`)
    }

    thumbnails.forEach(async thumbnail => {
        const bookmark = thumbnail.querySelector(".bookmark img")
        const star = thumbnail.querySelector(".star img")
    
        const focusedPuzzleUser = await getPuzzleDataUser(id)
        const focusedPuzzlePuzzle = await getPuzzleDataPuzzle(id)
        
        console.log(bookmark);
        bookmark.src = `./production/images/${getBookmark(focusedPuzzleUser, false)}`
        bookmark.alt = getBookmark(focusedPuzzleUser, true)
    
        star.src = `./production/images/${getStar(focusedPuzzleUser, false)}`
        star.alt = getStar(focusedPuzzleUser, true)
    })
}

function resetPuzzle(id) {
    console.log("blue");
    
    alertPopup(
        "Are you sure?", 
        "You would like to reset this puzzle to it's default state. This will permanently remove all progress on the puzzle. The process is non-reversible.", 
        "Yes, Reset Puzzle", 
        "No, Cancel", 
        async () => { // yesFunc
            // gets all of the current users data
            const thisUserData = await getUserData()
            // console.log(thisUserData[0], data);

            let newSaveDataValue = JSON.parse(thisUserData.SaveData)
            // console.log(newSaveDataValue);
            newSaveDataValue = newSaveDataValue.filter(puzzleSave => {
                if (puzzleSave.id == id) return
                else return puzzleSave 
            })
            // console.log(JSON.parse(newSaveDataValue));

            // update row
            const response = fetch('https://192.168.240.9:3006/jigsawJam/updateRowByIDFilter', {
                method: 'POST', // or 'PUT' if your API supports it
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: thisUserData.ID,
                    value: JSON.stringify(newSaveDataValue),
                    table: "Users",
                    column: "SaveData"
                })
            }); 
            console.log((await response).json());
    
            unFocusPuzzle()
            focusPuzzle(id)
            reloadPuzzleThumbnails(id)
        },
        () => { // noFunc

        }
    )
}