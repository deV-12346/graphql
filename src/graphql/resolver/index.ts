import { mergeResolvers } from "@graphql-tools/merge";
import { userResolver } from "./user.resolver";
import { orderResolver } from "./order.resolver";
import { productResolver } from "./product.resolver";
import { todoResolver } from "./todo.resolver";

export const resolvers = mergeResolvers([userResolver ,orderResolver,productResolver,todoResolver])