import path from "path"
import { loadJsonFiles } from "../../../src/services/dataLoader"

const FIXTURES = path.join(__dirname, "fixtures")

describe("loadJsonFiles", () => {
    it("loads and merges records from valid JSON files", () => {
        const companies = loadJsonFiles(
            path.join(FIXTURES, "companies"),
        ) as Array<{ name: string }>
        expect(companies).toHaveLength(2)
        expect(companies[0].name).toBe("Acme Corp")
    })

    it("skips invalid JSON files without throwing and logs a warning", () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
        expect(() =>
            loadJsonFiles(path.join(FIXTURES, "companies")),
        ).not.toThrow()
        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining("invalid.json"),
        )
        warn.mockRestore()
    })

    it("loads employee records", () => {
        const employees = loadJsonFiles(path.join(FIXTURES, "employees"))
        expect(employees).toHaveLength(3)
    })
})
