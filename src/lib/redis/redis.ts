import Redis from "ioredis";
import dotenv from "dotenv"
dotenv.config({ path: "./.env" });

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(REDIS_URL, {
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
  maxRetriesPerRequest: 3, 
  enableReadyCheck: true,
  connectTimeout: 10000,
  lazyConnect: true,
});
redis.on("connect", () => {
  console.log("Connecting to Redis");
});
redis.on("error", (err) => {
  console.log("Failed to connect with Redis", err);
});
redis.on("ready",()=>{
    console.log("Redis Connected successfully")
})
redis.on("close",()=>{
    console.log("Redis connection is closed")
})

export const connectRedis = async () => {
  if(redis.status === "ready" || redis.status === "connecting") return 
  try {
    await redis.connect();
  } catch (error) {
    console.log("Redis failed",error)
    throw error
  }
};
export default redis;
