import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
export const generateAccessToken = (payload: any) =>{
    const accessToken = jwt.sign(payload,process.env.ACCESSTOKENKEY!,{
       expiresIn:"15m"
    })
    return accessToken
}
export const generateRefreshToken = (payload: any) =>{
    return jwt.sign(payload,process.env.REFRESHTOKENKEY!,{expiresIn:"7d"})
}