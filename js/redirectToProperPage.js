// ----- redirect to proper page -----
const username = localStorage.getItem("username")
const password = localStorage.getItem("password")

if ((!username || !password) &&
    currentPage != "forceSignIn.html" &&
    currentPage != "createAccount.html" &&
    currentPage != "signIn.html" && 
    currentPage != "failedToConnect.html"
) {
    window.location = "./forceSignIn.html"
}