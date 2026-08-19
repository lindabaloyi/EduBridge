import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { environment } from "./config/environment.js"
import { routes } from "./routes/index.js"
import { errorHandler } from "./middleware/errorHandler.js"

const app = express()

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: environment.CORS_ORIGIN }))
app.use(helmet())
app.use(morgan("short"))
app.use(express.json())

// ── Routes ──────────────────────────────────────────────────
app.use("/api", routes)

// ── Health check ────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", environment: environment.NODE_ENV })
})

// ── Global error handler ────────────────────────────────────
app.use(errorHandler)

// ── Start ──────────────────────────────────────────────────
app.listen(environment.PORT, () => {
  console.log(`EduBridge API running → http://localhost:${environment.PORT}`)
  console.log(`Environment → ${environment.NODE_ENV}`)
})