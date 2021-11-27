function login() {
    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            pw: document.getElementById("pw").value
        })
    }).then(res => {
        console.log("Response: " + res.status)
        if (res.status == 200) {
            toastr.success("Logging in...")
            setTimeout(() => location.href= "/", 1500);
        }
        if (res.status == 400) {
            toastr.info("Email or password not found. Please check and try again")
        }
        if (res.status == 500) {
            toastr.info("Login currently unavailable, try again later")
        }
    }) 
}

document.getElementById("login-button").addEventListener("click", login)