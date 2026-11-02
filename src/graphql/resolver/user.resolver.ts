import { addUser, getUser,getUsers } from "@/controllers/graphql/user.controller.js";
import { GraphQLContext } from "../context/graphql.context";

export const userResolver = {
        Query : {
            getUser,
            getUsers,
        },
        User : {
            addresses: (user:any,_args:unknown,ctx:GraphQLContext)=>{
               return ctx.loaders.address.load(Number(user.user_id))
            }
        },
        Mutation : {
              addUser,
        }
}