import { NextFunction, Request, Response } from "express";
import { envMode } from "@/app.js";
import { ApiError } from "@/utils/apiError.js";
import jwt from "jsonwebtoken"
import { Prisma } from "@/generated/prisma/client.js";
export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Something Went Wrong";
  console.log("error", err);
  const { JsonWebTokenError, TokenExpiredError } = jwt;
  if(err instanceof ApiError) {
    statusCode = err.statusCode || 500;
    message =  err.message || "Internal Server Error";
  }else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Expired Token";
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid Token";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      message = "Resource already exists";
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Resource not found";
    }
  }
  const response: {
    statusCode: number;
    success: boolean;
    message: string;
    error?: Error | ApiError;
  } = {
    statusCode,
    success:false,
    message,
  };

  if (envMode === "DEVELOPMENT" && err instanceof Error) {
    response.error = err;
  }

  return res.status(statusCode).json(response);
};
