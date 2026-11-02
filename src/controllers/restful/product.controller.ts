import { adminOnly } from "@/graphql/middleware/adminOnly.js";
import { prisma } from "@/prisma.js";
import { ApiError } from "@/utils/apiError.js";
import { ApiResponse } from "@/utils/apiResponse.js";
import { asyncHandler } from "@/utils/asynchandler.js";
import { Request, Response } from "express";

export const getAllProducts = adminOnly(async (parent, args, context, info) => {
  try {
    console.log(args);
    const products = await prisma.products.findMany();
    return products;
  } catch (error) {
    console.log("error from products ");
    throw error;
  }
});
export const placeOrder = asyncHandler(async (req: Request, res: Response) => {
  console.log(new Date(Date.now()).getTime())
  console.log(req.body)
  const { product_id, address_id ,user_id} = req.body;
  if(!product_id || !address_id || !user_id){
    throw new ApiError("Select a product or address or user ",400)
  }
  const product = await prisma.products.findUnique({
    where: {
      product_id,
    },
  });
  if (!product) {
    throw new ApiError("Product not found", 400);
  }
  const address = await prisma.address.findFirst({
    where: { id: address_id },
  });
  if (!address) {
    throw new ApiError("Address not found", 400);
  }
  if (product.stock === 0) {
    throw new ApiError("Product out of stock", 400);
  }
  console.log("transaction start....")
  await prisma.$transaction(async (tx) => {
    const res = await tx.products.updateMany({
      where: {
        AND: [{ product_id }, { stock: { gte: 1 } }],
      },
      data: {
        stock: { decrement: 1 },
      },
    });
     if (res.count === 0) {
      throw new ApiError("Product out of stock", 400);
    }
    await tx.orders.create({
      data: {
        product_id,
        user_id,
        total_amount: product.original_price + 50,
        address_id,
        order_status: "PLACED",
      },
    });
  },{
    isolationLevel:"ReadCommitted"
  });
  return res.status(200).json(new ApiResponse(true, "Order placed"));
});
