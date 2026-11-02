export const productSchema = `#graphql
      directive @auth(role:Role) on FIELD_DEFINITION
      interface BaseResponse {
        success:Boolean!
        message:String!
      }
      type ProductResponse implements BaseResponse {
        success:Boolean!
        message:String!
        product:Product!
      }
      type ProductWithOrder implements BaseResponse {
        success:Boolean!
        message:String!
        data:ProductOrderWithPagination!
      }
      type ProductOrderWithPagination {
        products:[ProductOrders!]!
        page:Int
        limit:Int
      }
      type Product {
        product_id: ID!
        product_name: String!
        category: String!
        original_price: Float!
        offer_price: Float!
        created_at : String!
      }
      type ProductOrderData {
         order_id:ID!
         order_status: String!
         total_amount: Float!
         user:OrderUser!
      }
      type OrderUser {
        username:String!
        user_id:ID!
        email:String!
        phone_number:String!
        created_at: String!
      }
      type ProductOrders {
        product_id: ID!
        product_name: String!
        category: String!
        original_price: Float!
        offer_price: Float!
        created_at : String!,
        orders:[ProductOrderData]
      }
      input ProductInput {
        product_name: String!
        category: String!
        original_price: Float!
        offer_price: Float!
      }
      type ProductData {
        limit:Int
        totalProducts:Int
        page:Int
        products: [Product!]!
      }
      type Query {
        getProducts(page:Int = 1, limit:Int = 5): ProductData,
        getProductWithOrder(page:Int =1 , limit:Int=10): ProductWithOrder  @auth(role: ADMIN)
      }
      type Mutation {
        addProduct(product:ProductInput!): ProductResponse
        deleteProduct(product_id:ID!): BaseResponse @auth(role: USER)
      }
`;
