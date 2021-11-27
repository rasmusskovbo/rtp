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
            setTimeout(() => location.href= "/", 1500);
        }
        if (res.status == 400) {
            toastr.info("Passwords do not match. Please try again")
        }
        if (res.status == 500) {
            toastr.info("Login currently unavailable, try again later")
        }
    }) 
}

document.getElementById("register-button").addEventListener("click", register)