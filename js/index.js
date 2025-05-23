// explore all puzzles button
document.querySelector('.container .exploreAllPuzzles .img').addEventListener('click', (e) => {
    window.location = "./explorePuzzles.html"
});

// gets recent puzzle save data
async function getRecentPuzzles() {
    const userSaveData = await getUserData()
    userSaveData.SaveData = JSON.parse(userSaveData.SaveData)

    function sortByTimeAccessed(arr) {
        return arr.sort((a, b) => b.timeAccessed - a.timeAccessed);
    }
    let recentPuzzles = sortByTimeAccessed(userSaveData.SaveData)

    return recentPuzzles
}

// fill puzzling button section
async function setupMostRecentPuzzle() {
    const recentPuzzles = await getRecentPuzzles()
    const recentPuzzleImg = document.querySelector(".container .mostRecentPuzzle .puzzle img")
    const keepPuzzlingBtn = document.querySelector(".container .mostRecentPuzzle .keepPuzzlingBtn ")
    const completionPerc = document.querySelector(".container .mostRecentPuzzle .completionLevel .percentage")
    
    console.log(recentPuzzles);
    if (recentPuzzles.length > 0) {
        let mostRecentPuzzle = await getPuzzleDataPuzzle(recentPuzzles[0].id)
        if (mostRecentPuzzle) {
            keepPuzzlingBtn.href = `./game.html?id=${mostRecentPuzzle.ID}`
            recentPuzzleImg.src = `./production/images/puzzle-images/${mostRecentPuzzle.Src}`
        }
        console.log(`${Math.round(recentPuzzles[0].completionData.length / (recentPuzzles[0].height * recentPuzzles[0].width) * 100)}%`);
        completionPerc.innerHTML = `${Math.round(recentPuzzles[0].completionData.length / (recentPuzzles[0].height * recentPuzzles[0].width) * 100)}%`
    } else {
        const recentPuzzleWrapper = document.querySelector(".container .mostRecentPuzzle")
        recentPuzzleWrapper.innerHTML = ""
    }
}
setupMostRecentPuzzle().then(() => 
    createSidescrollers())

async function createSidescrollers() {
    const quickPuzzles = document.querySelector(".container .quickPuzzles")
    let saveData = await getUserData()
    saveData = JSON.parse(saveData.SaveData) 

    async function getTopTags(saveData, topN = 5) {
        const tagCounts = {};
    
        // count tags from user data if it exists and database data if it doesnt
        let puzzleDataList
        if (saveData.length > 0) {
            // Wait for all puzzle data to be fetched
            puzzleDataList = await Promise.all(
                saveData.map(puzzle => getPuzzleDataPuzzle(puzzle.id))
            );
            // puzzleDataList = puzzleDataList.filter(x => x != undefined)
        } else {
            return ["animals","art","food","nature","people"].map((x, i) => {
                return {"tag": x, "count": i}
            })
        }
    
        // Count tags from each puzzle
        console.log(puzzleDataList);
        puzzleDataList.forEach(puzzleData => {
            const tags = JSON.parse(puzzleData.Tags); // assuming Tags is a JSON string array
    
            tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
    
        // Convert to array and sort by count descending
        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1]) // sort by count, descending
            .slice(0, topN) // take top N
    
        // Format: [{ tag: "cat", count: 12 }, ...]
        return sortedTags.map(([tag, count]) => ({ tag, count }));
    }

    topTags = await getTopTags(saveData)
    // topTags = seededShuffle(topTags, saveData.id)

    if (saveData.length > 0) {
        // make the recent puzzles sidescroller appear first
        const recentSidescroller = document.querySelector(".container .quickPuzzles .recent .sidescroll")
        const recentPuzzles = await getRecentPuzzles()
        setupLazyPuzzleLoader(recentSidescroller, recentPuzzles, false)
    } else {
        const recentSidescroller = document.querySelector(".container .quickPuzzles .recent")
        recentSidescroller.remove(true)
        alertPopup(
            "Welcome to Jigsaw Jam!",
            "This is your home screen. You have no saved puzzles. When you save some puzzles they will be shown here, along with new puzzles we think you might like.",
            "Okay",
            "Epic",
            () => {console.log("yes")},
            () => {console.log("no")}
        )
        
        // recentSidescroller.innerHTML = ""
    }
    
    // create the rest of the sidescrollers
    topTags.forEach(async tag => {
        let html = document.createElement("div")
        html.classList.add("shelf")
        html.classList.add(tag.tag)
        html.innerHTML = `<div class="title">${capitalizeFirstLetter(tag.tag)} Puzzles</div>`

        let sidescroll = document.createElement("div")
        sidescroll.classList.add("sidescroll")
        html.appendChild(sidescroll)
        quickPuzzles.appendChild(html)

        let puzzles = await getDBData()
        // console.log(puzzles);

        // Now filter the puzzles that include the specific tag
        let puzzlesWithTag = puzzles.Puzzles.filter(puzzle => {
            return JSON.parse(puzzle.Tags).includes(tag.tag)
        })
        // console.log(puzzlesWithTag);

        // setupLazyPuzzleLoader reads .id, but puzzlesWithTag has .ID
        puzzlesWithTag.map(async x => {
            x.id = x.ID
            return x
        })
        setupLazyPuzzleLoader(sidescroll, puzzlesWithTag, true)
    })
}

