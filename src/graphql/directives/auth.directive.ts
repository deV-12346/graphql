import {  defaultFieldResolver, GraphQLError, GraphQLSchema } from "graphql";
import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils";
import { errorCode } from "../errors/errorCode.js";
export function authDirectiveTransformer(
  schema: GraphQLSchema,
  directive: string = "auth",
) {

  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, directive)?.[0];
    
      if (authDirective) {   
        const { role: requiredRole } = authDirective;
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = function (parent,args,context,info){
        
             const user = context?.user
            //  console.log(user)
             if(!user){
                throw new GraphQLError("Unauthorized",{
                    extensions:{
                        code: errorCode.UNAUTHENTICATED
                    }
                })
             }
             if(requiredRole && requiredRole !== user.role){
                  throw new GraphQLError("Access Denied",{
                    extensions:{
                        code: errorCode.FORBIDDEN
                    }
                })
             }
              return resolve(parent,args,context,info)
             }
        }
        return fieldConfig
      }
    });
}
