// ----- buttons -----
const dontHaveAnAccountBtn = document.querySelector(".signInPage .buttonWrapper .dontHaveAnAccount")
const signInBtn = document.querySelector(".signInPage .buttonWrapper .signIn")
dontHaveAnAccountBtn.addEventListener("click", dontHaveAnAccountFunc)
dontHaveAnAccountBtn.addEventListener("keydown", (e) => {
    if (e.key == "Enter" || e.keyCode == 13) {
        dontHaveAnAccountFunc()
    }
})

function dontHaveAnAccountFunc() {
    window.location = "./createAccount.html"
}

signInBtn.addEventListener("click", signInFunc)
signInBtn.addEventListener("keydown", (e) => {
    if (e.key == "Enter" || e.keyCode == 13) {
        signInFunc()
    }
})

async function signInFunc() {
    console.log("sign in")
    const username = document.querySelector(".usernameInput").value;
    const password = document.querySelector(".passwordInput").value;

    console.log();
    if ((await getDBData()).Users.filter(user => {
        if (user.Username == username && user.Password == password) return true
        else return false
    }).length > 0) {
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        window.location = "./index.html"
    } else {
        alertPopup(
            "Login Unsuccessful",
            `There is no account by the username and password you have inputted. Would you like to create a new account or try again with proper information.`,
            "Create Account",
            "Try Again",
            () => {
                window.location = "./createAccount.html"
            },
            () => {
            }
        )
    }
}

