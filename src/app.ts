import express from "express"
import companiesRouter from "./routes/companies"

const app = express()

app.use("/companies", companiesRouter)

export default app
