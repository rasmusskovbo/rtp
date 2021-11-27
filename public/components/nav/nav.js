document.addEventListener("DOMContentLoaded", (event) => {
    fetch("/session")
    .then(res => res.json())
    .then(session => {
        
        if (!session.isLoggedIn) {
            createNavLink("Login", "/login")
        } else {
            createNavLink("Profile", "/profile")
            createNavLink("Logout", "/logout")
            
            
            const navBar = document.getElementById("dynamic-nav")
            const listItem = document.createElement("li")
                listItem.className = "nav-item"

            const text = document.createElement("a")
                text.className = "nav-link"
                text.style = "color: hotpink"
                text.innerHTML = "Currently logged in as: " + session.currentUser

            listItem.appendChild(text)
            navBar.appendChild(listItem)
        }
    })
})

function createNavLink(name, link) {
    const navBar = document.getElementById("dynamic-nav")

    const listItem = document.createElement("li")
        listItem.className = "nav-item"

    const itemLink = document.createElement("a")
        itemLink.className = "nav-link"
        itemLink.href = link
        itemLink.innerHTML = name

    listItem.appendChild(itemLink)
    navBar.appendChild(listItem)
}

    /*
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
    */
 