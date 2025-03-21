// ----- buttons -----
const alreadyHaveAnAccountBtn = document.querySelector(".createAccountPage .buttonWrapper .alreadyHaveAnAccount")
const createAccountBtn = document.querySelector(".createAccountPage .buttonWrapper .createAccount")
alreadyHaveAnAccountBtn.addEventListener("click", () => {window.location = "./signIn.html"})
createAccountBtn.addEventListener("click", () => {
    // Get input values
    const username = document.querySelector(".usernameInput").value;
    const confirmUsername = document.querySelector(".confirmUsernameInput").value;
    const password = document.querySelector(".passwordInput").value;
    const confirmPassword = document.querySelector(".confirmPasswordInput").value;

    if (validateAccountInfo()) {
        createAccount(username, password)
    }

    function validateAccountInfo() {
        // Regular expressions for validation
        const noSpacesRegex = /\s/;
        const usernameNoSpecialCharsRegex = /^[a-zA-Z0-9]+$/; // Regex to ensure no special characters in username
    
        // Validate username and password
        const isUsernameValid = username === confirmUsername;
        const isPasswordValid = password === confirmPassword;
        const isPasswordLengthValid = password.length >= 16;
        const isUsernameLengthValid = username.length >= 8;
        const hasTwoNumbers = (password.match(/\d/g) || []).length >= 2;
        const hasTwoSpecialChars = (password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length >= 2;
        const hasTwoUppercase = (password.match(/[A-Z]/g) || []).length >= 2;
        const hasTwoLowercase = (password.match(/[a-z]/g) || []).length >= 2;
        const usernameContainsNoSpaces = noSpacesRegex.test(username) === false;
        const passwordContainsNoSpaces = noSpacesRegex.test(password) === false;
        const usernameContainsNoSpecialChars = usernameNoSpecialCharsRegex.test(username) && username !== ""; // Check if username has special characters
        
        // Check if all validation conditions are met
        let alertPopupBool = false;
        if (!isUsernameValid) alertPopupBool = true;
        else if (!isPasswordValid) alertPopupBool = true;
        else if (!isPasswordLengthValid) alertPopupBool = true;
        else if (!isUsernameLengthValid) alertPopupBool = true;
        else if (!hasTwoNumbers) alertPopupBool = true;
        else if (!hasTwoSpecialChars) alertPopupBool = true;
        else if (!hasTwoUppercase) alertPopupBool = true;
        else if (!usernameContainsNoSpaces) alertPopupBool = true;
        else if (!passwordContainsNoSpaces) alertPopupBool = true;
        else if (!hasTwoLowercase) alertPopupBool = true;
        else if (!usernameContainsNoSpecialChars) alertPopupBool = true; // Check if username has special characters
        else {
            // If all validations pass, store the username and password in localStorage
            return true; 
        }

        // Popup to tell the user how to fix their password
        if (alertPopupBool) {
            alertPopup(
                "Account creation error",
                `
                <ul>
                    ${(() => { if (!isUsernameValid) {return "<li>The \"username\" and \"confirm username\" boxes are not the same</li>"} else return "" })()}
                    ${(() => { if (!isPasswordValid) {return "<li>The \"password\" and \"confirm password\" boxes are not the same</li>"} else return "" })()}
                    ${(() => { if (!usernameContainsNoSpaces) {return "<li>Username cannot contain spaces</li>"} else return "" })()}
                    ${(() => { if (!passwordContainsNoSpaces) {return "<li>Password cannot contain spaces</li>"} else return "" })()}
                    ${(() => { if (!hasTwoNumbers) {return "<li>Password should have at least 2 numbers</li>"} else return "" })()}
                    ${(() => { if (!hasTwoSpecialChars) {return "<li>Password should have at least 2 special characters</li>"} else return "" })()}
                    ${(() => { if (!hasTwoUppercase) {return "<li>Password should have at least 2 uppercase characters</li>"} else return "" })()}
                    ${(() => { if (!hasTwoLowercase) {return "<li>Password should have at least 2 lowercase characters</li>"} else return "" })()}
                    ${(() => { if (!isPasswordLengthValid) {return "<li>Password should have at least 16 characters</li>"} else return "" })()}
                    ${(() => { if (!isUsernameLengthValid) {return "<li>Username should have at least 8 characters</li>"} else return "" })()}
                    ${(() => { if (!usernameContainsNoSpecialChars) {return "<li>Username cannot contain special characters</li>"} else return "" })()}
                </ul>
                `,
                "Okay",
                "Epic",
                () => {},
                () => {}
            );
        } 

        return false
    }



});

// this function adds the account with proper credentials 
async function createAccount(username, password) {
    async function accountDoesNotExist() {
        if ((await getDBData()).Users.filter(user => {
            if (user.Username == username) return true 
            else return false
        }).length > 0) return false 
        else return true
    }
    
    if (await accountDoesNotExist()) {

        // let successfulDBPush = false
        fetch('https://192.168.240.9:3006/jigsawJam/addRowToUsers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Username: username,
                Password: password,
                SaveData: JSON.stringify([]),
                Settings: JSON.stringify({})
            })  // Send the data object as JSON
        })
        .then(response => response.json())
        .then(data => {
            alertPopup(
                "Account creation complete",
                `Your account "${username}" has been created successfully. Once you hit the buttons below you will be logged in properly. To log off or make other account changes go to your settings page.`,
                "Okay",
                "Epic",
                () => {
                    localStorage.setItem("username", username);
                    localStorage.setItem("password", password);
                    window.location = "./index.html"
                },
                () => {
                    localStorage.setItem("username", username);
                    localStorage.setItem("password", password);
                    window.location = "./index.html"
                }
            )

            async function a() {console.log(await getDBData());} a()
        })
        .catch((error) => {
            console.error('Error:', error);
        });






        
        
    } else {
        alertPopup(
            "Account already exists",
            `There is already an account by the name "${username}". Would you like to sign in with the password, or choose a new username to create your own account.`,
            "Sign In",
            "Choose New Username",
            () => {
                window.location = "./signIn.html"
            },
            () => {}
        );
    }
}