console.log(navigator.userAgent);
if (navigator.userAgent.includes("OPR")) { // opera
    document.querySelector('.container .failedToLoad li:nth-child(2)').innerHTML = "Click on \"Help me understand\""
} else if (navigator.userAgent.includes("Firefox")) { // firefox
    document.querySelector('.container .failedToLoad li:nth-child(3)').innerHTML = "Click on \"Accept the Risk and Continue\""
    document.querySelector('.container .failedToLoad li:nth-child(2)').innerHTML = "Click on \"Advanced...\""
}

async function checkDBConnection() {
    let red
    try {
        red = await getDBData()
    } catch (error) {
    }
    
    if (red) {
        window.location = "index.html"
    }
}

setInterval(checkDBConnection, 500);