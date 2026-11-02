import { myProfile } from "@/controllers/restful/user.controller.js"
import { authMiddleware } from "@/middlewares/auth.middleware.js"
import express from "express"
const userRoutes = express.Router()
userRoutes.get("/set-cookie/:user_id",myProfile)
userRoutes.get("/check-cookie",authMiddleware)
export default userRoutes