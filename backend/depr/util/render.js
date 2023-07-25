import fs from "fs"

const nav = fs.readFileSync("./public_old/components/nav/nav.html", "utf8")
const footer = fs.readFileSync("./public_old/components/footer/footer.html", "utf8")

export function createPage(path, options) {
    return (nav + fs.readFileSync(`./public/pages/${path}`, "utf8") + footer)
            .replace("%%DOCUMENT_TITLE%%", options?.title || "Road To PInk")
}
