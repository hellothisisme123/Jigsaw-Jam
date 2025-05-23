// --- Global Functions ---
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

// --- Global Variables ---
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const tableCols = 4;
const tableRows = 2;
const puzzleMaxWidth = 0.75;
const puzzleMaxHeight = 0.75;

const controllerWrapperMaxHeight = 0.125;

let currentTablePage = 0;
let animatingIncorrectPieces = false

// // temporary for debugging
// async function removeFinalPiece(...pieces) {
//     userDataChange(id, async (newUserData) => {
//         return newUserData.filter(data => {
//             if (data.id == id) {
//                 console.log("red");
//                 pieces.forEach(pieceI => {
//                     if (pieceI) {
//                         data.completionData = data.completionData.filter(x => {
//                             if (x.ai != pieceI) return x;
//                         });
//                     }
//                 });
//             }
//             return data;
//         });
//     }).then(async newPuzzleData => {
//         window.location.reload();
//     });
// }

// // remove later
// document.querySelector("body nav .title").onclick = () => {
//     removeFinalPiece(10)
// }

// // remove later
// document.querySelector("body nav .dividerBar").onclick = () => {
//     removeFinalPiece(10, 11)
// }

async function sizeChange(newValue, id) {
    const puzzleDataUser = await getPuzzleDataUser(id)
    const puzzleDataPuzzle = await getPuzzleDataPuzzle(id)
    const select = document.querySelector(".container .sizePopup .select")
    const oldValue = select.dataset.value
    
    select.dataset.value = newValue
    let sizes = JSON.parse(puzzleDataPuzzle.Sizes)
    let size = sizes[newValue].split("x")
    console.log(`set size to [${size[0]}x${size[1]}]`);
    select.querySelector('.selectedOption').innerHTML = `${parseInt(size[0])}x${parseInt(size[1])} - ${parseInt(size[0]) * parseInt(size[1])} Pieces`
    select.classList.toggle("selected")

    if (puzzleDataUser) {
        userDataChange(id, async (newUserData) => {
            let puzzleDataUsers = await getPuzzleDataUser(id)
            
            return newUserData.filter(data => {
                if (data.id == id) {
                    if (puzzleDataUsers) {
                        data.width = parseInt(size[0])
                        data.height = parseInt(size[1])
                    }
                }
                return data
            })
        }).then(async newPuzzleData => {
            console.log(newPuzzleData);
        })
    }
}

async function uploadNewPuzzleToDB(size) {
    let newUserData = JSON.parse((await getUserData()).SaveData)
    if (!newUserData) newUserData = []

    // adds new puzzle data
    newUserData.push({
        "id": parseInt(id),
        "width": parseInt(size[0]),
        "height": parseInt(size[1]),
        "saved": false,
        "completed": false,
        "timeAccessed": Date.now(),
        "completionData": []
    })
    
    // push to database
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
        }),
        signal: signal
    }); 
}

async function toggleSizeDropdown() {
    const select = document.querySelector(".container .sizePopup .select")
    select.classList.toggle("selected")
    console.log(select);
}

