import { login, logout, logoutfromAllDevices, myProfile, reGenToken, register } from "@/controllers/restful/user.controller.js"
import {placeOrder} from "@/controllers/restful/product.controller.js"
import { authMiddleware } from "@/middlewares/auth.middleware.js"
import express from "express"
export const authRouter = express.Router()
authRouter.post("/register",register)
authRouter.post("/login",login)
authRouter.post("/logout",authMiddleware,logout)
authRouter.post("/logoutfromalldevices",authMiddleware,logoutfromAllDevices)
authRouter.get("/profile",authMiddleware, myProfile)
authRouter.post("/regenerate-token",reGenToken)
authRouter.post("/place-order", placeOrder)