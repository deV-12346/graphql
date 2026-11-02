import { GraphQLError } from "graphql"
import { errorCode } from "@/graphql/errors/errorCode.js"
import { prisma } from "@/prisma.js"
import { pagination } from "@/utils/pagination.js"
export const getUser = async(_:unknown,args:{user_id: string})=>{
       const {user_id} = args
       const user = await prisma.users.findUnique({
        where:{
            user_id:Number(user_id)
        }
       })
       if(!user){
        throw new GraphQLError("User not found",{
            extensions:{
                code: errorCode.NOT_FOUND
            }
        })
       }
      return {
    ...user,
    id: user.user_id,
};
}
export const addUser = async (
  _: unknown,
  args: { user: { username: string; email: string; phone_number: string } },
) => {
  console.log(args);
  const { username, email, phone_number } = args.user;
  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });
  if (user) {
    throw new GraphQLError("User already exist with this email", {
      extensions: {
        code: errorCode.NOT_FOUND,
      },
    });
  }
  await prisma.users.create({
    data: {
      username,
      email,
      phone_number,
    },
  });
  return "User created successfully";
};
export const getUsers = async (_:unknown, args:{page:number, limit:number})=>{
     console.log("get users ")
     const {page,limit} = args
     const {skip, limit:l} = pagination(page,limit)
     const users = await prisma.users.findMany({
        // orderBy:{
        //   created_at:"asc"
        // },
         take:l,
         skip,
     })
     return users
}