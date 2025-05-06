console.log(navigator.userAgent);
if (navigator.userAgent.includes("OPR")) { // opera
    document.querySelector('.container .failedToLoad li:nth-child(2)').innerHTML = "Click on \"Help me understand\""
} else if (navigator.userAgent.includes("Firefox")) { // firefox
    document.querySelector('.container .failedToLoad li:nth-child(3)').innerHTML = "Click on \"Accept the Risk and Continue\""
    document.querySelector('.container .failedToLoad li:nth-child(2)').innerHTML = "Click on \"Advanced...\""
}

async function checkDBConnection() {
    let dbConnCheck = "Unknown"; // Default value

    try {
        const response = await fetch('https://192.168.240.9:3006/jigsawJam/data')
        const data = await response.json()
        let red = await data
        console.log(red);
        if (red.length !== 0) {
            dbConnCheck = "-------Database Connected-------";
        } else {
            dbConnCheck = "-------Database Empty, But Connected-------"; // Just in case the DB is empty
        }
    } catch (error) {
        dbConnCheck = "---Database Connection Failed---";
        console.error(error);
    } finally {
        console.log(dbConnCheck); // Logs connection status before redirection

        if (dbConnCheck === "-------Database Connected-------") {
            // Redirect only if the connection is successful
            window.location = "index.html";
        }
    }
}

setInterval(checkDBConnection, 1500);