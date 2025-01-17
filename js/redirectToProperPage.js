// ----- redirect to proper page -----
const username = localStorage.getItem("username")
const password = localStorage.getItem("password")
const currentPage = window.location.href.split("/")[window.location.href.split("/").length-1]

if ((!username || !password) &&
    currentPage != "forceSignIn.html" &&
    currentPage != "createAccount.html" &&
    currentPage != "signIn.html"
) {
    window.location = "./forceSignIn.html"
}