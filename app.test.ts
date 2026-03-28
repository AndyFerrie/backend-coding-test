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
})
