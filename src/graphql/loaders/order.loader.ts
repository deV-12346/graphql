import type { address } from "@/generated/prisma";
import { prisma } from "@/prisma.js";
import DataLoader from "dataloader";

export const batchAddress = async (userIds: readonly number[]) => {
  const addresses = await prisma.address.findMany({
    where: {
      user_id: {
        in: [...userIds],
      },
    },
  });
  const res = userIds.map((userId) => {
    return addresses.filter((address) => address.user_id === userId);
  });
  return res;
};
export const createAddressLoader = () =>
  new DataLoader<number, address[]>(batchAddress, {
    batch: true,
    maxBatchSize: 100,
    cache: true,
  });
