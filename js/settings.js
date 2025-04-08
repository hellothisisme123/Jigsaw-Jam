// search bar x button
document.querySelector('.container .navigation .navResponsive .searchbar .xIcon img').addEventListener("click", (e) => {
    document.querySelector('.container .navigation .navResponsive .searchbar input').value = ""
})

// search bar tabs
const tabs = document.querySelectorAll('.container .navigation .navResponsive .settingsTabWrapper .tab'),
account = document.querySelector('.container .main .mainResponsive .settingsTab.account'),
game = document.querySelector('.container .main .mainResponsive .settingsTab.game'),
audio = document.querySelector('.container .main .mainResponsive .settingsTab.audio'),
video = document.querySelector('.container .main .mainResponsive .settingsTab.video'),
maintabs = [account, game, audio, video]
tabs.forEach(tab => {
    let active = true
    
    tab.addEventListener("click", (e) => {
        active = !active

        if (active) {
            tab.classList.add("active")
            if (tab.classList.contains("account")) {
                account.classList.add("active")
            } else if (tab.classList.contains("game")) {
                game.classList.add("active")
            } else if (tab.classList.contains("audio")) {
                audio.classList.add("active")
            } else if (tab.classList.contains("video")) {
                video.classList.add("active")
            }
        } else {
            tab.classList.remove("active")
            if (tab.classList.contains("account")) {
                account.classList.remove("active")
            } else if (tab.classList.contains("game")) {
                game.classList.remove("active")
            } else if (tab.classList.contains("audio")) {
                audio.classList.remove("active")
            } else if (tab.classList.contains("video")) {
                video.classList.remove("active")
            }
        }
    })
})

// on off buttons + toggleable subsettings 
const onOffs = document.querySelectorAll(".container .main .settingsTab .toggle.wrapper")
console.log(onOffs)
onOffs.forEach((child) => {
    let bool = true
    child.addEventListener("click", (e) => {
        if (bool) {
            child.classList.add("active")
            // toggleable subsettings
            if (child.classList.contains("flipper")) {
                child.parentElement.querySelector(".subSettings").classList.add("active")
            }
        } else {
            child.classList.remove("active")
            // toggleable subsettings
            if (child.classList.contains("flipper")) {
                child.parentElement.querySelector(".subSettings").classList.remove("active")
            }
        }
        bool = !bool
    })
})

// range sliders
const ranges = document.querySelectorAll(".container .main .settingsTab .slider.wrapper .range")
console.log(ranges)
ranges.forEach((child) => {
    const bounds = child.getBoundingClientRect()
    let obj = {
        mousex: 0,
        rangex1: bounds.left+3,
        rangex2: bounds.right-3,
        min: child.dataset.min,
        max: child.dataset.max,
        step: child.dataset.step, 
        value: child.dataset.value
    }
    mouseHeld = false

    child.addEventListener("mousemove", (e) => {
        if (!mouseHeld) return
        obj.mousex = e.clientX

        let percentage = (obj.mousex-obj.rangex1) / ((obj.rangex2-obj.rangex1) / (obj.max-obj.min))// part / (obj.rangex2 - obj.rangex1)
        const round = (number, step) => { return Math. round(number / step) * step; };
        // https://elvery.net/drzax/rounding-to-the-nearest-multiple-in-javascript/
        
        child.dataset.value = round(percentage, obj.step)
        child.setAttribute("style", `--perc: ${child.dataset.value}%;`)
    })
    child.setAttribute("style", `--perc: ${child.dataset.value}%;`)
    
    child.addEventListener("mouseup", (e) => {
        mouseHeld = false
    })

    child.addEventListener("mousedown", (e) => {
        mouseHeld = true
    })
})

// sign out button
const signOutBtn = document.querySelector(".account .btn .signOut") 
signOutBtn.addEventListener("click", (e) => {
    alertPopup(
        "Are you Sure?",
        "You would like to sign out of your account. You will be able to sign back in using the username and password. All settings, saved puzzles, and saved data will be saved.",
        "Yes, Sign Out",
        "No, Cancel",
        () => {
            localStorage.setItem("username", "")
            localStorage.setItem("password", "")
            window.location = "./"
        },
        () => {}
    )
})