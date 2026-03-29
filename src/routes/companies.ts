import express from "express"

import {
    getCompanies,
    getCompanyById,
} from "../controllers/companiesController"

const router = express.Router()

router.get("/", getCompanies)

router.get("/:id", getCompanyById)

export default router