async function startGamePage() {
    try {
        // reset to initial state
        currentTablePage = 0
        document.querySelectorAll('.container .board .grid .cell').forEach(cell => cell.remove())
        document.querySelectorAll('.container .table .pieceSlot').forEach(slot => slot.remove())
        document.querySelector('.container').innerHTML = document.querySelector('.container').innerHTML
        // document.querySelector('.focusPuzzlePopup.win').remove()

        // range sliders
        const ranges = document.querySelectorAll(".container .slider.wrapper .range")
        console.log(ranges)
        ranges.forEach((child) => {
            const bounds = child.getBoundingClientRect()
            let obj = {
                mousex: 0,
                rangex1: bounds.left+3,
                rangex2: bounds.right-3,
                min: child.dataset.min,
                max: child.dataset.max,
                step: child.dataset.step, 
                value: child.dataset.value
            }
            mouseHeld = false

            child.addEventListener("mousemove", (e) => {
                if (!mouseHeld) return;

                // Translate mouseX relative to slider’s bounding box
                const rect = child.getBoundingClientRect();
                const mouseX = e.clientX - rect.left; // local X within the slider element

                // Calculate percentage based on relative position
                let rawPercentage = mouseX / rect.width;
                rawPercentage = Math.max(0, Math.min(1, rawPercentage)); // Clamp between 0 and 1

                // Map to slider range
                const valueRange = obj.max - obj.min;
                let value = obj.min + rawPercentage * valueRange;

                // Round to nearest step
                const round = (number, step) => Math.round(number / step) * step;
                value = round(value, obj.step);

                // Update visual and data attributes
                child.dataset.value = value;
                child.style.setProperty("--perc", `${(value - obj.min) / valueRange * 100}%`);
                document.querySelector('.canvas .grid .bg').style.opacity = `${child.dataset.value}`

            })
            child.setAttribute("style", `--perc: ${child.dataset.value}%;`)
            
            document.addEventListener("mouseup", (e) => {
                mouseHeld = false
            })

            child.addEventListener("mousedown", (e) => {
                mouseHeld = true
            })
        })
        
        // --- Log Puzzle Data ---
        let puzzleDataUser = await getPuzzleDataUser(id)
        let puzzleDataPuzzle = await getPuzzleDataPuzzle(id)
        if (puzzleDataUser == undefined || puzzleDataUser && puzzleDataUser.completionData.length < 1) {
            puzzleSize = await getSizePopup()
            console.log(puzzleDataUser);
            puzzleDataUser = {
                "id": id,
                "width": puzzleSize[0],
                "height": puzzleSize[1],
                "saved": (puzzleDataUser?.saved ?? false),
                "completed": (puzzleDataUser?.completed ?? false),
                "completionData": []
            }
            console.log(puzzleDataUser);
            
        }
        
        const puzzleData = {
            completed: puzzleDataUser.completed,
            completionData: puzzleDataUser.completionData,
            height: parseInt(puzzleDataUser.height),
            id: puzzleDataUser.id,
            saved: puzzleDataUser.saved,
            width: parseInt(puzzleDataUser.width),
            alt: puzzleDataPuzzle.Alt,
            sizes: JSON.parse(puzzleDataPuzzle.Sizes),
            src: puzzleDataPuzzle.Src,
            tags: JSON.parse(puzzleDataPuzzle.Tags),
        }
        console.log(puzzleData);

        // check win
        let win = await winCheck(puzzleData)
        console.log(win);
        if (win === true) {
            console.log("win")

            // win popup
            winPopup()
        }
        
        // gets the size for the puzzle if the user doesn't have one saved already
        async function getSizePopup() {
            // gets the options for sizes as html stored in a string
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

            return new Promise((resolve) => {
                console.log("red")
                // Create and populate the alert popup
                const sizePopup = document.createElement("div");
                sizePopup.classList.add("sizePopup");
                console.log(sizePopup);
        
                sizePopup.innerHTML = `
                    <div class="bgWrapper">
                        <div class="responsive">
                            <div class="title">You need to select a size</div>
                            <div class="imgWrapper">
                                <img src="./production/images/puzzle-images/${puzzleDataPuzzle.Src}" alt="${puzzleDataPuzzle.Alt}" >
                            </div>
                            <div class="horizontalWrapper">
                                <div class="dropdown wrapper">
                                    <div class="select" data-value="${getSelectedValue(puzzleDataUser, puzzleDataPuzzle)}" name="boardMode" id="boardMode">
                                        ${getSelectedDropdownOption(puzzleDataUser, puzzleDataPuzzle)}
                                        <div class="options">
                                            ${getSizeOptions(puzzleDataUser, puzzleDataPuzzle)}
                                        </div>
                                    </div>
                                    <div class="dropdownArrow">
                                        <img src="./production/images/chevron-down-solid.svg" alt="down facing arrow">
                                    </div>
                                </div>
                                <div class="buttonWrapper">
                                    <div class="yes">Done</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        
                const container = document.querySelector(".container .responsive");
                container.appendChild(sizePopup);
        
                const yesBtn = sizePopup.querySelector(".yes");
        
                // Event listener for the "Done" button
                yesBtn.addEventListener("click", () => {
                    const selectedSize = JSON.parse(puzzleDataPuzzle.Sizes)[sizePopup.querySelector("#boardMode").dataset.value].split("x");

                    if (puzzleDataUser) {

                    } else {
                        // uploadNewPuzzleToDB(selectedSize)
                    }
                    
                    sizePopup.remove();
                    resolve(selectedSize); // Resolves the promise with the selected size
                });
            });
        }

        // --- Set Grid Size to Match Background Image ---
        const grid = document.querySelector('.container .board .grid');
        const gridBgImg = document.querySelector('.container .board .grid .bg img');
        gridBgImg.src = `./production/images/puzzle-images/${puzzleData.src}`

        // --- Fill Grid With Cells Accordingly to puzzleData
        for (let i = 0; i < (puzzleData.width * puzzleData.height); i++) {
            let newCell = document.createElement('div')
            newCell.classList.add("cell")
            newCell.dataset.index = i
            grid.appendChild(newCell)
        }
        document.querySelector(".container").style.setProperty("--gridRows", puzzleData.height)
        document.querySelector(".container").style.setProperty("--gridCols", puzzleData.width)

        // wait for puzzle background to load
        await new Promise(resolve => {
            if (gridBgImg.complete) {
                resolve();
            } else {
                gridBgImg.addEventListener('load', resolve);
            }
        });

        // set grid to size
        grid.style.width = `${gridBgImg.naturalWidth}px`;
        grid.style.height = `${gridBgImg.naturalHeight}px`;

        // --- Fill Table With Cell Slots For Each Puzzle Piece
        function cutImageIntoCells(imageElement, rows, cols) {
            return new Promise((resolve, reject) => {
                const imageWidth = imageElement.naturalWidth;
                const imageHeight = imageElement.naturalHeight;
        
                const idealCellWidth = imageWidth / cols;
                const idealCellHeight = imageHeight / rows;
        
                const totalCells = rows * cols;
                const imageCells = new Array(totalCells);
                let completed = 0;
        
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const index = row * cols + col;
        
                        // Calculate exact crop position
                        const sx = Math.round(col * idealCellWidth);
                        const sy = Math.round(row * idealCellHeight);
        
                        // Determine width and height for this tile
                        const ex = Math.round((col + 1) * idealCellWidth);
                        const ey = Math.round((row + 1) * idealCellHeight);
        
                        const sw = ex - sx;
                        const sh = ey - sy;
        
                        // Create canvas for this tile
                        const canvas = document.createElement("canvas");
                        canvas.width = sw;
                        canvas.height = sh;
        
                        const ctx = canvas.getContext("2d", { alpha: true });
                        ctx.imageSmoothingEnabled = false;
        
                        // Draw exact region to the canvas
                        ctx.drawImage(
                            imageElement,
                            sx, sy, sw, sh,     // Source rect
                            0, 0, sw, sh        // Destination rect
                        );
        
                        // Convert canvas to Blob for better performance
                        canvas.toBlob(blob => {
                            if (blob) {
                                const objectURL = URL.createObjectURL(blob);
                                imageCells[index] = objectURL;
                                completed++;
        
                                if (completed === totalCells) {
                                    resolve(imageCells);
                                }
                            } else {
                                reject(new Error("Failed to convert canvas to Blob"));
                            }
                        }, "image/png");
                    }
                }
            });
        }
        
        cutImageIntoCells(gridBgImg, puzzleData.height, puzzleData.width).then((imageCells) => {
            // set percent
            document.querySelector(".headerWrapper .percentComplete").innerHTML = `${Math.round(puzzleData.completionData.length / (puzzleData.height * puzzleData.width / 100))}% Complete`
            
            // set bookmark
            const bookmark = document.querySelector(".headerWrapper .bookmark img")
            bookmark.src = `./production/images/${getBookmark(puzzleData, false)}`
            bookmark.alt = getBookmark(puzzleData, true)
            
            // set star
            const star = document.querySelector(".headerWrapper .star img")
            star.src = `./production/images/${getStar(puzzleData, false)}`
            star.alt = getStar(puzzleData, true)

            // show wrong pieces button
            document.querySelector('.controllerButtons .showIncorrectPieces').addEventListener("click", async () => {
                let win = await winCheck()
                
                if (win === true) {
                    winScreenPopup()
                }
                
                if (win !== true) {
                    animateIncorrectPieces(win)
                }
            })

            // clear wrong pieces button
            document.querySelector('.controllerButtons .clearIncorrectPieces').addEventListener("click", async () => {
                let win = await winCheck()
                
                if (win !== true) {
                    console.log(win);
                    userDataChange(id, async (newUserData) => {
                        return newUserData.map(data => {
                            if (data.id == id) {
                                data.completionData = data.completionData.filter(piece =>
                                    !win.some(wrong => wrong.ai === piece.ai && wrong.bi === piece.bi)
                                );
                            }
                            return data;
                        });
                    }).then((newPuzzleData) => {
                        win.forEach(piece => {
                            let pieceEl = document.querySelector(`.grid .cell[data-index="${piece.bi}"] .piece`)
                            let slotEl = document.querySelector(`.table .pieceSlot[data-piece-index="${pieceEl.dataset.index}"]`)
                            slotEl.appendChild(pieceEl)
                        })

                        if (!newPuzzleData) {
                            // set percent
                            document.querySelector(".headerWrapper .percentComplete").innerHTML = "0% Complete"
                            
                            // set star
                            const star = document.querySelector(".headerWrapper .star img")
                            star.alt = "hollow star icon"
                            star.src = "./production/images/star-regular.svg"
                            return
                        } else {
                            // set percent
                            document.querySelector(".headerWrapper .percentComplete").innerHTML = `${Math.round(newPuzzleData.completionData.length / (newPuzzleData.height * newPuzzleData.width / 100))}% Complete`
                            
                            // // set star
                            const star = document.querySelector(".headerWrapper .star img")
                            star.src = `./production/images/${getStar(newPuzzleData, false)}`
                            star.alt = getStar(newPuzzleData, true)
                        }
                    })
                    
                    win.forEach(piece => {
                        // userDataChange(id, async (newUserData) => {
                        //     return newUserData.filter(data => {
                        //         if (data.id == id) {
                        //             // move piece out of puzzle grid
                        //             data.completionData = data.completionData.filter(x => x.bi != piece.bi)
                        //         }
                        //         return data
                        //     })
                        // }).then(async newPuzzleData => {
                        //     if (!newPuzzleData) {
                        //         // set percent
                        //         document.querySelector(".headerWrapper .percentComplete").innerHTML = "0% Complete"
                                
                        //         // set star
                        //         const star = document.querySelector(".headerWrapper .star img")
                        //         star.alt = "hollow star icon"
                        //         star.src = "./production/images/star-regular.svg"
                        //         return
                        //     }
                        // })
                    })
                    renderPage()
                } 

                if (win.length == 0) {

                }
            })
            
            console.log(puzzleData);
            
            let i = 0
            imageCells = imageCells.map(((x, i) => {
                return {
                    "image": x,
                    "i": i
                }
            }))

            console.log(imageCells);

            seededShuffle(imageCells, puzzleData.id).forEach(cell => {
                i++
                let pieceSlot = document.createElement("div")
                pieceSlot.classList.add("pieceSlot")
                pieceSlot.dataset.index = i
                pieceSlot.dataset.pieceIndex = cell.i
                pieceSlot.innerHTML = `
                    <div class="piece" data-index="${cell.i}">
                        <img src="${cell.image}">
                    </div>
                `

                document.querySelector(".container .table").appendChild(pieceSlot)
            })

            // moves saved pieces from table to grid 
            console.log(puzzleDataUser);
            puzzleDataUser.completionData.forEach(piece => {
                let cell = document.querySelector(`.cell[data-index="${parseInt(piece.bi)}"]`)
                let pieceEl = document.querySelector(`.piece[data-index="${parseInt(piece.ai)}"]`)
                cell.appendChild(pieceEl)
            })

            // --- Canvas Zoom and Pan Setup ---
            const wrapper = document.querySelector('.board');
            const canvas = document.querySelector('.canvas');
    
            let scale = 0.25;
            let minZoom = 0.5; // proportional to the scale set in centerOnNode()
            let maxZoom = 0.2; // proportional to the scale set in centerOnNode()
            let translate = { x: 0, y: 0 };
            let isPanning = false;
            let start = { x: 0, y: 0 };
    
            function updateTransform() {
                canvas.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
            }
    
            async function centerOnNode(nodeClass) {
                const node = await document.querySelector(`.node.${nodeClass}`);
                const wrapperRect = wrapper.getBoundingClientRect();
                
                // Calculate desired max dimensions
                const maxWidth = wrapperRect.width * puzzleMaxWidth;
                const maxHeight = wrapperRect.height * puzzleMaxHeight;
                
                // Calculate scale based on width and height constraints
                const scaleX = maxWidth / node.offsetWidth;
                const scaleY = maxHeight / node.offsetHeight;
                
                // Use the smaller scale to make sure both constraints are satisfied
                scale = Math.min(scaleX, scaleY);
                
                // Center the node
                const nodeX = node.offsetLeft;
                const nodeY = node.offsetTop;
                const centerX = wrapperRect.width / 2;
                const centerY = wrapperRect.height / 2;
                
                translate.x = centerX - nodeX * scale - (node.offsetWidth * scale) / 2;
                translate.y = centerY - nodeY * scale - (node.offsetHeight * scale) / 2;
                minZoom = scale * minZoom   
                maxZoom = scale / maxZoom

                // size controllerWrapper accordingly
                const controllerWrapper = document.querySelector(".controllerButtons");
                controllerWrapper.style.width = `${gridBgImg.naturalWidth}px`
                controllerWrapper.style.top = `${16+gridBgImg.naturalHeight}px`
                controllerWrapper.style.setProperty("--localFontSizeMult", 0.7 / scale)
                controllerWrapper.style.display = "flex"
                
                updateTransform();
            }
            centerOnNode("grid");
    
            // --- Canvas Event Listeners ---
            wrapper.addEventListener('wheel', (e) => {
                e.preventDefault();
                const zoomIntensity = 0.001;
                let newScale = scale * (1 - e.deltaY * zoomIntensity);
                newScale = Math.min(Math.max(newScale, minZoom), maxZoom);
    
                const rect = wrapper.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                const dx = mouseX - translate.x;
                const dy = mouseY - translate.y;
    
                translate.x -= dx * (newScale / scale - 1);
                translate.y -= dy * (newScale / scale - 1);
    
                scale = newScale;
                updateTransform();
            }, { passive: false });

            // --- Touch Zoom and Pan Support ---
            let lastTouchDistance = null;
            let lastTouchMidpoint = null;
            let lastTouchTranslate = { ...translate };

            wrapper.addEventListener('touchstart', (e) => {
                if (e.target.classList.contains("range") || e.target.classList.contains("fill")) {
                    return
                }
                if (e.touches.length === 1) {
                    isPanning = true;
                    start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    wrapper.style.cursor = 'grabbing';
                } else if (e.touches.length === 2) {
                    isPanning = false;
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    lastTouchDistance = Math.hypot(dx, dy);
                    lastTouchMidpoint = {
                        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                    };
                    lastTouchTranslate = { ...translate };
                }
            });

            wrapper.addEventListener('touchmove', (e) => {
                if (e.touches.length === 1 && isPanning) {
                    const dx = e.touches[0].clientX - start.x;
                    const dy = e.touches[0].clientY - start.y;
                    translate.x += dx;
                    translate.y += dy;
                    start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    updateTransform();
                } else if (e.touches.length === 2) {
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    const currentDistance = Math.hypot(dx, dy);
                    const midpoint = {
                        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                    };

                    if (lastTouchDistance) {
                        const zoomFactor = currentDistance / lastTouchDistance;
                        let newScale = scale * zoomFactor;
                        newScale = Math.min(Math.max(newScale, minZoom), maxZoom);

                        const rect = wrapper.getBoundingClientRect();
                        const mx = midpoint.x - rect.left;
                        const my = midpoint.y - rect.top;
                        const dx = mx - lastTouchTranslate.x;
                        const dy = my - lastTouchTranslate.y;

                        translate.x = lastTouchTranslate.x - dx * (newScale / scale - 1);
                        translate.y = lastTouchTranslate.y - dy * (newScale / scale - 1);

                        scale = newScale;
                        updateTransform();
                    }

                    lastTouchDistance = currentDistance;
                }

                e.preventDefault();
            }, { passive: false });

            wrapper.addEventListener('touchend', () => {
                isPanning = false;
                lastTouchDistance = null;
                lastTouchMidpoint = null;
                wrapper.style.cursor = 'grab';
            });
    
            wrapper.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains("range") || e.target.classList.contains("fill")) {
                    return
                }
                if (!e.target.closest('.piece')) {
                    isPanning = true;
                    start = { x: e.clientX, y: e.clientY };
                    wrapper.style.cursor = 'grabbing';
                } else {
                    console.log(e.target.parentElement);
                    if (e.button == 1 || e.ctrlKey || e.altKey || e.target.parentElement.dataset.index == e.target.parentElement.parentElement.dataset.index) {
                        isPanning = true;
                        start = { x: e.clientX, y: e.clientY };
                        wrapper.style.cursor = 'grabbing';
                    }
                }
            });
    
            window.addEventListener('mousemove', (e) => {
                if (!isPanning) return;
                const dx = e.clientX - start.x;
                const dy = e.clientY - start.y;
                translate.x += dx;
                translate.y += dy;
                start = { x: e.clientX, y: e.clientY };
                updateTransform();
            });
    
            window.addEventListener('mouseup', () => {
                isPanning = false;
                wrapper.style.cursor = 'grab';
            });
    
            // --- Drag and Drop Logic ---
            let draggedPiece = null;
    
            function setupDragAndDrop() {
                
                // hide the piece on drag start
                document.querySelectorAll('.piece').forEach(piece => {
                    piece.addEventListener('dragstart', (e) => {
                        // only allow user to move pieces when pieces aren't animating
                        if (animatingIncorrectPieces) {
                            e.preventDefault()
                            return
                        }
                        
                        // console.log(piece.parentElement.dataset.index);
                        // console.log(piece.dataset.index);
                        if (piece.parentElement.classList.contains("cell")) {
                            if (piece.parentElement.dataset.index == piece.dataset.index) {
                                e.preventDefault()
                                return
                            }
                        }
                        
                        draggedPiece = piece;
                        setTimeout(() => {
                            piece.style.display = 'none';
                        }, 0);
                    });
    
                    piece.addEventListener('dragend', () => {
                        piece.style.display = 'flex';
                        draggedPiece = null;
                    });
                });
    
                // drag to grid cell
                document.querySelectorAll('.cell').forEach(cell => {
                    cell.addEventListener('dragover', (e) => e.preventDefault());
                    cell.addEventListener('drop', () => {
                        if (
                            draggedPiece &&
                            cell.children.length === 0// &&
                            //cell.dataset.index == draggedPiece.dataset.index
                        ) {
                            cell.appendChild(draggedPiece);
                            updatePuzzlePiece(id, draggedPiece.dataset.index, cell.dataset.index)
                        }
                        
                        renderPage()
                    });
                });                
                
                // drag to table
                document.querySelector('.table').addEventListener('dragover', (e) => e.preventDefault());
                document.querySelector('.table').addEventListener('drop', () => {
                    document.querySelectorAll('.pieceSlot').forEach(slot => {
                        if (
                            draggedPiece &&
                            slot.dataset.pieceIndex === draggedPiece.getAttribute('data-index')
                        ) {
                            // console.log("drag to table");
                            slot.appendChild(draggedPiece);
                            updatePuzzlePiece(id, draggedPiece.dataset.index, undefined)
                        }
                    });
                    
                    renderPage()                        
                });

                async function updatePuzzlePiece(id, a, b) {
                    // gettings puzzle data
                    let newUserData = JSON.parse((await getUserData()).SaveData)
                    if (!newUserData) newUserData = []
                
                    if (puzzleDataUser) {
                        userDataChange(id, async (newUserData) => {
                            // console.log(a, b);
                            return newUserData.filter(data => {
                                if (data.id == id) {
                                    // console.log(data);

                                    // move piece out of puzzle grid
                                    if (isNaN(b)) {
                                        data.completionData = data.completionData.filter(x => x.ai !== a)
                                    } else { // move piece into puzzle grid 
                                        let found = false;

                                        // move piece from one grid square to another
                                        data.completionData.map(x => {
                                            if (x.ai === a) {
                                                x.bi = b;
                                                found = true
                                            }
                                        });

                                        // if the piece isn't in the grid yet, add it
                                        if (!found) {
                                            data.completionData.push({ ai: a, bi: b });
                                        }
                                    }

                                }
                                return data
                            })
                        }).then(async newPuzzleData => {
                            if (!newPuzzleData) {
                                document.querySelector(".headerWrapper .percentComplete").innerHTML = '0% Complete'
                                return
                            }
                            
                            // set percent
                            document.querySelector(".headerWrapper .percentComplete").innerHTML = `${Math.round(newPuzzleData.completionData.length / (puzzleData.height * puzzleData.width / 100))}% Complete`
                            
                            // // set star
                            const star = document.querySelector(".headerWrapper .star img")
                            star.src = `./production/images/${getStar(puzzleData, false)}`
                            star.alt = getStar(puzzleData, true)
                            
                            // check win
                            console.log(newPuzzleData);
                            let win = await winCheck(newPuzzleData)
                            console.log(win);
                            if (win === true) {
                                console.log("win")
                                userDataChange(id, async (newUserData) => {
                                    return newUserData.filter(data => {
                                        if (data.id == id) {
                                            // move piece out of puzzle grid
                                            data.completed = true
                                        }
                                        return data
                                    })
                                }).then(async newPuzzleData => {
                                    // win popup
                                    winPopup()
                                })

                            } else {
                                console.log("lose")
                                console.log(puzzleData);
                                console.log(puzzleDataUser);
                                console.log(newPuzzleData.completionData);
                                if (newPuzzleData.completionData.length >= (puzzleData.width * puzzleData.height)) {
                                    animateIncorrectPieces(win)
                                }

                                
                            }
                            
                            
                        })
                    } 
                }
            }
    
            setupDragAndDrop();
    
            // --- Pagination Logic ---
            const pieces = document.querySelectorAll('.piece');
            const leftBtn = document.querySelector('.leftBtn');
            const rightBtn = document.querySelector('.rightBtn');
    
            leftBtn.addEventListener('click', () => {
                const maxPage = Math.floor((pieces.length - 1) / (tableRows * tableCols));
                currentTablePage = currentTablePage > 0 ? currentTablePage - 1 : maxPage;
                renderPage();
            });
    
            rightBtn.addEventListener('click', () => {
                const maxPage = Math.floor((pieces.length - 1) / (tableRows * tableCols));
                currentTablePage = currentTablePage < maxPage ? currentTablePage + 1 : 0;
                renderPage();
            });
    
            renderPage();
            
        })

        

    } catch (error) {
        if (id == null) {
            window.location = "./index.html"
        } else {
            document.querySelector(".container .board").innerHTML += `
                <div class='title'>
                    <p>The puzzle with id ${id} does not exist. Please find another puzzle with a valid id.</p>
                    <div class="horizontalWrapper">
                    <a href="./index.html">Home</a>
                        <a href="./explorePuzzles.html">Explore Puzzles</a>
                    </div>
                </div>
    
            `
            document.querySelector(".container .board .canvas").style.display = "none"
            document.querySelector(".container .board").style.setProperty("cursor", "unset")
    
            console.error("Error setting up puzzle canvas:", error);
            console.error("Error Code:", error.message);
        }
    }
}

startGamePage()

async function winCheck(puzzleData) {
    let failedPieces = [];
    if (!puzzleData) puzzleData = await getPuzzleDataUser(id)

    // Always check for mismatches and collect failed pieces
    for (let x of puzzleData.completionData) {
        if (x.ai !== x.bi) {
            failedPieces.push(x);
        }
    }

    // Check if win condition is met: full puzzle + no failed pieces
    let win = (
        puzzleData.completionData.length === (puzzleData.width * puzzleData.height) &&
        failedPieces.length === 0
    );

    return win ? true : failedPieces;
}

function animateIncorrectPieces(loop) {
    if (loop.length < 1) return
    animatingIncorrectPieces = true
    
    loop.forEach(piece => {
        const onFlash = {
            borderColor: 'var(--darkBrown)', 
            backgroundColor: 'var(--darkBrown)', 
            boxShadow: `
                0 0 4px 4px white inset
            `
        };
        
        const offFlash = {
            borderColor: 'var(--lightBrown)', 
            backgroundColor: 'var(--lightBrown)', 
            boxShadow: `
                0 0 4px 4px white inset
            `
        };
        
        const cell = document.querySelector(`.grid .cell[data-index="${piece.bi}"]`);
        
        // Create overlay div
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            boxSizing: 'border-box',
            boxShadow: '0 0 0 transparent',
            pointerEvents: 'none',
            zIndex: 9999 // Ensure it's on top of the content
        });
        
        // Append overlay to the cell
        cell.appendChild(overlay);
        
        // Animate using onFlash and offFlash
        overlay.animate([
            offFlash,
            onFlash,
            offFlash,
            onFlash,
            offFlash,
            onFlash,
            offFlash,
        ], {
            duration: 3000,  // Total animation duration
            easing: 'linear'
        }).onfinish = () => {
            overlay.remove(); // Clean up after animation
            animatingIncorrectPieces = false
        };
    })
}

function renderPage() {
    let start = currentTablePage * (tableRows * tableCols);
    let end = start + (tableRows * tableCols);

    const pieceSlots = document.querySelectorAll('.pieceSlot');
    pieceSlots.forEach(slot => {
        if (parseInt(slot.dataset.index) > start && parseInt(slot.dataset.index) <= end) {
            if (slot.childElementCount > 0) {
                slot.style.display = "flex"
            } else {
                slot.style.display = "none"
                end++
            }
        } else {
            slot.style.display = "none"
        }
    })
}

function getWinSize(userPuzz, puzz) {
    let sizes = JSON.parse(puzz.Sizes)
    let res

    sizes.forEach((size, i) => {
        size = size.split("x")
        if (userPuzz && userPuzz.width == size[0] && userPuzz.height == size[1]) {
            res = `<div class="selectedOption">${parseInt(size[0])}x${parseInt(size[1])} - ${parseInt(size[0]) * parseInt(size[1])} Pieces</div>`
        }
    })

    return res
}

async function winPopup() {
    // unFocusPuzzle()

    let focusedPuzzleUser = await getPuzzleDataUser(id)
    let focusedPuzzlePuzzle = await getPuzzleDataPuzzle(id)

    // brings up the focus puzzle section   
    let html = document.createElement("div")
    html.classList.add("focusPuzzlePopup", "win")
    html.dataset.id = focusedPuzzlePuzzle.ID
    // console.log(getSelectedValue(focusedPuzzleUser, focusedPuzzlePuzzle));
    html.innerHTML = `
        <div class="responsive">
            <div class="bookmark">
                <img src="./production/images/${getBookmark(focusedPuzzleUser, false)}" alt="${getBookmark(focusedPuzzleUser, true)}">
            </div>
            <div class="star">
                <img src="./production/images/${getStar(focusedPuzzleUser, false)}" alt="${getStar(focusedPuzzleUser, true)}">
            </div>
            <div class="percent">100% Complete</div>
            <div class="title">YOU WIN!!!</div>
            <div class="buttonWrapper">
                <div class="select">
                    ${getWinSize(focusedPuzzleUser, focusedPuzzlePuzzle)}
                </div>
                <div class="reset" onclick="clearPieces(${focusedPuzzlePuzzle.ID}, true)">
                    Restart Puzzle
                </div>
            </div>
            <div class="puzzle">
                <div class="background"><img src="./production/images/puzzle-images/${focusedPuzzlePuzzle.Src}" alt="${focusedPuzzlePuzzle.Alt}"></div>
            </div>
            <div class="openPuzzleButton" onclick="window.location = './index.html'">
                <div class="text">
                    Exit Puzzle
                </div>
                <div class="img">
                    <img src="./production/images/keep-puzzling-button.png" alt="Exit Puzzle Button">
                </div>
            </div>
        </div>
    `
    document.querySelector(".container").appendChild(html)
}


async function clearPieces(id, restartPuzzle = false) {
    console.log(id);
    
    alertPopup(
        "Are you Sure?",
        "You would like to clear all saved pieces on this puzzle. This will permanently remove all pieces from the save. The star marking your completion will stay filled. You can clear the star by resetting the puzzle from the home or explore puzzles screens. The process is non-reversible.",
        "Yes, Clear Pieces",
        "No, Cancel",
        () => {
            userDataChange(id, async (newUserData) => {
                return newUserData.filter(data => {
                    if (data.id == id) {
                        data.completionData = []
                    }
                    return data
                })
            }).then(async newUserData => {
                if (restartPuzzle) {
                    document.querySelector('.focusPuzzlePopup.win').remove()
                    startGamePage()
                }
            })
        },
        () => {
        }
    )
}