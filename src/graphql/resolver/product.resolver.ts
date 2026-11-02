import {
  addProduct,
  getProducts,
  deleteProduct,
  getProductWithOrder,
} from "@/controllers/graphql/product.controller.js";
import { GraphQLContext } from "../context/graphql.context";

export const productResolver = {
  Query: {
    getProducts,
    getProductWithOrder,
  },
  ProductOrders: {
    orders: (parent: {product_id:number}, __: unknown, ctx: GraphQLContext) => {
      return ctx.loaders.productOrder.load(parent.product_id);
    },
  },
  ProductOrderData: {
    user: (parent: {user_id: number}, __: unknown, ctx: GraphQLContext) => {
      return ctx.loaders.productOrderUser.load(parent.user_id);
    },
  },
  Mutation: {
    addProduct,
    deleteProduct,
  },
};
