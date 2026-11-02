import { errorCode } from "@/graphql/errors/errorCode.js";
import { prisma } from "@/prisma.js";
import { ProductInterface } from "@/types/product.js";
import { pagination } from "@/utils/pagination.js";
import { GraphQLError } from "graphql";
export const getProducts = async (
  parent: unknown,
  args: { page: number; limit: number },
  context: any,
  info: any,
) => {
  console.log(parent, args, context, info);
  const { page, limit } = args;
  const { skip, limit: l } = pagination(page, limit);
  const [products, productCount] = await Promise.all([
    prisma.products.findMany({
      skip,
      take: l,
    }),
    prisma.products.count(),
  ]);
  console.log(products);
  if (products.length === 0) {
    throw new GraphQLError("Product not found", {
      extensions: {
        code: errorCode.NOT_FOUND,
      },
    });
  }
  return { page, limit, totalProducts: productCount, products: products };
};
export const addProduct = async (
  _: unknown,
  args: { product: ProductInterface },
) => {
  console.log("productproductproduct", args);
  const { product_name, original_price, offer_price, category } = args.product;
  const newProduct = await prisma.products.create({
    data: {
      product_name,
      offer_price,
      original_price,
      category,
    },
  });
  return {
    success: true,
    message: "Product Added",
    product: newProduct,
  };
};
export const deleteProduct = async (
  _: unknown,
  args: { product_id: string  },
) => {
  const { product_id } = args;
  console.log("type of ",typeof product_id)
  const existProduct = await prisma.products.findFirst({
    where: {
      product_id: Number(product_id),
    },
  });
  if (!existProduct) {
    throw new GraphQLError("Product not found", {
      extensions: {
        code: errorCode.NOT_FOUND,
      },
    });
  }
  await prisma.products.delete({
    where: {
      product_id: Number(product_id),
    },
  });
  return {
    success: true,
    message: "Product deleted",
  };
};
export const getProductWithOrder = async (_:unknown,args:{page:number, limit:number})=>{
    console.log("product")
    const {page,limit} = args
    const {skip,limit:l} = pagination(page,limit)
    const products = await prisma.products.findMany({
      take:l,
      skip
    })
    if(products.length === 0){
      throw new GraphQLError("Product not found",{
        extensions:{
          code: errorCode.NOT_FOUND
        }
      })
    }
    return {
      success:true, 
      message:"Product fetched",
      data:{
        products,
        page,
        limit
      }
    }
}
// export const getProductOrder  = async(parent:{product_id: number})=>{
//       console.log("order")
//       const {product_id} = parent
//       const orders = await prisma.orders.findMany({
//         where:{
//           product_id
//         }
//       })
//       return orders 
// }
// export const getOrderWithUser  = async(parent:{user_id: number},)=>{
//       console.log("user")
//       const {user_id} = parent
//       const user = await prisma.users.findUnique({
//         where:{
//           user_id
//         }
//       })
//       return user
// } 