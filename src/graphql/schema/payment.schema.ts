export const paymentSchema = `#graphql
        type Payment {
        payment_id :ID!
        payment_method: String!
        payment_status: String!
        transaction_id: String!
        amount: Float!
        created_at: String!
        } 
        type OrderData {
        order_id:ID!
        order_status: String!
        total_amount: Int!
        created_at: String!
        payment: [Payment!]!
        }
        type OrderPagination {
            page:Int
            limit:Int
            totalOrders:Int
            orders: OrderData
        }
        type Query {
            getAllPayment:(page:Int = 1, page:Int = 10)=> OrderPagination
        }
`;
