// ----- buttons -----
const alreadyHaveAnAccountBtn = document.querySelector(".createAccountPage .buttonWrapper .alreadyHaveAnAccount")
const createAccountBtn = document.querySelector(".createAccountPage .buttonWrapper .createAccount")
alreadyHaveAnAccountBtn.addEventListener("click", () => {window.location = "./signIn.html"})
createAccountBtn.addEventListener("click", () => {
    console.log("create account")
})