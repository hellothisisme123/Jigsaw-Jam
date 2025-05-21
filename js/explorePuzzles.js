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
            if (puzz.completionData?.length < 1) {
                return "hollow star icon"
            }
            if (!puzz.completionData) {
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
            if (puzz.completionData?.length < 1) {
                return "star-regular.svg"
            }
            if (!puzz.completionData) {
                return "star-regular.svg"
            }
            return "star-half-stroke-regular.svg"
        }
    }
}

function getBookmark(puzz, alt) {
    // returns the value accordingly
    if (alt) {
        if (puzz?.saved) {
            return "solid bookmark icon"
        } else {
            return "hollow bookmark icon"
        }
    } else {
        if (puzz?.saved) {
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
        let orderedPuzzles = seededShuffle(data.Puzzles, Math.floor(Date.now() / (1000 * secondsBetweenShuffles))) 
        console.log(orderedPuzzles);

        let userSavedData = await getUserData()
        userSavedData = JSON.parse(userSavedData.SaveData);
        console.log(userSavedData);

        userSavedData.forEach(puzzleData => {
            orderedPuzzles = orderedPuzzles.map(x => {
                if (x.ID == puzzleData.id) {
                    return { ...x, ...puzzleData }
                } else return x
            })
        })
        
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

function getTagsExplore(puzz, list) {
    if (!list) {
        let res = ""
        let tags = JSON.parse(puzz.Tags)
        if (puzz.completionData && puzz.saved) res += `<div class="tag active">Saved</div>`
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

        if (puzz.completionData) {
            if (puzz.saved) {
                res += " saved"
            }

            if (!puzz.saved) {
                res += " unsaved"
            }

            if (puzz.completed) {
                res += " completed"
            }

            if (!puzz.completed) {
                res += " uncompleted"
            }

            if (!puzz.completed && puzz.completionData.length > 0) {
                res += " unfinished"
            }
        } else {
            res += " uncompleted"
            res += " unsaved"
        }

        return res.trim()
    }
}

async function asyncTask(puzzle, index) {
    const html = `
        <div class="puzzle active ${getTagsExplore(puzzle, true)}" draggable="false" onclick="focusPuzzle(${puzzle.ID})" data-id="${puzzle.ID}">
            <div class="star">
                <img class="lazy" draggable="false" data-src="./production/images/${getStar(puzzle, false)}" alt="${getStar(puzzle, true)}">
            </div>
            <div class="background">
                <img class="lazy" draggable="false" data-src="./production/images/puzzle-images/${puzzle.Src}" alt="${puzzle.Alt}">
            </div>
            <div class="bookmark">
                <img class="lazy" draggable="false" data-src="./production/images/${getBookmark(puzzle, false)}" alt="${getBookmark(puzzle, true)}">
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
    tabWrapper.innerHTML += `<div class="tab">unfinished</div>`
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

