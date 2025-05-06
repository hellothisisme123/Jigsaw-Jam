// --- Global Variables ---
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const tableCols = 4;
const tableRows = 2;
const puzzleMaxWidth = 0.8;
const puzzleMaxHeight = 0.8;

async function sizeChange(newValue, id) {
    const puzzleDataUser = await getPuzzleDataUser(id)
    const puzzleDataPuzzle = await getPuzzleDataPuzzle(id)
    const select = document.querySelector(".container .sizePopup .select")
    const oldValue = select.dataset.value
    console.log(oldValue, newValue);
    
    // console.log(puzzleDataUser.completionData.length);
    if (oldValue == newValue) {
        select.classList.toggle("selected")
    } else {
        uploadNewPuzzleToDB()

        // userDataChange(id, (newUserData, puzzleDataPuzzle) => {
        //     return newUserData.filter(data => {
        //         if (data.id == id) {
        //             // console.log(document.querySelector(".focusPuzzlePopup .select"));
        //             data.width = parseInt(JSON.parse(puzzleDataPuzzle.Sizes)[newValue].split("x")[0])
        //             data.height = parseInt(JSON.parse(puzzleDataPuzzle.Sizes)[newValue].split("x")[1])
        //         }
        //         return data
        //     })
        // })
        
        select.classList.toggle("selected")
    }
}

async function toggleSizeDropdown(id) {
    const select = document.querySelector(".container .sizePopup .select")
    select.classList.toggle("selected")
    console.log(select);
}

async function uploadNewPuzzleToDB() {
    let newUserData = JSON.parse((await getUserData()).SaveData)
    if (!newUserData) newUserData = []
    const puzzleData_Puzzles = await getPuzzleDataPuzzle(id)
    const puzzleData_Users = await getPuzzleDataUser(id)

    // adds new puzzle data
    newUserData.push({
        "id": id,
        "width": parseInt(JSON.parse(puzzleData_Puzzles.Sizes)[document.querySelector(".alertPopup .select").dataset.value].split("x")[0]),
        "height": parseInt(JSON.parse(puzzleData_Puzzles.Sizes)[document.querySelector(".alertPopup .select").dataset.value].split("x")[1]),
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
        })
    }); 
}

(async () => {
    try {
        // --- Log Puzzle Data ---
        let puzzleDataUser = await getPuzzleDataUser(id)
        let puzzleDataPuzzle = await getPuzzleDataPuzzle(id)
        if (puzzleDataUser == undefined) {
            puzzleSize = await getSizePopup()
            puzzleDataUser = {
                "id": id,
                "width": puzzleSize[0],
                "height": puzzleSize[1],
                "saved": true,
                "completed": false,
                "completionData": []
            }
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

        // gets the size for the puzzle if the user doesn't have one saved already
        async function getSizePopup() {
            return new Promise((resolve) => {
                // Create and populate the alert popup
                const sizePopup = document.createElement("div");
                sizePopup.classList.add("sizePopup");
        
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
        
                const container = document.querySelector(".container");
                container.appendChild(sizePopup);
        
                const yesBtn = sizePopup.querySelector(".yes");
        
                // Event listener for the "Done" button
                yesBtn.addEventListener("click", () => {
                    const selectedSize = JSON.parse(puzzleDataPuzzle.Sizes)[sizePopup.querySelector("#boardMode").dataset.value].split("x");
                    console.log(selectedSize);
                    
                    sizePopup.remove();
                    resolve(selectedSize); // Resolves the promise with the selected size
                });
            });
        }

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
            console.log(puzzleData);
            let i = 0

            imageCells = imageCells.map(((x, i) => {
                return {
                    "image": x,
                    "i": i
                }
            }))

            // for (let i = 0; i < imageCells.length; i++) {
            //     imageCells[i] = {
            //         "image": imageCells[i],
            //         "i": i
            //     }
            // }

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
                console.log(cell);
                cell.appendChild(pieceEl)
            })

            // --- Canvas Zoom and Pan Setup ---
            const wrapper = document.querySelector('.board');
            const canvas = document.querySelector('.canvas');
    
            let scale = 0.25;
            let minZoom = 0.2;
            let maxZoom = 2.5;
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
                        console.log(piece.parentElement.dataset.index);
                        console.log(piece.dataset.index);
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
                        
                        renderPage(currentTablePage)
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
                            console.log("drag to table");
                            slot.appendChild(draggedPiece);
                            updatePuzzlePiece(id, draggedPiece.dataset.index, undefined)
                        }
                    });
                    
                    renderPage(currentTablePage)                        
                });

                async function updatePuzzlePiece(id, a, b) {
                    // gettings puzzle data
                    let newUserData = JSON.parse((await getUserData()).SaveData)
                    if (!newUserData) newUserData = []
                    const puzzleData_Users = await getPuzzleDataUser(id)
                
                    // apply changes
                    newUserData.forEach(data => {
                        if (data.id == id) {
                            console.log(data);

                            if (isNaN(b)) {
                                data.completionData = data.completionData.filter(x => x.ai !== a)
                            } else {
                                let found = false;

                                data.completionData.map(x => {
                                    if (x.ai === a) {
                                        x.bi = b;
                                        found = true;
                                    }
                                });

                                // If the element with ai = a does not exist, create it
                                if (!found) {
                                    data.completionData.push({ ai: a, bi: b });
                                }
                            }

                            console.log(data);
                        }
                    });

                    newUserData.map(x => x.timeAccessed = Date.now())
                
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
                        })
                    });
                }
            }
    
            setupDragAndDrop();
    
            // --- Pagination Logic ---
            const pieces = document.querySelectorAll('.piece');
            const pieceSlots = document.querySelectorAll('.pieceSlot');
            console.log(pieceSlots);
            const leftBtn = document.querySelector('.leftBtn');
            const rightBtn = document.querySelector('.rightBtn');
            let currentTablePage = 0;
    
            function renderPage(page) {
                let start = page * (tableRows * tableCols);
                let end = start + (tableRows * tableCols);
    
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
    
            leftBtn.addEventListener('click', () => {
                const maxPage = Math.floor((pieces.length - 1) / (tableRows * tableCols));
                currentTablePage = currentTablePage > 0 ? currentTablePage - 1 : maxPage;
                renderPage(currentTablePage);
            });
    
            rightBtn.addEventListener('click', () => {
                const maxPage = Math.floor((pieces.length - 1) / (tableRows * tableCols));
                currentTablePage = currentTablePage < maxPage ? currentTablePage + 1 : 0;
                renderPage(currentTablePage);
            });
    
            renderPage(currentTablePage);
            
        })

        

    } catch (error) {
        if (id == null) {
            window.location = "./index.html"
        }
        
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
})();
