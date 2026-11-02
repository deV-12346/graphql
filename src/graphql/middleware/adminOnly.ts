import { GraphQLError, GraphQLFieldResolver } from "graphql";
import { errorCode } from "../errors/errorCode.js";
export const adminOnly =
  (resolver: GraphQLFieldResolver<any, any>): GraphQLFieldResolver<any, any> =>
  async (parent, args, context, info) => {
    console.log(context);
    if (!context.user) {
      throw new GraphQLError("Unauthorized", {
        extensions: {
          code: errorCode.UNAUTHENTICATED,
        },
      });
    }
    const role = context.user.role;
    if (role !== "Admin") {
      throw new GraphQLError("FORBIDDEN REQUEST", {
        extensions: {
          code: errorCode.FORBIDDEN,
        },
      });
    }
    return await resolver(parent, args, context, info);
  };
