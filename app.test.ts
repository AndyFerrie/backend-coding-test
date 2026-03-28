import request from "supertest"
import app from "./app"
import { CompanySchema } from "./data/schemas/schemas"

describe("GET /companies", () => {
    it("returns 200 with an array of companies", async () => {
        const res = await request(app).get("/companies")
        expect(res.statusCode).toEqual(200)
        expect(Array.isArray(res.body)).toBe(true)
    })

    it("returns company objects that match the Company schema", async () => {
        const res = await request(app).get("/companies")
        expect(res.body.length).toBeGreaterThan(0)
        const result = CompanySchema.safeParse(res.body[0])
        expect(result.success).toBe(true)
    })
})