function setupLazyPuzzleLoader(wrapperEl, puzzlesData, randomOrder) {
    const BUFFER_PX = 300; // load puzzles this many pixels before they enter view
    const totalPuzzles = puzzlesData.length;
    let puzzleElements = [];

    wrapperEl.innerHTML = '';

    let isDragging = false;
    let hasDragged = false;
    let startX = 0;
    let scrollLeft = 0;
    let dragThreshold = 5; // minimum pixels to consider it a drag

    function onDragStart(e) {
        isDragging = true;
        hasDragged = false;
        startX = (e.touches ? e.touches[0].pageX : e.pageX) - wrapperEl.offsetLeft;
        scrollLeft = wrapperEl.scrollLeft;

        e.preventDefault();
        e.stopPropagation();
    }

    function onDragMove(e) {
        if (!isDragging) return;

        const x = (e.touches ? e.touches[0].pageX : e.pageX) - wrapperEl.offsetLeft;
        const walk = x - startX;

        if (Math.abs(walk) > dragThreshold) {
            hasDragged = true;
        }

        wrapperEl.scrollLeft = scrollLeft - walk;
        e.preventDefault();
        e.stopPropagation();
    }

    function onDragEnd() {
        isDragging = false;
    }

    // Mouse events
    wrapperEl.addEventListener('mousedown', onDragStart);
    wrapperEl.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    // Touch events
    wrapperEl.addEventListener('touchstart', onDragStart, { passive: false });
    wrapperEl.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('touchend', onDragEnd);

    // Create placeholder puzzle divs in order
    for (let i = 0; i < totalPuzzles; i++) {
        const puzzle = document.createElement('div');
        puzzle.className = 'puzzle';
        puzzle.dataset.index = i;
        wrapperEl.appendChild(puzzle);
        puzzleElements.push(puzzle);
    }

    // every this many seconds the order of the puzzles will be shuffled
    const secondsBetweenShuffles = 300
    if (randomOrder) {
        puzzleElements = seededShuffle(puzzleElements, Math.floor(Date.now() / (1000 * secondsBetweenShuffles)))
    }

    // console.log(puzzleElements);

    async function renderVisible() {
        const wrapperRect = wrapperEl.getBoundingClientRect();

        for (let i = 0; i < totalPuzzles; i++) {
            const el = puzzleElements[i];
            const elRect = el.getBoundingClientRect();

            const isInBufferView = (
                elRect.right >= wrapperRect.left - BUFFER_PX &&
                elRect.left <= wrapperRect.right + BUFFER_PX
            );

            if (isInBufferView) {
                if (!el.dataset.loaded) {
                    try {
                        // const puzzleData = await getPuzzleDataPuzzle(puzzlesData[i].id);
                        // console.log(puzzlesData[i]);
                        const puzzleDataPuzzles = await getPuzzleDataPuzzle(puzzlesData[i].id)
                        const puzzleDataUsers = await getPuzzleDataUser(puzzlesData[i].id)
                        // puzzleDataUsers.
        
                        el.innerHTML = `
                            <div class="star">
                                <img src="./production/images/${getStar(puzzleDataUsers, false)}" alt="${getStar(puzzleDataUsers, true)}">
                            </div>
                            <div class="background">
                                <img src="./production/images/puzzle-images/${puzzleDataPuzzles.Src}" draggable="false" alt="${puzzleDataPuzzles.Alt}">
                            </div>
                            <div class="bookmark">
                                <img src="./production/images/${getBookmark(puzzleDataUsers, false)}" alt="${getBookmark(puzzleDataUsers, true)}">
                            </div>
                        `;
                        function handlePuzzleClick(e) {
                            if (hasDragged) {
                                hasDragged = false;
                                return;
                            }
                            focusPuzzle(puzzlesData[i].id);
                        }
                        // Attach both for cross-device support
                        el.addEventListener("click", handlePuzzleClick);
                        el.addEventListener("touchend", handlePuzzleClick, { passive: true });
                        
                        el.dataset.id = puzzlesData[i].id
                        el.dataset.loaded = 'true';
                    } catch (err) {
                        console.error('Failed to load puzzle data for index', i, err);
                    }
                }
            }
        }
    }

    // Initial render
    renderVisible();

    // Debounced scroll handler
    let scrollTimeout;
    wrapperEl.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(renderVisible, 50);
    });

    // Optional: recheck on window resize
    window.addEventListener('resize', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(renderVisible, 50);
    });
}

