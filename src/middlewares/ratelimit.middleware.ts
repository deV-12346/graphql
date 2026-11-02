import redis from "@/lib/redis/redis.js"
import { NextFunction, Request, Response } from "express"

export const rateLimiting = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        // const user_id  = req?.headers["user_id"]
        const ip = req.ip 
        const key  = `rate-limit:${ip}`
        const attempts = await redis.incr(key)
        if(Number(attempts) === 1){
            await redis.expire(key ,60)
        }
        if(Number(attempts) > 20){
            return res.status(429).json({
                success:false,
                message:"Too many request",
                statusCode:429
            })
        }
        next()
    } catch (error) {
        console.log("error",error)
        next(error)
    }
}