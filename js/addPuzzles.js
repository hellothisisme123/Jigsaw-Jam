function getVercelDomain(url) {
    const hostname = new URL(url).hostname;
    if (hostname.endsWith('.vercel.app')) {
        return hostname;
    }
    return null;
}

// Example
const url = window.location;
const domain = getVercelDomain(url);
if (domain) {
    alertPopup(
        "Your on the public site",
        "This page doesn't work",
        "Okay",
        "Epic",
        () => {},
        () => {}
    )
    return
}

function generateScaledProportions(width, height) {
    function getRandomBetween(a, b) {
        // Generate a random number between a and b with decimals
        return (Math.random() * (b - a)) + a;
    }
    let scaleFactor = getRandomBetween(1.1, 1.5)
    
    function getAdjustedDimensions(width, height, maxSize) {
        // Calculate the aspect ratio
        const aspectRatio = width / height;
    
        // Start with initial values close to the input width and height
        let newWidth = width;
        let newHeight = height;
    
        // Adjust the values until both are below 20
        while (newWidth >= maxSize || newHeight >= maxSize) {
            // Reduce dimensions proportionally
            newWidth *= 0.9; // scale down width by 10%
            newHeight *= 0.9; // scale down height by 10%
        }
    
        newWidth = Math.round(newWidth);
        newHeight = Math.round(newHeight);
    
        // Ensure both dimensions are under 20 and return the new dimensions
        if (newWidth >= maxSize || newHeight >= maxSize) {
            newWidth = Math.min(newWidth, maxSize-1);
            newHeight = Math.min(newHeight, maxSize-1);
        }
    
        return { width: newWidth, height: newHeight };
    }
    
    let newDimensions = getAdjustedDimensions(width, height, 7)
    let res = []
    for (let i = 0; i < 3; i++) {
        res.push({"width": Math.round(newDimensions.width*scaleFactor*(i+1)), "height": Math.round(newDimensions.height*scaleFactor*(i+1))})
    }

    return res
}

function displayImage(input, i, img) {
    
    const file = input.files[i];
    if (file) {
        // console.log(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            img.src = reader.result; // Set the image source
            img.style.display = "block"; // Show the image

            function getImageDimensions(base64String) {
                return new Promise((resolve, reject) => {
                    const img2 = new Image();
                    img2.src = base64String;
                    img2.onload = function() {
                        resolve({ width: img2.width, height: img2.height });
                    };
                    img2.onerror = reject;
                });
            }
            // console.log(img.src);
            getImageDimensions(img.src).then(dimensions => {
                const totalFiles = inputFile.files.length
                label.innerHTML = `${i+1} / ${totalFiles} <br> (${img.width},${img.height})`
            }).catch(error => {
                console.error("Error loading image:", error);
            });
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

        handleInput(inputFile.files[index-1])

        function handleInput(file) {            
            // Get all active tags
            const activeTags = [...tagWrapper.querySelectorAll(".tag.active")].map(tag => tag.textContent.toLowerCase());
            // console.log(JSON.stringify(activeTags));

            // Get image file name
            const fileName = file.name;
            
            // check for each values existence validity
            let text = "" 
            let missingInputBool = false
            if (!inputFile.value) {
                text += "You need to input an image. <br>"
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
                let scaledProportions = generateScaledProportions(img.width, img.height)

                function formatSizes(sizes) {
                    return sizes.map(size => {
                        // Scale width and height to the nearest simple whole numbers
                        let newWidth = Math.round(size.width * 2 / 3);  
                        let newHeight = Math.round(size.height * 2 / 3);
                
                        return `${newWidth}x${newHeight}`;
                    });
                }
                // console.log(formatSizes(scaledProportions));
                
                const data = {
                    Tags: JSON.stringify(activeTags), // Convert activeTags array into a JSON string
                    Src: fileName,                    // File name as the Src
                    Sizes: JSON.stringify(formatSizes(scaledProportions)), // Convert scaledProportions array into a JSON string
                    Alt: altText.value.toLowerCase().trim() // Convert altText to lowercase and trim any whitespace
                };
                console.log(data);
                
                // Now send this data using a fetch request (already set up)
                fetch('https://192.168.240.9:3006/jigsawJam/addRowToPuzzles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),  // Send the data object as JSON
                    signal: signal
                })
                .then(response => response.json())
                .then(data => {
                    // console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
    
                // move on to next image
                if (index < totalFiles) {
                    displayImage(inputFile, index, img)
                    clearInputs(false, inputFile, sizeWrapper, tagWrapper, altText)
                    index++
                } else {
                    clearInputs(true, inputFile, sizeWrapper, tagWrapper, altText)
                    img.src = ""
                    index = 1
                    label.innerHTML = `1 / X <br> (0x0)`
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
});

setupUploader(inputFile, tagWrapper, sizeWrapper, altText, button)
clearInputs(true, inputFile, sizeWrapper, tagWrapper, altText)