async function refreshLazyPuzzleWrapper(wrapperEl, newPuzzlesData) {
    const existingElsMap = new Map();
    const newIds = new Set(newPuzzlesData.map(p => p.id));

    // Index existing elements by their data-id
    for (const child of wrapperEl.children) {
        if (child.dataset.id) {
            existingElsMap.set(child.dataset.id, child);
        }
    }

    const newElements = [];

    for (let i = 0; i < newPuzzlesData.length; i++) {
        const puzzleData = newPuzzlesData[i];
        let el = existingElsMap.get(puzzleData.id);

        const puzzleDataPuzzles = await getPuzzleDataPuzzle(puzzleData.id);
        const puzzleDataUsers = await getPuzzleDataUser(puzzleData.id);

        if (!el) {
            // Create new element
            el = document.createElement('div');
            el.className = 'puzzle';
            el.dataset.id = puzzleData.id;

            el.onclick = () => focusPuzzle(puzzleData.id);
            el.dataset.loaded = 'true'; // Since we're filling it now

            el.innerHTML = `
                <div class="star">
                    <img src="./production/images/${getStar(puzzleDataUsers, false)}" alt="${getStar(puzzleDataUsers, true)}">
                </div>
                <div class="background">
                    <img src="./production/images/puzzle-images/${puzzleDataPuzzles.Src}" alt="${puzzleDataPuzzles.Alt}">
                </div>
                <div class="bookmark">
                    <img src="./production/images/${getBookmark(puzzleDataUsers, false)}" alt="${getBookmark(puzzleDataUsers, true)}">
                </div>
            `;
        } else {
            // Update only if visuals have changed
            const starImg = el.querySelector('.star img');
            const bookmarkImg = el.querySelector('.bookmark img');
            const backgroundImg = el.querySelector('.background img');

            const newStarSrc = `./production/images/${getStar(puzzleDataUsers, false)}`;
            const newStarAlt = getStar(puzzleDataUsers, true);
            const newBookmarkSrc = `./production/images/${getBookmark(puzzleDataUsers, false)}`;
            const newBookmarkAlt = getBookmark(puzzleDataUsers, true);
            const newBackgroundSrc = `./production/images/puzzle-images/${puzzleDataPuzzles.Src}`;
            const newBackgroundAlt = puzzleDataPuzzles.Alt;

            if (starImg?.src !== newStarSrc) starImg.src = newStarSrc;
            if (starImg?.alt !== newStarAlt) starImg.alt = newStarAlt;

            if (bookmarkImg?.src !== newBookmarkSrc) bookmarkImg.src = newBookmarkSrc;
            if (bookmarkImg?.alt !== newBookmarkAlt) bookmarkImg.alt = newBookmarkAlt;

            if (backgroundImg?.src !== newBackgroundSrc) backgroundImg.src = newBackgroundSrc;
            if (backgroundImg?.alt !== newBackgroundAlt) backgroundImg.alt = newBackgroundAlt;
        }

        newElements.push(el);
    }

    // Remove any elements no longer in the new data
    for (const [id, el] of existingElsMap.entries()) {
        if (!newIds.has(id)) {
            wrapperEl.removeChild(el);
        }
    }

    // Append in correct order (will move if needed)
    newElements.forEach(el => {
        wrapperEl.appendChild(el);
    });
}

// setTimeout(() => {
//     focusPuzzle(24)
// }, 5000);

