// TODO LOAD AVATAR WITH AVATAR ID

function updatePassword() {
    fetch("/profile/pw", {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
            currentPw: document.getElementById("current_pw").value,
            pw1: document.getElementById("pw1").value,
            pw2: document.getElementById("pw2").value
        })
    }).then(res => {
        if (res.status == 200) {
            toastr.success("Changed password successfully")
        }
        if (res.status == 400) {
            toastr.info("Passwords incorrect or not matching. Please try again")
        }
        if (res.status == 500) {
            toastr.info("Profile service currently unavailable. Try again later")
        }
    }) 
}

function updateEmail() {
    fetch("/profile/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
            newEmail: document.getElementById("new_email").value
        })
    }).then(res => {
        if (res.status == 200) {
            toastr.success("Changed email successfully")
        }
        if (res.status == 400) {
            toastr.info("Not a valid email")
        }
        if (res.status == 500) {
            toastr.info("Profile service currently unavailable. Try again later")
        }
    }) 
}

function updateSleeper() {
    fetch("/profile/sleeper", {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
            sleeperUser: document.getElementById("sleeper_username").value
        })
    }).then(res => {
        if (res.status == 200) {
            toastr.success("Updated Sleeper info successfully")
        }
        if (res.status == 400) {
            toastr.info("Sleeper username not found")
        }
        if (res.status == 500) {
            toastr.info("Sleeper API currently unavailable. Try again later")
        }
    }) 
}

document.getElementById("update_sleeper").addEventListener("click", updateSleeper)
document.getElementById("update_password").addEventListener("click", updatePassword)
document.getElementById("update_email").addEventListener("click", updateEmail)