fetch("/session")
.then(res => res.json())
.then(session => {
    
    if (!session.isLoggedIn) {
        createNavLink("Login", "/login")
    } else {
        createNavLink("League Board", "/league-board")
        createNavLink("Stats", "/stats")
        createNavLink("Profile", "/profile")
        createNavLink("Logout", "/logout")
        
        // Display user
        const navBar = document.getElementById("dynamic-nav")
        const listItem = document.createElement("li")
            listItem.className = "nav-item"

        const text = document.createElement("a")
            text.id = "current_user"
            text.className = "nav-link"
            text.style = "color: hotpink"
            text.innerHTML = "Logged in as: " + session.currentUser

        listItem.appendChild(text)
        navBar.appendChild(listItem)

    }

    updateActiveLink()
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

function updateActiveLink() {
    const documentTitle = document.title
        const documentTitleArray = documentTitle.split(" ")
        const documentSubTitle = documentTitleArray.at(0)

        const navItems = Array.from(document.getElementsByClassName("nav-link"))

        navItems.forEach(navItem => {
            if (navItem.innerHTML.includes(documentSubTitle)) {
                navItem.classList.add("active")
            }
        })
}
