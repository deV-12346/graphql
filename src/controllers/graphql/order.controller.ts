import { AuthUser } from "@/graphql/context/graphql.context";
import { errorCode } from "@/graphql/errors/errorCode.js";
import { prisma } from "@/prisma.js";
import { pagination } from "@/utils/pagination.js";
import { GraphQLError } from "graphql";
export const getMyOrders = async (
  _: unknown,
  args: { page: number; limit: number; user_id: string },
) => {
  const { page, limit, user_id } = args;
  const { limit: l, skip } = pagination(page, limit);
  const [orders, totalOrders] = await Promise.all([
    prisma.orders.findMany({
      where: {
        user_id: Number(user_id),
      },
      skip,
      take: l,
    }),
    prisma.orders.count({
      where: {
        user_id: Number(user_id),
      },
    }),
  ]);
  return { limit, page, orders, totalOrders };
};
export const getOrderAddress = async (parent: { address_id: string }) => {
  const { address_id } = parent;
  const orderAdress = await prisma.address.findUnique({
    where: {
      id: Number(address_id),
    },
  });
  return orderAdress;
};
export const getOrderProduct = async (parent: { product_id: string }) => {
  const { product_id } = parent;
  const orderedProduct = await prisma.products.findUnique({
    where: {
      product_id: Number(product_id),
    },
  });
  return orderedProduct;
};
export const createOrder = async (
  _: unknown,
  args: { input: { product_id: number; address_id: number } },
  context: { user: AuthUser },
) => {
  console.log(args);
  const { product_id, address_id } = args.input;
  const user_id = context.user.user_id;
  const product = await prisma.products.findUnique({
    where: {
      product_id,
    },
  });
  if (!product) {
    throw new GraphQLError("Product not found", {
      extensions: {
        code: errorCode.NOT_FOUND,
      },
    });
  }
  const address = await prisma.address.findFirst({
    where: { id: address_id, user_id },
  });
  if (!address) {
    throw new GraphQLError("Invalid address", {
      extensions: { code: errorCode.BAD_USER_INPUT },
    });
  }
  if (product.stock === 0) {
    throw new GraphQLError("Product out of stock", {
      extensions: {
        code: errorCode.BAD_USER_INPUT,
      },
    });
  }
  await prisma.$transaction(async (tx) => {
    const res = await tx.products.updateMany({
      where: {
        AND: [{ product_id }, { stock: { gte: 1 } }],
      },
      data: {
        stock: { decrement: 1 },
      },
    });
    await tx.orders.create({
      data: {
        product_id,
        user_id,
        total_amount: product.original_price + 50,
        address_id,
        order_status: "PLACED",
      },
    });
    if (res.count === 0) {
      throw new GraphQLError("Product out of stock", {
        extensions: {
          code: errorCode.BAD_USER_INPUT,
        },
      });
    }
  });
  return {
    success: true,
    message: "Order created",
  };
};
