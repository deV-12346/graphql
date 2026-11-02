import {  Request } from "express"
import { errorCode } from "../errors/errorCode.js"
import { GraphQLError } from "graphql"
import { createAddressLoader } from "../loaders/order.loader.js"
import { createLoaders } from "../loaders/index.js";
import { createproductOrderLoader, createProductOrderUser } from "../loaders/product.loader.js";

export interface AuthUser {
  user_id: number;
  role: "USER" | "ADMIN";
}

export interface GraphQLContext {
  user: AuthUser | null;
  loaders: {
    address: ReturnType<typeof createAddressLoader>;
    productOrder: ReturnType<typeof createproductOrderLoader>,
    productOrderUser: ReturnType<typeof createProductOrderUser>
  };
}

const getUser = async (req:Request):Promise<AuthUser | null>=> {
    try {
        const authrization  =  req.headers.authorization
        const token  = req.signedCookies.accessToken || authrization?.split(' ')[1]
        // if(!token){
        //     throw new GraphQLError("Unauthorized Access",{
        //     extensions:{
        //         code: errorCode.UNAUTHENTICATED,
        //     }
        // })
        // }
        // const decoedToken =  jwt.verify(token,process.env.JWT_SCRET_KEY!)
        // console.log("decoed token.....",decoedToken)
        // console.log(token)
        return  {
                user_id:1,
                role:"USER"
            }
    } catch (error) {
        console.log(error)
        if(error instanceof GraphQLError){
             throw error
        }
        throw new GraphQLError("Invalid or Expired Token",{
              extensions:{
                  code: errorCode.UNAUTHENTICATED,
              }
        })
    }
}


export const graphqlContext = async({req}:{req:Request}):Promise<GraphQLContext> =>({
    user : await getUser(req),
    loaders: createLoaders()
})