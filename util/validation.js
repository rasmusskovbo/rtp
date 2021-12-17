const mailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

export function isEmailValid(email) {
    return mailRegex.test(String(email).toLowerCase())
}

export function passwordsMatch(pw1, pw2) {
    return pw1 === pw2
}