// ----- get db connection -----
let database
fetch('http://192.168.240.9:3006/jigsawJam/data')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        database = data
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// ----- nav -----
const homeBtn = document.querySelector("nav .home")
const settingsBtn = document.querySelector("nav .settings")
homeBtn.addEventListener("click", () => {window.location = "./index.html"})
settingsBtn.addEventListener("click", () => {window.location = "./settings.html"})