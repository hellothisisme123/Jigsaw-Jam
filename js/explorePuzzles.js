// getStar | requires "data" variable
function getStar(puzz, alt) {
    // console.log(puzz);
    
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

// getBookmark | requires "data" variable
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

async function fillPuzzles() {
    try {
        const data = await getDBData();
        console.log(data);
        const totalPuzzles = data.Puzzles.length;
        const batchSize = 10;
        const batches = [];
        
        for (let i = 0; i < totalPuzzles; i += batchSize) {
            batches.push(data.Puzzles.slice(i, i + batchSize));
        }
        
        for (const batch of batches) {
            await processBatch(batch);
        }
        
        console.log("Loaded all puzzles!");
        observeLazyImages();
    } catch (error) {
        console.error('Error:', error);
        document.querySelector(".container .main .mainResponsive .failedToLoad").classList.add("active");
    }
}

async function processBatch(batch) {
    const puzzleContainer = document.querySelector(".container .main .mainResponsive");
    const fragment = document.createDocumentFragment();
    
    const batchPromises = batch.map((puzzle, index) => asyncTask(puzzle, index));
    const results = await Promise.all(batchPromises);
    results.sort((a, b) => a.index - b.index);

    results.forEach(result => {
        if (!document.querySelector(`[data-id='${result.id}']`)) {
            const div = document.createElement("div");
            div.innerHTML = result.html;
            fragment.appendChild(div.firstElementChild);
        }
    });

    puzzleContainer.appendChild(fragment);
    observeLazyImages();
}

async function asyncTask(puzzle, index) {
    let puzzleData_Users = await getPuzzleDataUser(puzzle.ID);
    let puzzleData_Puzzles = await getPuzzleDataPuzzle(puzzle.ID);
    const html = `
        <div class="puzzle active ${getTags(puzzleData_Users, puzzleData_Puzzles, true)}" onclick="focusPuzzle(${puzzle.ID})" data-id="${puzzle.ID}">
            <div class="star">
                <img class="lazy" data-src="./production/images/${getStar(puzzleData_Users, false)}" alt="${getStar(puzzleData_Users, true)}">
            </div>
            <div class="background">
                <img class="lazy" data-src="./production/images/puzzle-images/${puzzle.Src}" alt="${puzzle.Alt}">
            </div>
            <div class="bookmark">
                <img class="lazy" data-src="./production/images/${getBookmark(puzzleData_Users, false)}" alt="${getBookmark(puzzleData_Users, true)}">
            </div>
        </div>
    `;

    return { html, index, id: puzzle.ID };
}

function observeLazyImages() {
    const lazyImages = document.querySelectorAll("img.lazy");
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute("data-src");
                    img.classList.remove("lazy");
                }
                observer.unobserve(img);
            }
        });
    }, { rootMargin: "100px" });

    lazyImages.forEach(img => observer.observe(img));
}

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

function bookmarkPuzzle(id) {

}

function unFocusPuzzle() {
    document.querySelectorAll('.container .focusPuzzlePopup').forEach(popup => {
        popup.remove()
    })
}

async function reloadPuzzleThumbnail(id) {
    const thumbnail = document.querySelector(`.container .main .mainResponsive .puzzle[data-id="${id}"]`)
    
    const bookmark = thumbnail.querySelector(".bookmark img")
    const star = thumbnail.querySelector(".star img")
    
    const focusedPuzzleUser = await getPuzzleDataUser(id)
    const focusedPuzzlePuzzle = await getPuzzleDataPuzzle(id)
    
    console.log(bookmark);
    bookmark.src = `./production/images/${getBookmark(focusedPuzzleUser, false)}`
    bookmark.alt = getBookmark(focusedPuzzleUser, true)
    
    star.src = `./production/images/${getStar(focusedPuzzleUser, false)}`
    star.alt = getStar(focusedPuzzleUser, true)
}

function focusPuzzle(id) {
    unFocusPuzzle()
    
    fetch('https://192.168.240.9:3006/jigsawJam/data')
    .then(response => response.json())
    .then(async data => {
        let focusedPuzzleUser = await getPuzzleDataUser(id)
        let focusedPuzzlePuzzle = await getPuzzleDataPuzzle(id)

        // console.log(focusedPuzzleUser);
        // console.log(focusedPuzzlePuzzle)

        // brings up the focus puzzle section   
        let html = document.createElement("div")
        html.innerHTML = `
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
                        ${getTags(focusedPuzzleUser, focusedPuzzlePuzzle, false)}
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
        document.querySelector(".container").appendChild(html)
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
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
        reloadPuzzleThumbnail(id)
    })
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

function getPercentComplete(userPuzz, puzz) {
    if (!userPuzz) return "0"
    return Math.round(userPuzz.completionData.length / userPuzz.height * userPuzz.width)
}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
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

// search bar x button
document.querySelector('.container .navigation .navResponsive .searchbar .xIcon img').addEventListener("click", (e) => {
    document.querySelector('.container .navigation .navResponsive .searchbar input').value = ""
})

// search bar tabs
async function fillSearchTabs() {
    const tabWrapper = document.querySelector(".container .navigation .navResponsive .settingsTabWrapper")
    tabWrapper.innerHTML = ""
    
    let dbData = await getDBData()
    let tags = []
    dbData.Puzzles.forEach(puzzle => {
        let localTags = JSON.parse(puzzle.Tags)
        localTags.forEach(tag => tags.push(tag))
    });
    function removeDuplicates(array) {
        return [...new Set(array)];
    }
    
    tags = removeDuplicates(tags)

    tabWrapper.innerHTML += `<div class="tab active">all</div>`
    tags.forEach(tag => {
        tabWrapper.innerHTML += `<div class="tab active">${tag}</div>`
    })
    console.log(tags);

}

fillSearchTabs().then(() => {
    const tabs = document.querySelectorAll('.container .navigation .navResponsive .settingsTabWrapper .tab'),
    puzzlesWrapper = document.querySelector('.container .main .mainResponsive')

    fillPuzzles().then(() => {
        tabs.forEach(tab => {
            if (tab.innerHTML == "all") {
                tab.addEventListener("click", () => {
                    tabs.forEach(tab => {
                        tab.click()
                    })
                })
                return
            }
            
            let active = true
    
            tab.addEventListener("click", () => {
                active = !active
        
                if (active) {
                    tab.classList.add("active")
    
                    const puzzles = puzzlesWrapper.querySelectorAll(`.puzzle.${tab.innerHTML}`)
                    puzzles.forEach(element => {
                        element.classList.add("active")
                    });
                } else {
                    tab.classList.remove("active")
                    
                    const puzzles = puzzlesWrapper.querySelectorAll(`.puzzle.${tab.innerHTML}`)
                    puzzles.forEach(element => {
                        element.classList.remove("active")
                    });
                }
    
                const visiblePuzzles = [...puzzlesWrapper.children].filter(child => {
                    if (child.classList.contains("puzzle")) return child
                    else return
                }).filter(child => 
                    getComputedStyle(child).display !== "none"
                );
    
    
                console.log(document.querySelector('.container .main .mainResponsive .noPuzzlesWithCurrentFilters'));
    
    
                noPuzzlesWithCurrentFilters = document.querySelector('.container .main .mainResponsive .noPuzzlesWithCurrentFilters')
                if (visiblePuzzles.length === 0) {
                    noPuzzlesWithCurrentFilters.classList.add("active")
                } else {
                    noPuzzlesWithCurrentFilters.classList.remove("active")
                }
            })
        })
    })
})
