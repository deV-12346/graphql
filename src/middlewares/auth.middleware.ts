import { prisma } from "@/prisma.js";
import { ApiError } from "@/utils/apiError.js";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
interface AccessTokenPayload {
  user_id: string;
  sid: string;
  tokenVersion: number;
}
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.signedCookies.accessToken;
    if (!token) {
      throw new ApiError("unauthorized", 401);
    }
    const decoded = jwt.verify(
      token,
      process.env.ACCESSTOKENKEY as string,
    ) as AccessTokenPayload;
    if (!decoded.sid || !decoded.user_id) {
      throw new ApiError("Session or User is missing", 401);
    }
    const session = await prisma.sessions.findUnique({
      where: {
        session_id: decoded.sid,
      },
      select: {
        revoked: true,
        expires_at: true,
        userss: { select: { token_version: true } }, // use your relation's name
      },
    });

    if (!session ||  session?.userss?.token_version !== decoded?.tokenVersion || session.revoked) {
      throw new ApiError("Token Revoked", 401);
    }
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
