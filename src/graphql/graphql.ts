import { ApolloServer } from "@apollo/server";
import { schema } from "./schema/index.js";
import { graphqlErrorHandler } from "./middleware/error.middleware.js";
import { resolvers } from "./resolver/index.js";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { authDirectiveTransformer } from "./directives/auth.directive.js";

let executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers: resolvers,
}) 
executableSchema = authDirectiveTransformer(executableSchema,"auth")

export const connectGraphQl = async () => {
  const server = new ApolloServer({
    schema:executableSchema,
    formatError: graphqlErrorHandler,
  });
  await server.start()
  return server
};
