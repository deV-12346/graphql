export const todoSchema = `#graphql
    directive @auth on FIELD_DEFINITION
    type Response {
        success: Boolean!
        message: String!
    }
    type TodoPagination {
        success: Boolean!
        message: String!
        todos: [Todo!],
        page: Int!
        limit: Int!
    } 
    type Todo {
        id: ID!
        title: String!
        completed: Boolean!
        created_at: String!
    }
    input InputTodo {
        title: String!
        completed: Boolean
    },
    type Query {
        allTodo(page:Int = 1, limit: Int=10) : TodoPagination @auth
    }
    type Mutation {
        addTodo(input:InputTodo): Response   @auth
    }
`