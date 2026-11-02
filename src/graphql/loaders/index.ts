import { createAddressLoader } from "./order.loader.js";
import { createproductOrderLoader, createProductOrderUser } from "./product.loader.js";

export const createLoaders = ()=> ({
    address : createAddressLoader(),
    productOrder: createproductOrderLoader(),
    productOrderUser: createProductOrderUser()
})