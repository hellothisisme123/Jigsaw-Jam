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
            } else {
                return "star-half-stroke-regular.svg"
            }
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
    return Math.round(userPuzz.completionData.length / (userPuzz.height * userPuzz.width) * 100)
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
        let text = `${parseInt(size[0])}x${parseInt(size[1])} - ${parseInt(size[0]) * parseInt(size[1])} Pieces`
        res += `<div class="option ${getSelected(size)}" onclick="sizeChange(${i}, ${puzz.ID})">${text}</div>`
    })

    return res
}

function getSelectedDropdownOption(userPuzz, puzz) {
    let sizes = JSON.parse(puzz.Sizes)
    let res

    if (!userPuzz) {
        let size = sizes[0].split("x")
        res = `<div class="selectedOption" onclick="toggleSizeDropdown()">${parseInt(size[0])}x${parseInt(size[1])} - ${parseInt(size[0]) * parseInt(size[1])} Pieces</div>`
    } else {
        sizes.forEach((size, i) => {
            size = size.split("x")
            if (userPuzz && userPuzz.width == size[0] && userPuzz.height == size[1]) {
                res = `<div class="selectedOption" onclick="toggleSizeDropdown()">${parseInt(size[0])}x${parseInt(size[1])} - ${parseInt(size[0]) * parseInt(size[1])} Pieces</div>`
            }
        })
    }
    return res
}

