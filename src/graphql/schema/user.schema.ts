export const userSchema = `#graphql
    directive @auth(role: Role) on FIELD_DEFINITION
    enum Role {
        USER
        ADMIN
    }
    type User {
        username:String!
        id: ID! @deprecated(reason :"Use user_id")
        user_id:ID!
        email:String!
        phone_number:String!
        created_at: String!
        addresses:[Addresses]
    }
    type Addresses {
        id:ID!
        street: String!
        city: String!
        state: String!
        country: String!
        pincode: String!
    },
    input UserInput {
       username: String!
       email: String!
       phone_number: String!
     }  
    type Query {
        getUser(user_id:ID!):User @auth(role: USER)
        getUsers(page:Int = 1, limit:Int = 10):[User] @auth(role: USER)
    }
    type Mutation { 
        addUser(user:UserInput): String!
    }
`;
