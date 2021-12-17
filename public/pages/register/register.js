function register() {
    fetch("/register/user", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            username: document.getElementById("username").value,
            pw1: document.getElementById("pw1").value,
            pw2: document.getElementById("pw2").value
        })
    }).then(res => {
        console.log("Response: " + res.status)
        if (res.status == 200) {
            toastr.success("Registering...")

            fetch("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: JSON.stringify({
                    email: document.getElementById("email").value,
                    pw1: document.getElementById("pw1").value
                })
            }).then(res => {
                console.log("Response: " + res.status)
                if (res.status == 200) {
                    setTimeout(() => location.href= "/", 1500)
                } else {
                    toastr.info("Login currently unavailable, try again later")
                }
            }) 

        }
        if (res.status == 400) {
            toastr.info("Passwords do not match. Please try again")
        }
        if (res.status == 403) {
            toastr.info("Not a valid email. Please try again.")
        }
        if (res.status == 409) {
            toastr.info("Email already registered to a user. Try another")
        }
        if (res.status == 500) {
            toastr.info("Login currently unavailable, try again later")
        }
    }) 
}

document.getElementById("register-button").addEventListener("click", register)