function getSelectedValue(userPuzz, puzz) {
    let sizes = JSON.parse(puzz.Sizes)
    let res

    if (!userPuzz) {
        res = 0
    } else {
        sizes.forEach((size, i) => {
            size = size.split("x")
    
            if (userPuzz && userPuzz.width == size[0] && userPuzz.height == size[1]) {
                res = i
            }
        })
    }

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

        if (userPuzz) {
            if (userPuzz.id == 56) console.log(userPuzz);
            
            if (userPuzz.saved) {
                res += " saved"
            }

            if (!userPuzz.saved) {
                res += " unsaved"
            }

            if (userPuzz.completed) {
                res += " completed"
            }

            if (!userPuzz.completed) {
                res += " uncompleted"
            }
        } else {
            res += " uncompleted"
            res += " unsaved"
        }

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
    // console.log("red");
    
    let focusedPuzzleUser = await getPuzzleDataUser(id)
    let focusedPuzzlePuzzle = await getPuzzleDataPuzzle(id)

    console.log(focusedPuzzleUser);
    console.log(focusedPuzzlePuzzle)

    // brings up the focus puzzle section   
    let html = document.createElement("div")
    html.classList.add("focusPuzzlePopup")
    html.dataset.id = focusedPuzzlePuzzle.ID
    // console.log(getSelectedValue(focusedPuzzleUser, focusedPuzzlePuzzle));
    html.innerHTML = `
        <div class="responsive">
            <div class="space"></div>
            <div class="exitButton" onclick="unFocusPuzzle()">
                <img src="./production/images/xmark-solid.svg" alt="exit button">
            </div>
            <div class="title">${getPercentComplete(focusedPuzzleUser, focusedPuzzlePuzzle)}% Complete</div>
            <div class="buttonWrapper">
                <div class="dropdown wrapper">
                    <div class="select" data-value="${getSelectedValue(focusedPuzzleUser, focusedPuzzlePuzzle)}" name="boardMode" id="boardMode">
                        ${getSelectedDropdownOption(focusedPuzzleUser, focusedPuzzlePuzzle)}
                        <div class="options">
                            ${getSizeOptions(focusedPuzzleUser, focusedPuzzlePuzzle)}
                        </div>
                    </div>
                    <div class="dropdownArrow">
                        <img src="./production/images/chevron-down-solid.svg" alt="down facing arrow">
                    </div>
                </div>
                <div class="reset" onclick="resetPuzzle(${focusedPuzzlePuzzle.ID})">
                    Delete Puzzle
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
            <div class="tagsGrid">
                <div class="label">Tags:</div>
                <div class="tagWrapper">
                    ${getTags(focusedPuzzleUser, focusedPuzzlePuzzle, false)}
                </div>
            </div>
            <div class="openPuzzleButton" onclick="openPuzzle(${focusedPuzzlePuzzle.ID})">
                <div class="text">
                    Open Puzzle
                </div>
                <div class="img">
                    <img src="./production/images/keep-puzzling-button.png" alt="Open Puzzle Button">
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

// update every instance of a puzzle in the dom
async function updateEachPuzzleInstance(id) {
    const puzzleData = await getPuzzleDataUser(id)
    console.log(id, puzzleData);
    
    document.querySelectorAll(`.puzzle[data-id="${id}"]`).forEach(puzzle => {

        if (puzzleData) {
            if (puzzleData.saved) {
                puzzle.classList.remove("unsaved")
                puzzle.classList.add("saved")
            } else {
                puzzle.classList.add("unsaved")
                puzzle.classList.remove("saved")
            }

            if (puzzleData.completed) {
                puzzle.classList.remove("uncompleted")
                puzzle.classList.add("completed")
            } else {
                puzzle.classList.add("uncompleted")
                puzzle.classList.remove("completed")
            }
        } else {
            puzzle.classList.add("unsaved")
            puzzle.classList.remove("saved")
            puzzle.classList.add("uncompleted")
            puzzle.classList.remove("completed")
        }
        
        puzzle.querySelector(".star img").src = `./production/images/${getStar(puzzleData, false)}`
        puzzle.querySelector(".star img").alt = getStar(puzzleData, true)
        puzzle.querySelector(".bookmark img").src = `./production/images/${getBookmark(puzzleData, false)}`
        puzzle.querySelector(".bookmark img").alt = getBookmark(puzzleData, true)
    })
}

async function bookmarkBtn(id) {
    userDataChange(id, async (newUserData) => {
        let puzzleDataUsers = await getPuzzleDataUser(id)
        
        return newUserData.filter(data => {
            if (data.id == id) {
                if (puzzleDataUsers) {
                    data.saved = !puzzleDataUsers.saved
                } else data.saved = true
            }
            return data
        })
    }, false).then(async newPuzzleData => {
        // popup changes
        const bookmarkImg = document.querySelector(".focusPuzzlePopup .bookmark img") 
        bookmarkImg.src = `./production/images/${getBookmark(newPuzzleData, false)}`
        bookmarkImg.alt = getBookmark(newPuzzleData, true)

        // update recent sidescroller on home page
        if (window.location.toString().split("/")[window.location.toString().split("/").length-1] == "index.html") {
            const recentSidescroller = document.querySelector(".container .quickPuzzles .recent .sidescroll")
            const recentPuzzles = await getRecentPuzzles()
            setupMostRecentPuzzle()
            refreshLazyPuzzleWrapper(recentSidescroller, recentPuzzles)
        }

        // updatePuzzleThumbnails
        updateEachPuzzleInstance(id)
    })
}

async function sizeChange(newValue, id) {
    const puzzleDataUser = await getPuzzleDataUser(id)
    const puzzleDataPuzzle = await getPuzzleDataPuzzle(id)
    const select = document.querySelector(".container .focusPuzzlePopup .select")
    const oldValue = select.dataset.value
    console.log(oldValue, newValue);
    
    // console.log(puzzleDataUser.completionData.length);
    if (oldValue == newValue) {
        select.classList.toggle("selected")
    } else {
        if (puzzleDataUser && puzzleDataUser.completionData.length < 1) {
            yesFunc()
            return
        }
        
        async function yesFunc() {
            userDataChange(id, async (newUserData) => {
                let puzzleDataPuzzles = await getPuzzleDataPuzzle(id)
                
                return newUserData.filter(data => {
                    if (data.id == id) {
                        data.width = parseInt(JSON.parse(puzzleDataPuzzles.Sizes)[newValue].split("x")[0])
                        data.height = parseInt(JSON.parse(puzzleDataPuzzles.Sizes)[newValue].split("x")[1])
                        data.completionData = []
                    }
                    return data
                })                
            }).then(async newPuzzleData => {
                // popup changes
                select.classList.toggle("selected")
                let sizes = JSON.parse(puzzleDataPuzzle.Sizes)
                let size = sizes[newValue].split("x")
                select.querySelector('.selectedOption').innerHTML = `${parseInt(size[0])}x${parseInt(size[1])} - ${parseInt(size[0]) * parseInt(size[1])} Pieces`
                document.querySelector('.container .focusPuzzlePopup .title').innerHTML = `0% Complete`
                const starImg = document.querySelector('.container .focusPuzzlePopup .star img')
                starImg.src = "./production/images/star-regular.svg"
                starImg.alt = "hollow star icon"
                select.dataset.value = newValue
                
                // update recent sidescroller on home page
                if (window.location.toString().split("/")[window.location.toString().split("/").length-1] == "index.html") {
                    const recentSidescroller = document.querySelector(".container .quickPuzzles .recent .sidescroll")
                    const recentPuzzles = await getRecentPuzzles()
                    setupMostRecentPuzzle()
                    refreshLazyPuzzleWrapper(recentSidescroller, recentPuzzles)
                }

                // updatePuzzleThumbnails
                updateEachPuzzleInstance(id)
            })
        }
            
        if (puzzleDataUser && puzzleDataUser.completionData > 1) {
            alertPopup(
                "Are you Sure?",
                "You would like to change the size of this puzzle. You have progress saved on this puzzle. All progress on the current sizing will be permanently deleted. The process is non-reversible.",
                "Yes, Change Size",
                "No, Cancel",
                () => {
                    yesFunc()
                },
                () => {
                    select.classList.toggle("selected")
                }
            )
        } else {
            yesFunc()
        }
    }
}

async function toggleSizeDropdown(id) {
    const select = document.querySelector(".container .focusPuzzlePopup .select")
    select.classList.toggle("selected")
    console.log(select);
}

async function reloadPuzzleThumbnails(id) {
    let thumbnails = document.querySelectorAll(`.container .main .mainResponsive .puzzle[data-id="${id}"]`)
    
    if (thumbnails.length < 1) { // home page puzzle thumbnail
        thumbnails = document.querySelectorAll(`.container .quickPuzzles .puzzle[data-id="${id}"]`)
    }

    thumbnails.forEach(async thumbnail => {
        const focusedPuzzleUser = await getPuzzleDataUser(id)
        const focusedPuzzlePuzzle = await getPuzzleDataPuzzle(id)

        if (
            thumbnail.parentElement.parentElement.classList.contains("recent") &&
            !focusedPuzzleUser
        ) {
            thumbnail.remove()
        }
        // console.log(await getUserData());
        // if (focusedPuzzleUser)

        const bookmark = thumbnail.querySelector(".bookmark img")
        const star = thumbnail.querySelector(".star img")
        
        bookmark.src = `./production/images/${getBookmark(focusedPuzzleUser, false)}`
        bookmark.alt = getBookmark(focusedPuzzleUser, true)
    
        star.src = `./production/images/${getStar(focusedPuzzleUser, false)}`
        star.alt = getStar(focusedPuzzleUser, true)
    })
}

async function resetPuzzle(id) {
    const puzzleData_Users = await getPuzzleDataUser(id)
    if (puzzleData_Users) {
        alertPopup(
            "Are you Sure?",
            "You would like to delete this puzzle. This will permanently remove all saved progress on the puzzle. The process is non-reversible.",
            "Yes, Delete Puzzle",
            "No, Cancel",
            () => {
                userDataChange(id, (newUserData) => {
                    return newUserData.filter(data => {
                        if (data.id != id) return data
                    })
                }).then(async newUserData => {
                    // popup changes
                    unFocusPuzzle()

                    // update recent sidescroller on home page
                    if (window.location.toString().split("/")[window.location.toString().split("/").length-1] == "index.html") {
                        const recentSidescroller = document.querySelector(".container .quickPuzzles .recent .sidescroll")
                        const recentPuzzles = await getRecentPuzzles()
                        setupMostRecentPuzzle()
                        refreshLazyPuzzleWrapper(recentSidescroller, recentPuzzles)
                    }

                    // updatePuzzleThumbnails
                    updateEachPuzzleInstance(id)
                })
            },
            () => {
            }
        )
    } else {
        alertPopup(
            "Error",
            "You do not have saved data on this puzzle to delete. When you start this puzzle you will be able to delete your data with this button.",
            "Okay",
            "Epic",
            () => {
            },
            () => {
            }
        )
    }
    
}