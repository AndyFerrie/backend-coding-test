import fs from "fs"
import path from "path"

export function loadJsonFiles(directory: string): unknown[] {
    const files = fs.readdirSync(directory).filter((f) => f.endsWith(".json"))
    const results: unknown[] = []
    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(directory, file), "utf-8")
            const parsed: unknown = JSON.parse(content)
            if (Array.isArray(parsed)) {
                results.push(...parsed)
            }
        } catch (err) {
            console.warn(`Skipping file "${file}": ${(err as Error).message}`)
        }
    }
    return results
}
