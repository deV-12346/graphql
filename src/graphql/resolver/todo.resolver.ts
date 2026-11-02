import { addTodo, allTodo } from "@/controllers/graphql/todo.controller";

export const todoResolver = {
    Query :{
      allTodo
    },
    Mutation :{
      addTodo
    }
}