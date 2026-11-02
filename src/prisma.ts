import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import dotenv from "dotenv"
dotenv.config()

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  max:50,
  idleTimeoutMillis: 100_000,        //idle connection close 
  keepAlive: true,
  connectionTimeoutMillis: 5_000,    //time to connect to DB 5s return connection timeout if not connect
});

export const prisma = new PrismaClient({
  adapter,
  log:[{emit:"event",level:"query"}]
});
if(process.env.ENVIRONMENT === "DEVELOPMENT"){
    prisma.$on("query",(e)=>{
    console.log("Database Query : ",e.query)
    console.log("Query duration : ", e.duration)
})
}