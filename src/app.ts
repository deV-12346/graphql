import dotenv from "dotenv";
import express from "express"
import cors from "cors"
import morgan from "morgan"
import { connectGraphQl } from "./graphql/graphql.js";
import { expressMiddleware } from "@as-integrations/express5";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import helmet from "helmet";
// import { connectRedis } from "./lib/redis/redis.js";
// import { rateLimiting } from "./middlewares/ratelimit.middleware.js";
import cookieParser from "cookie-parser"
import userRoutes from "./routes/users/user.route.js";
import { graphqlContext } from "./graphql/context/graphql.context.js";
import { authRouter } from "./routes/auth/auth.route.js";


dotenv.config({ path: "./.env" });
export const envMode  = process.env.ENVIRONMENT || "DEVELOPMENT"
const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
  try {
    // await connectRedis()
    const graphqlServer = await connectGraphQl();

    const app = express();
  //  app.use(rateLimiting)
    app.use(express.json());
    app.use(express.urlencoded({
      extended : true,
      limit:"10kb"
    }))

    app.use(express.static("public"))
    app.use(helmet({
      contentSecurityPolicy: false,
    }))

    app.use(cors({
       origin: envMode === "DEVELOPMENT" ? "*" : process.env.FRONTEND_URL,
       methods:["GET","PUT","POST","PATCH","DELETE"],
       credentials:true 
    }))

    app.use(cookieParser(process.env.COOKIES_KEY))
    app.use(morgan("dev"))
    
    app.use("/graphql", expressMiddleware(graphqlServer,{
       context: graphqlContext   //auth middleware for graphql
    }));

    app.get("/",(req,res)=>{
      res.send("Hello from routres")
    })
    app.use('/api/user',userRoutes)
    app.use("/api/auth",authRouter)
    app.use((req,res)=>{    //if route not found 
      res.status(404).json({
        success:false,
        mesage:"Page not found"
      })
    })
    app.use(errorMiddleware)
    app.listen(PORT, () => {
      console.log(`GraphQL Server running at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.log("Server failed to start", error);
  }
};
startServer();
