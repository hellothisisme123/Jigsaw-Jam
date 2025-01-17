// ----- buttons -----
const createAccountBtn = document.querySelector(".forceSignIn .buttonWrapper .createAccount")
const signInBtn = document.querySelector(".forceSignIn .buttonWrapper .signIn")
createAccountBtn.addEventListener("click", () => {window.location = "./createAccount.html"})
signInBtn.addEventListener("click", () => {window.location = "./signIn.html"})