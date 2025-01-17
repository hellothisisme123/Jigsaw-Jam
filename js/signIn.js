// ----- buttons -----
const dontHaveAnAccountBtn = document.querySelector(".signInPage .buttonWrapper .dontHaveAnAccount")
const createAccountBtn = document.querySelector(".signInPage .buttonWrapper .signIn")
dontHaveAnAccountBtn.addEventListener("click", () => {window.location = "./createAccount.html"})
createAccountBtn.addEventListener("click", () => {
    console.log("sign in")
})