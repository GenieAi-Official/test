/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import loginRoutes from './routes/login.js'
import taskRoutes from './routes/tasks.js'
import { ensureDirs } from './services/paths.js'

// load env
dotenv.config()
ensureDirs()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/login', loginRoutes)
app.use('/api/tasks', taskRoutes)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientDistDir = path.resolve(__dirname, '..', 'dist')
const clientIndexHtml = path.join(clientDistDir, 'index.html')
if (fs.existsSync(clientIndexHtml)) {
  app.use(express.static(clientDistDir))
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(clientIndexHtml)
  })
}

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
