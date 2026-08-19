import { Router } from 'express'
import {
  handleGetStudents,
  handleGetStudentById,
  handleCreateStudent,
  handleUpdateStudent,
  handleDeleteStudent,
} from '../controllers/studentsController.js'

const router = Router()

// GET /api/students          - list all students
// POST /api/students         - create a student
router.get('/', handleGetStudents)
router.post('/', handleCreateStudent)

// GET /api/students/:id      - get a single student
// PUT /api/students/:id      - update a student
// DELETE /api/students/:id   - delete a student
router.get('/:id', handleGetStudentById)
router.put('/:id', handleUpdateStudent)
router.delete('/:id', handleDeleteStudent)

export { router as studentsRoutes }