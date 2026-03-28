import express from "express"
import path from "path"
import { loadJsonFiles } from "./src/dataLoader"

const app = express()

const COMPANIES_DIR = path.join(__dirname, "data", "companies")

app.get("/companies", (req, res) => {
    const companies = loadJsonFiles(COMPANIES_DIR)
    res.json(companies)
})

export default app
