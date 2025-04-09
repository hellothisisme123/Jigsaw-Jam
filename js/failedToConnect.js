console.log(navigator.userAgent);
if (navigator.userAgent.includes("OPR")) { // opera
    document.querySelector('.container .failedToLoad li:nth-child(2)').innerHTML = "Click on \"Help me understand\""
} else if (navigator.userAgent.includes("Firefox")) { // firefox
    document.querySelector('.container .failedToLoad li:nth-child(3)').innerHTML = "Click on \"Accept the Risk and Continue\""
    document.querySelector('.container .failedToLoad li:nth-child(2)').innerHTML = "Click on \"Advanced...\""
}

async function checkDBConnection() {
    let dbConnCheck
    try {
        let red = await getDBData()
        if (red.length != 0) {
            console.log(red);
            dbConnCheck = "-------Database Connected-------"
        }
    } catch (error) {
        dbConnCheck = "---Database Connection Failed---"
        console.error(error);
    } finally {
        if (dbConnCheck == "-------Database Connected-------") {
            window.location = "index.html"
        }
        console.log(dbConnCheck);
    }
}

// setInterval(checkDBConnection, 1500);