import express from "express"
import path from "path"
import { loadJsonFiles } from "./src/dataLoader"

const app = express()
const port = 3000

const COMPANIES_DIR = path.join(__dirname, "data", "companies")

app.get("/companies", (req, res) => {
    const companies = loadJsonFiles(COMPANIES_DIR)
    res.json(companies)
})

app.listen(port, () => {
    console.log(`Companies API running on http://localhost:${port}`)
})

export default app
