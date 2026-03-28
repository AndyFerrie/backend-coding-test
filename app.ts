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

    const nameFilter = (req.query.name as string | undefined)?.toLowerCase()
    const activeFilter = req.query.active as string | undefined
    const employeeNameFilter = (
        req.query.employeeName as string | undefined
    )?.toLowerCase()

    if (
        activeFilter !== undefined &&
        activeFilter !== "true" &&
        activeFilter !== "false"
    ) {
        res.status(400).json({ error: 'active must be "true" or "false"' })
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

    let filtered = companies

    if (nameFilter !== undefined) {
        filtered = filtered.filter((company) =>
            company.name.toLowerCase().includes(nameFilter),
        )
    }

    if (activeFilter !== undefined) {
        const activeBool = activeFilter === "true"
        filtered = filtered.filter((company) => company.active === activeBool)
    }

    if (employeeNameFilter !== undefined) {
        filtered = filtered.filter((company) =>
            company.employees.some(
                (employee) =>
                    employee.first_name
                        .toLowerCase()
                        .includes(employeeNameFilter) ||
                    employee.last_name
                        .toLowerCase()
                        .includes(employeeNameFilter),
            ),
        )
    }

    const total = filtered.length
    const page = filtered.slice(offset, offset + limit)

    res.json({ data: page, pagination: { total, limit, offset } })
})

app.get("/companies/:id", (req, res) => {
    const id = parseInt(req.params.id, 10)

    if (isNaN(id)) {
        res.status(400).json({ error: "id must be an integer" })
        return
    }

    const employees: Employee[] = []
    for (const record of loadJsonFiles(EMPLOYEES_DIR)) {
        const result = EmployeeSchema.safeParse(record)
        if (result.success) {
            employees.push(result.data)
        } else {
            const recordId =
                (record as Record<string, unknown>)?.id ?? "unknown"
            console.warn(
                `Skipping invalid employee record (id: ${recordId}):`,
                result.error.issues,
            )
        }
    }

    for (const record of loadJsonFiles(COMPANIES_DIR)) {
        const result = CompanySchema.safeParse(record)
        if (!result.success) {
            const recordId =
                (record as Record<string, unknown>)?.id ?? "unknown"
            console.warn(
                `Skipping invalid company record (id: ${recordId}):`,
                result.error.issues,
            )
            continue
        }
        if (result.data.id === id) {
            res.json({
                ...result.data,
                employees: employees.filter(
                    (employee) => employee.company_id === result.data.id,
                ),
            })
            return
        }
    }

    res.status(404).json({ error: `Company with id ${id} not found` })
})

export default app
