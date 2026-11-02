import { getMyOrders,getOrderAddress,getOrderProduct,createOrder} from "@/controllers/graphql/order.controller";
export const orderResolver = {
   Query : {
    getMyOrders,
   },
   Order : {
    address: getOrderAddress,
    product: getOrderProduct,
   },
   Mutation:{
      createOrder
   }
}