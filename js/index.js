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

// keep puzzling button
console.log("red")
async function setupMostRecentPuzzle() {
    const recentPuzzles = await getRecentPuzzles()
    const recentPuzzleImg = document.querySelector(".container .mostRecentPuzzle .puzzle img")
    const keepPuzzlingBtn = document.querySelector(".container .mostRecentPuzzle .keepPuzzlingBtn ")
    const completionPerc = document.querySelector(".container .mostRecentPuzzle .completionLevel .percentage")
    
    let mostRecentPuzzle = await getPuzzleDataPuzzle(recentPuzzles[0].id)

    // const timeInt = Date.now()
    // console.log(timeInt);
    // const recentPuzzleSrc = 
    keepPuzzlingBtn.href = `./game.html?id=${mostRecentPuzzle.ID}`
    recentPuzzleImg.src = `./production/images/puzzle-images/${mostRecentPuzzle.Src}`
    completionPerc.innerHTML = `${Math.floor(recentPuzzles[0].completionData.length / (recentPuzzles[0].width * recentPuzzles[0].height))}%`
}
setupMostRecentPuzzle().then(() => 
    createSidescrollers())

async function createSidescrollers() {
    const quickPuzzles = document.querySelector(".container .quickPuzzles")
    let saveData = await getUserData()
    saveData = JSON.parse(saveData.SaveData) 
    console.log(saveData);

    topTags = await getTopTags(saveData)
    console.log(topTags);

    // make the recent puzzles sidescroller appear first
    const recentSidescroller = document.querySelector(".container .quickPuzzles .recent .sidescroll")
    const recentPuzzles = await getRecentPuzzles()
    setupLazyPuzzleLoader(recentSidescroller, recentPuzzles)
    
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
        console.log(puzzles);

        // Now filter the puzzles that include the specific tag
        let puzzlesWithTag = puzzles.Puzzles.filter(puzzle => {
            return JSON.parse(puzzle.Tags).includes(tag.tag)
        })
        console.log(puzzlesWithTag);

        // setupLazyPuzzleLoader reads .id, but puzzlesWithTag has .ID
        puzzlesWithTag.map(async x => {
            x.id = x.ID
            return x
        })
        setupLazyPuzzleLoader(sidescroll, puzzlesWithTag)
    })

    async function getTopTags(saveData, topN = 3) {
        const tagCounts = {};
    
        // Wait for all puzzle data to be fetched
        const puzzleDataList = await Promise.all(
            saveData.map(puzzle => getPuzzleDataPuzzle(puzzle.id))
        );
    
        // Count tags from each puzzle
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
}

function setupLazyPuzzleLoader(wrapperEl, puzzlesData) {
    const BUFFER_PX = 300; // load puzzles this many pixels before they enter view
    const totalPuzzles = puzzlesData.length;
    const puzzleElements = [];

    wrapperEl.innerHTML = '';

    // Create placeholder puzzle divs in order
    for (let i = 0; i < totalPuzzles; i++) {
        const puzzle = document.createElement('div');
        puzzle.className = 'puzzle';
        puzzle.dataset.index = i;
        wrapperEl.appendChild(puzzle);
        puzzleElements.push(puzzle);
    }

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
                                <img src="./production/images/puzzle-images/${puzzleDataPuzzles.Src}" alt="${puzzleDataPuzzles.Alt}">
                            </div>
                            <div class="bookmark">
                                <img src="./production/images/${getBookmark(puzzleDataUsers, false)}" alt="${getBookmark(puzzleDataUsers, true)}">
                            </div>
                        `;
                        el.onclick = () => focusPuzzle(puzzlesData[i].id);
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

// setTimeout(() => {
//     focusPuzzle(24)
// }, 5000);

