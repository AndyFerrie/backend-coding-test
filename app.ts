import express from "express"
import path from "path"
import { loadJsonFiles } from "./src/dataLoader"
import {
    CompanySchema,
    CompanyWithEmployees,
    EmployeeSchema,
    Employee,
} from "./data/schemas/schemas"

const app = express()

const COMPANIES_DIR = path.join(__dirname, "data", "companies")
const EMPLOYEES_DIR = path.join(__dirname, "data", "employees")

app.get("/companies", (req, res) => {
    const limit = parseInt((req.query.limit as string) ?? "20", 10)
    const offset = parseInt((req.query.offset as string) ?? "0", 10)

    if (isNaN(limit) || limit < 0 || isNaN(offset) || offset < 0) {
        res.status(400).json({
            error: "limit and offset must be non-negative integers",
        })
        return
    }

    const employees: Employee[] = []
    for (const record of loadJsonFiles(EMPLOYEES_DIR)) {
        const result = EmployeeSchema.safeParse(record)
        if (result.success) {
            employees.push(result.data)
        } else {
            const id = (record as Record<string, unknown>)?.id ?? "unknown"
            console.warn(
                `Skipping invalid employee record (id: ${id}):`,
                result.error.issues,
            )
        }
    }

    const companies: CompanyWithEmployees[] = []
    for (const record of loadJsonFiles(COMPANIES_DIR)) {
        const result = CompanySchema.safeParse(record)
        if (!result.success) {
            const id = (record as Record<string, unknown>)?.id ?? "unknown"
            console.warn(
                `Skipping invalid company record (id: ${id}):`,
                result.error.issues,
            )
            continue
        }
        companies.push({
            ...result.data,
            employees: employees.filter(
                (employee) => employee.company_id === result.data.id,
            ),
        })
    }

    const total = companies.length
    const page = companies.slice(offset, offset + limit)

    res.json({ data: page, pagination: { total, limit, offset } })
})

export default app
