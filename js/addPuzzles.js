

function displayImage(input, i, img) {
    const file = input.files[i];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            console.log(reader);
            img.src = reader.result; // Set the image source
            img.style.display = "block"; // Show the image
        };
        reader.onerror = () => console.error("Error loading image");
    }
}

function setupUploader(inputFile, tagWrapper, sizeWrapper, altText, button) {
    // ✅ Toggle active class on tags
    tagWrapper.addEventListener("click", function (event) {
        if (event.target.classList.contains("tag")) {
            event.target.classList.toggle("active");
        }
    });

    // ✅ Button click event
    let index = 1
    button.addEventListener("click", function () {
        let totalFiles = inputFile.files.length

        // for (let i = 0; i < totalFiles; i++) {
        //     handleInput(inputFile.files[i])
        // }
        handleInput(inputFile.files[index-1])

        function handleInput(file) {            
            // Get all active tags
            const activeTags = [...tagWrapper.querySelectorAll(".tag.active")].map(tag => tag.textContent.toLowerCase());
            console.log(JSON.stringify(activeTags));

            // Get image file name
            const fileName = file.name;
            console.log(fileName);

            // Get sizes from input fields
            const sizes = [...sizeWrapper.querySelectorAll("input")].map(input => input.value.trim());
            console.log(JSON.stringify(sizes));

            // check for each values existence validity
            let text = "" 
            let missingInputBool = false
            if (!inputFile.value) {
                text += "You need to input an image. <br>"
                missingInputBool = true
            }

            if (sizeWrapper.querySelector(".size1 input").value == "") {
                text += "You need to input size 1. <br>"
                missingInputBool = true
            }

            if (sizeWrapper.querySelector(".size2 input").value == "") {
                text += "You need to input size 2. <br>"
                missingInputBool = true
            }

            if (sizeWrapper.querySelector(".size3 input").value == "") {
                text += "You need to input size 3. <br>"
                missingInputBool = true
            }

            if (!altText.value) {
                text += "You need to input an alt text. <br>"
                missingInputBool = true
            }

            if (missingInputBool) {
                alertPopup(
                    "Input Invalid",
                    text,
                    "Okay",
                    "Epic",
                    () => {},
                    () => {}
                )
            } else {
                // push to database
                console.log({
                    tags: JSON.stringify(activeTags),
                    filePath: fileName,
                    sizes: JSON.stringify(sizes),
                    altText: altText.value
                });
    
                // set up next row
                if (index < totalFiles) {
                    index++
                    label.innerHTML = `${index} / ${totalFiles}`
                    displayImage(inputFile, index, img)
                    clearInputs(false, inputFile, sizeWrapper, tagWrapper, altText)
                } else {
                    clearInputs(true, inputFile, sizeWrapper, tagWrapper, altText)
                    img.src = ""
                    index = 1
                    label.innerHTML = "1 / X"
                }
            }
            
        }
    });
}

function clearInputs(bool, inputFile, sizeWrapper, tagWrapper, altText) {
    if (bool) inputFile.value = ""
    sizeWrapper.querySelectorAll("input").forEach(input => input.value = "")
    tagWrapper.querySelectorAll(".tag").forEach(tag => tag.classList.remove("active"))
    altText.value = ""
}




let inputFile = document.querySelector(".imgInput"),
tagWrapper = document.querySelector(".tagWrapper"),
sizeWrapper = document.querySelector(".sizes"),
altText = document.querySelector(".altText textarea"),
button = document.querySelector(".updateDatabase button")
label = document.querySelector(".label"),
img = document.querySelector(".imgOutput")

inputFile.addEventListener("change", function (event) {
    displayImage(inputFile, 0, img)
    label.innerHTML = `1 / ${inputFile.files.length}`
});

setupUploader(inputFile, tagWrapper, sizeWrapper, altText, button)
clearInputs(true, inputFile, sizeWrapper, tagWrapper, altText)