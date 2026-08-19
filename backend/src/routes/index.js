import { Router } from "express"

// ── Feature routes ──────────────────────────────────────────────
import { studentsRoutes } from "../modules/students/routes/studentsRoutes.js"
import { referenceRoutes } from "../modules/reference/routes/referenceRoutes.js"
import { assessmentsRoutes } from "../modules/assessments/routes/assessmentsRoutes.js"
import { gradebookRoutes } from "../modules/gradebook/routes/gradebookRoutes.js"
import { classesRoutes } from "../modules/classes/routes/classesRoutes.js"
import { subjectsRoutes } from "../modules/subjects/routes/subjectsRoutes.js"
import { communicationRoutes } from "../modules/communication/routes/communicationRoutes.js"
const router = Router()

router.use("/students", studentsRoutes)
router.use("/assessments", assessmentsRoutes)
router.use("/gradebook", gradebookRoutes)
router.use("/classes", classesRoutes)
router.use("/subjects", subjectsRoutes)
router.use("/communication", communicationRoutes)

// Reference data (terms)
router.use(referenceRoutes)

// ── Health check ────────────────────────────────────────────────
router.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

export { router as routes }