// --- Global Variables ---
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const tableCols = 4;
const tableRows = 2;
const puzzleMaxWidth = 0.8;
const puzzleMaxHeight = 0.8;

(async () => {
    try {
        // --- Log Puzzle Data ---
        let puzzleDataUser = await getPuzzleDataUser(id)
        let puzzleDataPuzzle = await getPuzzleDataPuzzle(id)
        if (puzzleDataUser == undefined) {
            puzzleSize = await getSize()
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
        async function getSize() {
            return new Promise((resolve) => {
                // Create and populate the alert popup
                const alertPopup = document.createElement("div");
                alertPopup.classList.add("alertPopup");
        
                alertPopup.innerHTML = `
                    <div class="bgWrapper">
                        <div class="responsive">
                            <div class="title">You need to select a size</div>
                            <div class="imgWrapper">
                                <img src="./production/images/puzzle-images/${puzzleDataPuzzle.Src}" alt="${puzzleDataPuzzle.Alt}" >
                            </div>
                            <div class="horizontalWrapper">
                                <div class="dropdown wrapper">
                                    <select name="boardMode" id="boardMode">
                                        ${getSizeOptions(puzzleDataUser, puzzleDataPuzzle)}
                                    </select>
                                </div>
                                <div class="buttonWrapper">
                                    <div class="yes">Done</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        
                const container = document.querySelector(".container");
                container.appendChild(alertPopup);
        
                const yesBtn = alertPopup.querySelector(".yes");
        
                // Event listener for the "Done" button
                yesBtn.addEventListener("click", () => {
                    const selectedSize = JSON.parse(puzzleDataPuzzle.Sizes)[alertPopup.querySelector("#boardMode").value].split("x");
                    alertPopup.remove();
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
                res += `<option ${getSelected(size)} value="${i}">${parseInt(size[0])}x${parseInt(size[1])} - ${parseInt(size[0]) * parseInt(size[1])} Pieces</option>`
            })
        
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

        // --- Fill Table With Filled Cell Slots For Each Puzzle Piece
        function cutImageIntoCells(imageElement, rows, cols) {
            return new Promise((resolve, reject) => {
                const imageWidth = imageElement.naturalWidth;
                const imageHeight = imageElement.naturalHeight;
        
                // Calculate the width and height of each cell
                const cellWidth = Math.floor(imageWidth / cols);
                const cellHeight = Math.floor(imageHeight / rows);
        
                // Create a canvas element to draw the cut images
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
        
                const imageCells = [];
        
                // Loop through rows and columns to cut the image into cells
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        // Set the canvas size to match the cell
                        canvas.width = cellWidth;
                        canvas.height = cellHeight;
        
                        // Draw the current image section (cell) on the canvas
                        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing
                        ctx.drawImage(
                            imageElement, // Image element
                            col * cellWidth, // X position of the crop
                            row * cellHeight, // Y position of the crop
                            cellWidth, // Width of the crop
                            cellHeight, // Height of the crop
                            0, 0, cellWidth, cellHeight // Where to draw on the canvas
                        );
        
                        // Get the data URL for the cut image
                        const dataURL = canvas.toDataURL("image/png");
        
                        // Push the image src data to the array
                        imageCells.push(dataURL);
                    }
                }
        
                // Resolve the promise with the array of image src data
                resolve(imageCells);
            });
        }
        
        cutImageIntoCells(gridBgImg, puzzleData.height, puzzleData.width).then((imageCells) => {
            let i = 0
            console.log(puzzleData);
            console.log()

            seededShuffle(imageCells, puzzleData.id).forEach(cell => {
                i++
                let pieceSlot = document.createElement("div")
                pieceSlot.classList.add("pieceSlot")
                pieceSlot.dataset.index = i
                pieceSlot.innerHTML = `
                    <div class="piece" data-index="${i}">
                        <img src="${cell}">
                    </div>
                `

                document.querySelector(".container .table").appendChild(pieceSlot)
            })
            
            // wait for puzzle background to load
            // await new Promise(resolve => {
            //     if (gridBgImg.complete) {
            //         resolve();
            //     } else {
            //         gridBgImg.addEventListener('load', resolve);
            //     }
            // });

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
                    console.log(e);
                    if (e.button == 1 || e.ctrlKey || e.altKey) {
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
                document.querySelectorAll('.piece').forEach(piece => {
                    piece.addEventListener('dragstart', (e) => {
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
    
                document.querySelectorAll('.cell').forEach(cell => {
                    cell.addEventListener('dragover', (e) => e.preventDefault());
                    cell.addEventListener('drop', () => {
                        if (draggedPiece && cell.children.length === 0) {
                            cell.appendChild(draggedPiece);
                        }
                    });
                });
    

                
                
                document.querySelector('.table').addEventListener('dragover', (e) => e.preventDefault());
                document.querySelector('.table').addEventListener('drop', () => {
                    document.querySelectorAll('.pieceSlot').forEach(slot => {
                        if (
                            draggedPiece &&
                            slot.getAttribute('data-index') === draggedPiece.getAttribute('data-index') &&
                            !slot.querySelector('.piece')
                        ) {
                            slot.appendChild(draggedPiece);
                        }    
                    });

                });

                document.querySelectorAll('.pieceSlot').forEach(slot => {
                    slot.addEventListener('dragover', (e) => e.preventDefault());
                    slot.addEventListener('drop', () => {
                        if (
                            draggedPiece &&
                            slot.getAttribute('data-index') === draggedPiece.getAttribute('data-index') &&
                            !slot.querySelector('.piece')
                        ) {
                            slot.appendChild(draggedPiece);
                        }
                    });
                });
            }
    
            setupDragAndDrop();
    
            // --- Pagination Logic ---
            const pieces = document.querySelectorAll('.piece');
            const pieceSlots = document.querySelectorAll('.pieceSlot');
            const leftBtn = document.querySelector('.leftBtn');
            const rightBtn = document.querySelector('.rightBtn');
            let currentTablePage = 0;
    
            function renderPage(page) {
                const start = page * (tableRows * tableCols);
                const end = start + (tableRows * tableCols);
    
                pieceSlots.forEach(slot => {
                    if (parseInt(slot.dataset.index) > start && parseInt(slot.dataset.index) <= end) {
                        slot.style.display = "flex"
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
