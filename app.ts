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

    res.json(companies)
})

export default app
