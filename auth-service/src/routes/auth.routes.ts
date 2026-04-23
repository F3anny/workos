import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import validate from '../middleware/validate'
import {
  registerSchema,
  loginSchema,
  refreshSchema
} from '../schemas/auth.schema'

const router: Router = Router()

router.post('/register', validate(registerSchema), authController.register)
router.post('/login', validate(loginSchema), authController.login)
router.post('/refresh', validate(refreshSchema), authController.refresh)
router.post('/logout', validate(refreshSchema), authController.logout)

export default router