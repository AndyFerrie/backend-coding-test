import request from "supertest"
import app from "./app"
import { CompanyWithEmployeesSchema } from "./data/schemas/schemas"
import * as dataLoader from "./src/dataLoader"

describe("GET /companies", () => {
    it("returns 200 with an array of companies", async () => {
        const res = await request(app).get("/companies")
        expect(res.statusCode).toEqual(200)
        expect(Array.isArray(res.body)).toBe(true)
    })

    it("returns company objects that match the Company schema", async () => {
        const res = await request(app).get("/companies")
        expect(res.body.length).toBeGreaterThan(0)
        const result = CompanyWithEmployeesSchema.safeParse(res.body[0])
        expect(result.success).toBe(true)
    })

    it("returns companies with a nested employees array", async () => {
        const res = await request(app).get("/companies")
        expect(res.body.length).toBeGreaterThan(0)
        expect(Array.isArray(res.body[0].employees)).toBe(true)
    })

    it("logs a warning and skips invalid company records", async () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
        jest.spyOn(dataLoader, "loadJsonFiles")
            .mockReturnValueOnce([])
            .mockReturnValueOnce([{ id: 99, not: "a valid company" }])

        const res = await request(app).get("/companies")

        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual([])
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
})
