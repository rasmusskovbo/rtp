export function isAuthorized(req, res, next) {
    !req.session.isLoggedIn ? res.redirect("/login") : next()
}

export function isAdmin(req, res, next) {
    !req.session.isAdmin ? res.redirect("/") : next()
}

export function isAuthorizedOrigin(req, res, next) {
    const origin = req.get('origin')
    const authOrigin = process.env.AUTH_ORIGIN
    origin !== authOrigin ? res.sendStatus(401) : next()
}