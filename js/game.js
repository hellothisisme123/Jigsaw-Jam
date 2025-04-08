
// get id from url
const urlParams = new URLSearchParams(window.location.search);

// global variable
const id = urlParams.get('id');
const tableCols = 4;
const tableRows = 2;

// log puzzle data
(async () => {
    console.log(await getPuzzleDataUser(id))
    console.log(await getPuzzleDataPuzzle(id))
})()










// size puzzle grid
const grid = document.querySelector('.container .board .grid');
const gridBgImg = document.querySelector('.container .board .grid .bg img');

gridBgImg.addEventListener('load', () => {
    // Set the grid size to match the background image
    grid.style.width = `${gridBgImg.naturalWidth}px`;
    grid.style.height = `${gridBgImg.naturalHeight}px`;
});





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

function centerOnNode(nodeClass) {
    const node = document.querySelector(`.node.${nodeClass}`);
    const rect = node.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    
    const centerX = wrapperRect.width / 2;
    const centerY = wrapperRect.height / 2;
    
    // Node position relative to canvas (not viewport)
    const nodeX = node.offsetLeft;
    const nodeY = node.offsetTop;
    
    translate.x = centerX - nodeX * scale - (node.offsetWidth * scale) / 2;
    translate.y = centerY - nodeY * scale - (node.offsetHeight * scale) / 2;
    
    updateTransform();
}

// Initial center on the node
window.addEventListener('load', () => {
    centerOnNode('grid');
});

// Zoom with Ctrl+scroll
wrapper.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();

    const zoomIntensity = 0.001;
    let newScale = scale * (1 - e.deltaY * zoomIntensity);

    // Clamp the newScale before doing any math
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

// Drag to pan
wrapper.addEventListener('mousedown', (e) => {
    isPanning = true;
    start = { x: e.clientX, y: e.clientY };
    wrapper.style.cursor = 'grabbing';
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




















const pieces = document.querySelectorAll('.table .piece');
const leftBtn = document.querySelector('.container .table .leftBtn');
const rightBtn = document.querySelector('.container .table .rightBtn');
let currentTablePage = 0;

function renderPage(page) {
    // Hide all pieces
    pieces.forEach(piece => piece.style.display = 'none');

    // Calculate start and end index
    const start = page * (tableRows * tableCols);
    const end = start + (tableRows * tableCols);

    // Show the current page's pieces
    for (let i = start; i < end && i < pieces.length; i++) {
        pieces[i].style.display = 'flex';
    }

    // // Optionally disable buttons at ends
    // leftBtn.style.visibility = (page === 0) ? 'hidden' : 'visible';
    // rightBtn.style.visibility = (end >= pieces.length) ? 'hidden' : 'visible';
}

leftBtn.addEventListener('click', () => {
    const maxPage = Math.floor((pieces.length - 1) / (tableRows * tableCols));
    if (currentTablePage > 0) {
        currentTablePage--;
        renderPage(currentTablePage);
    } else {
        currentTablePage = maxPage
        renderPage(currentTablePage);
    }
});

rightBtn.addEventListener('click', () => {
    const maxPage = Math.floor((pieces.length - 1) / (tableRows * tableCols));
    if (currentTablePage < maxPage) {
        currentTablePage++;
        renderPage(currentTablePage);
    } else {
        currentTablePage = 0;
        renderPage(currentTablePage);
    }
});

// Initial render
renderPage(currentTablePage);