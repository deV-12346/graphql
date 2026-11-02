import type { orders, users } from "@/generated/prisma";
import { prisma } from "@/prisma.js";
import DataLoader from "dataloader";

export const batchOrder = async (prdocutId: readonly number[]) => {
  console.log(prdocutId);
  const orders = await prisma.orders.findMany({
    where: {
      product_id: {
        in: [...prdocutId],
      },
    },
  });
  return prdocutId.map((id) =>
    orders.filter((order) => order.product_id === id),
  );
};
export const batchUser = async (userIds: readonly number[]) => {
  console.log(userIds);
  const users = await prisma.users.findMany({
    where: {
      user_id: {
        in: [...userIds],
      },
    },
  });
  return userIds.map((id) => users.find((u) => u.user_id === id ) || null)

};
export const createProductOrderUser = () =>
  new DataLoader<number, users | null>(batchUser, {
    cache: true,
    maxBatchSize: 200,
    batch: true,
  });
export const createproductOrderLoader = () =>
  new DataLoader<number, orders[]>(batchOrder, {
    cache: true,
    maxBatchSize: 100,
    batch: true,
  });
