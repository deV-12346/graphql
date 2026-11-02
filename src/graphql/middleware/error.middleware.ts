import { GraphQLFormattedError } from "graphql"
import { errorCode } from "../errors/errorCode.js";

export const graphqlErrorHandler = (  formattedError: GraphQLFormattedError, error: unknown)=> {
    // console.log("error handler .....",formattedError)
    const response =  {
    message: formattedError?.extensions?.code === errorCode.INTERNAL_SERVER_ERROR  ? "Something went wrong" : formattedError.message,
    path: formattedError.path,
    extensions: {
      success: false,
      code:  formattedError.extensions?.code ?? errorCode.INTERNAL_SERVER_ERROR,
    },
   }
  console.log("response",error)
   return response
};