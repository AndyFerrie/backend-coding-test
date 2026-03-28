const fs = require("fs")
const path = require("path")

function loadJsonFiles(directory) {
    const files = fs.readdirSync(directory).filter((f) => f.endsWith(".json"))
    const results = []
    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(directory, file), "utf-8")
            const parsed = JSON.parse(content)
            if (Array.isArray(parsed)) {
                results.push(...parsed)
            }
        } catch (err) {
            console.warn(`Skipping file "${file}": ${err.message}`)
        }
    }
    return results
}

module.exports = { loadJsonFiles }
