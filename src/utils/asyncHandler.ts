import { NextFunction, Request, Response } from "express";
type handlerType = (req: Request, res: Response)=> Promise<Response>
export const asyncHandler =
  (resolver: handlerType) =>   //receive controller function as an arg
  async (req: Request, res: Response, next: NextFunction) => {   //return new function as its result
    try {
      await resolver(req, res);
    } catch (error) {
      next(error);
    }
  };
