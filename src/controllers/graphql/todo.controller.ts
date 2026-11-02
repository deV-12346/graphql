import { AuthUser } from "@/graphql/context/graphql.context"
import { errorCode } from "@/graphql/errors/errorCode.js"
import { prisma } from "@/prisma.js"
import { pagination } from "@/utils/pagination.js"
import { GraphQLError } from "graphql"
export interface InputType {
    title:string
    completed: boolean
}
export const addTodo = async(_:unknown, args:{input:InputType},context:{user:AuthUser})=>{
    const {title,completed} = args.input
    const user_id = context.user.user_id
   console.log(args)
    const user = await prisma.users.findUnique({
        where : {
             user_id
        }
    })
    if(!user){
        throw new GraphQLError("User not found",{
             extensions:{
                code:errorCode.NOT_FOUND
             }  
        })
    }
    const newTodo = await prisma.todos.create({
          data:{
            title,
            completed,
            user_id
          },
    })
    console.log("new todo ", newTodo)
    return {
        success: true,
        message: "Todo added"
    }
}
export const allTodo = async(_:unknown,args:{page:number, limit:number},content:AuthUser)=>{
    const {page, limit} = args
    const {skip, limit:l}= pagination(page,limit)
    const user_id = content.user_id
    const todos = await prisma.todos.findMany({
        where:{
            user_id
        },
        skip,
        take:l
    })
    if(todos.length === 0){
        throw new GraphQLError("Todo list is empty",{
            extensions:{
                code:errorCode.NOT_FOUND
            }
        })
    }
    return {
        success:true,
        message:"Todo list fetched",
        todos,
        page,
        limit
    }
}