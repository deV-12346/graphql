import { NextFunction, Request, Response } from "express";

export const isAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
   const role = req?.headers["role"];
    // const role = req.signedCookies.role
    if (role !== "Admin") return next();
    else {
      return res.status(403).json({
        success: false,
        message: "Bhag Chutiya",
        statusCode: 403
      });
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
};
