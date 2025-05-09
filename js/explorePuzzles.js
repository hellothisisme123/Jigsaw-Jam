let puzzlesLoaded = false

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

async function fillPuzzles() {
    try {
        const data = await getDBData();
        const totalPuzzles = data.Puzzles.length;
        const batchSize = 10;
        const batches = [];
        const secondsBetweenShuffles = 300;
        const orderedPuzzles = seededShuffle(data.Puzzles, Math.floor(Date.now() / (1000 * secondsBetweenShuffles))) 
        
        for (let i = 0; i < totalPuzzles; i += batchSize) {
            batches.push(orderedPuzzles.slice(i, i + batchSize));
        }
        
        for (const batch of batches) {
            await processBatch(batch);
        }
        
        console.log("Loaded all puzzles!");
        observeLazyImages();
    } catch (error) {
        console.error('Error:', error);
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
    // console.log(puzzleData_Users);
    let puzzleData_Puzzles = await getPuzzleDataPuzzle(puzzle.ID);
    const html = `
        <div class="puzzle active ${getTags(puzzleData_Users, puzzleData_Puzzles, true)}" draggable="false" onclick="focusPuzzle(${puzzle.ID})" data-id="${puzzle.ID}">
            <div class="star">
                <img class="lazy" draggable="false" data-src="./production/images/${getStar(puzzleData_Users, false)}" alt="${getStar(puzzleData_Users, true)}">
            </div>
            <div class="background">
                <img class="lazy" draggable="false" data-src="./production/images/puzzle-images/${puzzle.Src}" alt="${puzzle.Alt}">
            </div>
            <div class="bookmark">
                <img class="lazy" draggable="false" data-src="./production/images/${getBookmark(puzzleData_Users, false)}" alt="${getBookmark(puzzleData_Users, true)}">
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

    tabWrapper.innerHTML += `<div class="tab">all</div>`
    tabWrapper.innerHTML += `<div class="tab">saved</div>`
    tabWrapper.innerHTML += `<div class="tab">unsaved</div>`
    tabWrapper.innerHTML += `<div class="tab">completed</div>`
    tabWrapper.innerHTML += `<div class="tab">uncompleted</div>`
    tags.forEach(tag => {
        tabWrapper.innerHTML += `<div class="tab">${tag}</div>`
    })
    console.log(tags);

}

fillSearchTabs().then(() => {
    const tabs = document.querySelectorAll('.container .navigation .navResponsive .settingsTabWrapper .tab')
    const puzzlesWrapper = document.querySelector('.container .main .mainResponsive')

    function updateNoPuzzlesMessageVisibility() {
        const visiblePuzzles = puzzlesWrapper.querySelectorAll(".puzzle.active");
        console.log(visiblePuzzles);

        noPuzzlesWithCurrentFilters = document.querySelector('.container .main .mainResponsive .noPuzzlesWithCurrentFilters')
        if (visiblePuzzles.length === 0) {
            noPuzzlesWithCurrentFilters.classList.add("active")
        } else {
            noPuzzlesWithCurrentFilters.classList.remove("active")
        }
    }
    
    function displayPuzzlesByFilter() {
        let query = ".puzzle"
        let activeTabs = [...tabs].filter(x => {
            if (x.classList.contains("active")) return x.innerHTML
        })
        activeTabs = activeTabs.map(x => x.innerHTML.trim())
        activeTabs.forEach(tab => query += `.${tab}`)
        console.log(query);

        const displayedPuzzles = [...puzzlesWrapper.querySelectorAll(query)]
        const allPuzzles = [...puzzlesWrapper.querySelectorAll(".puzzle")]
        const undisplayedPuzzles = allPuzzles.filter(p => !displayedPuzzles.includes(p));

        console.log(displayedPuzzles.length, undisplayedPuzzles.length, allPuzzles.length);

        displayedPuzzles.forEach(puzzle => {
            puzzle.classList.add("active")
        })

        undisplayedPuzzles.forEach(puzzle => {
            puzzle.classList.remove("active")
        })
    }
    
    tabs.forEach(tab => {
        if (tab.innerHTML.trim() == "all") {
            let allEnabled = true
            tab.addEventListener("click", () => {
                if (!puzzlesLoaded) {
                    alertPopup(
                        "Please wait",
                        "The puzzles have not loaded yet, you need to wait a few seconds for all puzzles to load in order to use filters.",
                        "Okay",
                        "Epic",
                        () => {},
                        () => {}
                    )
                    return;
                }

                allEnabled = !allEnabled
                tabs.forEach(tab => {
                    if (allEnabled) {
                        tab.classList.add("active")
                    } else {
                        tab.classList.remove("active")
                    }
                })
                displayPuzzlesByFilter()
                updateNoPuzzlesMessageVisibility()
            })

            return
        }
        
        tab.addEventListener("click", () => {
            if (!puzzlesLoaded) {
                alertPopup(
                    "Please wait",
                    "The puzzles have not loaded yet, you need to wait a few seconds for all puzzles to load in order to use filters.",
                    "Okay",
                    "Epic",
                    () => {},
                    () => {}
                )
                return;
            }

            tab.classList.toggle("active")
            
            displayPuzzlesByFilter()
            updateNoPuzzlesMessageVisibility()
        })
    })
    
    fillPuzzles().then(() => {
        puzzlesLoaded = true
        
    })
})
