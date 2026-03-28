import request from "supertest"
import app from "./app"
import { CompanyWithEmployeesSchema } from "./data/schemas/schemas"
import * as dataLoader from "./src/dataLoader"

describe("GET /companies", () => {
    it("returns 200 with an array of companies", async () => {
        const res = await request(app).get("/companies")
        expect(res.statusCode).toEqual(200)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    it("returns company objects that match the Company schema", async () => {
        const res = await request(app).get("/companies")
        expect(res.body.data.length).toBeGreaterThan(0)
        const result = CompanyWithEmployeesSchema.safeParse(res.body.data[0])
        expect(result.success).toBe(true)
    })

    it("returns companies with a nested employees array", async () => {
        const res = await request(app).get("/companies")
        expect(res.body.data.length).toBeGreaterThan(0)
        expect(Array.isArray(res.body.data[0].employees)).toBe(true)
    })

    it("logs a warning and skips invalid company records", async () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
        jest.spyOn(dataLoader, "loadJsonFiles")
            .mockReturnValueOnce([])
            .mockReturnValueOnce([{ id: 99, not: "a valid company" }])

        const res = await request(app).get("/companies")

        expect(res.statusCode).toEqual(200)
        expect(res.body.data).toEqual([])
        expect(warn).toHaveBeenCalledWith(
            "Skipping invalid company record (id: 99):",
            expect.anything(),
        )

        warn.mockRestore()
        jest.restoreAllMocks()
    })

    it("logs a warning with the employee ID when skipping an invalid employee record", async () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
        // employees loads first (invalid record with known id), companies second (empty)
        jest.spyOn(dataLoader, "loadJsonFiles")
            .mockReturnValueOnce([{ id: 40, role: null }])
            .mockReturnValueOnce([])

        await request(app).get("/companies")

        expect(warn).toHaveBeenCalledWith(
            "Skipping invalid employee record (id: 40):",
            expect.anything(),
        )

        warn.mockRestore()
        jest.restoreAllMocks()
    })

    it("returns pagination metadata", async () => {
        const res = await request(app).get("/companies")
        expect(res.body.pagination).toMatchObject({
            total: expect.any(Number),
            limit: 20,
            offset: 0,
        })
        expect(res.body.pagination.total).toBeGreaterThan(0)
    })

    it("respects the limit parameter", async () => {
        const res = await request(app).get("/companies?limit=1")
        expect(res.body.data.length).toBe(1)
        expect(res.body.pagination.limit).toBe(1)
    })

    it("respects the offset parameter", async () => {
        const allRes = await request(app).get("/companies")
        const offsetRes = await request(app).get("/companies?offset=1")
        expect(offsetRes.body.data[0].id).toEqual(allRes.body.data[1].id)
        expect(offsetRes.body.pagination.offset).toBe(1)
    })

    it("returns 400 for an invalid limit", async () => {
        const res = await request(app).get("/companies?limit=abc")
        expect(res.statusCode).toEqual(400)
    })

    it("returns 400 for a negative offset", async () => {
        const res = await request(app).get("/companies?offset=-1")
        expect(res.statusCode).toEqual(400)
    })

    describe("filtering", () => {
        it("filters by company name (case-insensitive)", async () => {
            const allRes = await request(app).get("/companies")
            const firstName: string = allRes.body.data[0].name
            const partial = firstName.slice(0, 3).toLowerCase()

            const res = await request(app).get(`/companies?name=${partial}`)
            expect(res.body.data.length).toBeGreaterThan(0)
            for (const company of res.body.data) {
                expect(company.name.toLowerCase()).toContain(partial)
            }
        })

        it("filters by active status true", async () => {
            const res = await request(app).get("/companies?active=true")
            expect(res.body.data.length).toBeGreaterThan(0)
            for (const company of res.body.data) {
                expect(company.active).toBe(true)
            }
        })

        it("filters by active status false", async () => {
            const res = await request(app).get("/companies?active=false")
            for (const company of res.body.data) {
                expect(company.active).toBe(false)
            }
        })

        it("filters by employee name (case-insensitive)", async () => {
            const allRes = await request(app).get("/companies")
            const companyWithEmployees = allRes.body.data.find(
                (company: { employees: unknown[] }) =>
                    company.employees.length > 0,
            )
            const firstName: string =
                companyWithEmployees.employees[0].first_name
            const partial = firstName.slice(0, 3).toLowerCase()

            const res = await request(app).get(
                `/companies?employeeName=${partial}`,
            )
            expect(res.body.data.length).toBeGreaterThan(0)
            for (const company of res.body.data) {
                const match = company.employees.some(
                    (employee: { first_name: string; last_name: string }) =>
                        employee.first_name.toLowerCase().includes(partial) ||
                        employee.last_name.toLowerCase().includes(partial),
                )
                expect(match).toBe(true)
            }
        })

        it("returns empty data array when no companies match the name filter", async () => {
            const res = await request(app).get("/companies?name=zzznomatch")
            expect(res.body.data).toEqual([])
            expect(res.body.pagination.total).toBe(0)
        })

        it("returns 400 for an invalid active value", async () => {
            const res = await request(app).get("/companies?active=invalid")
            expect(res.statusCode).toEqual(400)
        })
    })
})

describe("GET /companies/:id", () => {
    it("returns 200 with a single company matching the schema", async () => {
        const allRes = await request(app).get("/companies")
        const firstId: number = allRes.body.data[0].id

        const res = await request(app).get(`/companies/${firstId}`)
        expect(res.statusCode).toEqual(200)
        const result = CompanyWithEmployeesSchema.safeParse(res.body)
        expect(result.success).toBe(true)
    })

    it("returns the correct company for the given id", async () => {
        const allRes = await request(app).get("/companies")
        const firstCompany = allRes.body.data[0]

        const res = await request(app).get(`/companies/${firstCompany.id}`)
        expect(res.body.id).toEqual(firstCompany.id)
        expect(res.body.name).toEqual(firstCompany.name)
    })

    it("returns 404 when the company does not exist", async () => {
        const res = await request(app).get("/companies/999999")
        expect(res.statusCode).toEqual(404)
    })

    it("returns 400 for a non-integer id", async () => {
        const res = await request(app).get("/companies/abc")
        expect(res.statusCode).toEqual(400)
    })
})
