function login() {
    fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            pw1: document.getElementById("pw").value
        })
    }).then(res => {
        if (res.status == 200) {
            toastr.success("Logging in...")
            setTimeout(() => location.href= "/profile", 1000);
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