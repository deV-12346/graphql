
export const orderSchema = `#graphql
      directive @auth(role:Role) on FIELD_DEFINITION 
      type Response {
        success: Boolean!
        message: String!
       }
      type OrderWithPagination {
        page:Int!
        limit:Int!,
        totalOrders:Int!
        orders:[Order!]!
      }
      type Order {
        order_id:ID!
        order_status: String!
        total_amount: Int!
        created_at: String!
        address: Address!
        product: Product!
      }
      type Address {
        id:ID!
        street: String!
        city: String!
        state: String!
        country: String!
        pincode: String!
      }
      type Query {
        getMyOrders(page:Int = 1,limit:Int = 5, user_id:ID!): OrderWithPagination
      }
      input OrderInput {
        product_id:Int!
        address_id:Int!
      }
      type Mutation {
         createOrder(input:OrderInput!): Response  @auth(role:USER)
      }
`;
      