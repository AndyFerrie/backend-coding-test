import { z } from "zod"
import {
    CompanySchema,
    CompanyWithEmployeesSchema,
    EmployeeSchema,
} from "../schemas/schemas"

export type Company = z.infer<typeof CompanySchema>
export type Employee = z.infer<typeof EmployeeSchema>
export type CompanyWithEmployees = z.infer<typeof CompanyWithEmployeesSchema>
