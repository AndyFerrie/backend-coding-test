import { z } from "zod"

export const CompanySchema = z.object({
    id: z.number().int(),
    name: z.string(),
    industry: z.string(),
    active: z.boolean(),
    website: z.url(),
    // Not enforcing regex "^[0-9-]+$" for telephone in case incorrectly formatted
    telephone: z.string(),
    slogan: z.string(),
    address: z.string(),
    city: z.string(),
    country: z.string(),
})

export const EmployeeSchema = z.object({
    id: z.number().int(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.email().nullable().optional(),
    role: z.string(),
    company_id: z.number().int().nullable().optional(),
})

export const CompanyWithEmployeesSchema = CompanySchema.extend({
    employees: z.array(EmployeeSchema),
})

export type Company = z.infer<typeof CompanySchema>
export type Employee = z.infer<typeof EmployeeSchema>
export type CompanyWithEmployees = z.infer<typeof CompanyWithEmployeesSchema>
