import { errorCode } from "@/graphql/errors/errorCode.js";
import { UserInput, UserInputUpdate } from "@/graphql/schema/order.schema.js";
import redis from "@/lib/redis/redis.js";
import { prisma } from "@/prisma.js";
import bcryptjs from "bcryptjs";
import { ApiError } from "@/utils/apiError.js";
import { ApiResponse } from "@/utils/apiResponse.js";
import { asyncHandler } from "@/utils/asynchandler.js";
import { CookieOptions, Request, Response } from "express";
import { GraphQLError } from "graphql";
import { generateAccessToken, generateRefreshToken } from "@/utils/genToken.js";
import jwt, { JwtPayload } from "jsonwebtoken";
export const getMyProfile = async (
  _: unknown,
  { user_id }: { user_id: string },
) => {
  try {
    const cacheProfile = await redis.hgetall(`user:${user_id}`);
    if (Object.keys(cacheProfile).length > 0) {
      return cacheProfile;
    }
    const user = await prisma.users.findUnique({
      where: {
        user_id: Number(user_id),
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    await redis.hset(`user:${user_id}`, user);
    return user;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};
export const myProfile = asyncHandler(async (req: Request, res: Response) => {
  const user_id = req.user?.user_id;
  console.log("user_id", user_id);
  if (!user_id) {
    throw new ApiError("user id is required", 400);
  }
  //   const key = `user:${user_id}`;
  //   const cacheUser = await redis.hgetall(key);
  //   if (Object.keys(cacheUser).length) {
  //     return res
  //       .status(200)
  //       .json(new ApiResponse(true, "User fetched successfully", cacheUser));
  //   }
  const user = await prisma.userss.findUnique({
    where: {
      user_id: user_id,
    },
  });
  if (!user) {
    throw new ApiError("User not Found", 404);
  }

  //   const pipeline = redis.pipeline();
  //   pipeline.hset(key, user);
  //   pipeline.expire(key, 3600);
  //   await pipeline.exec();

  //   res.cookie("user_id", user_id, {
  //     httpOnly: true,
  //     secure: true,
  //     signed: true,
  //     maxAge: 1000 * 60 * 60,
  //   });
  return res
    .status(200)
    .json(new ApiResponse(true, "User fetched successfully", user));
});
export const addUser = async (_: unknown, args: { input: UserInput }) => {
  try {
    const { username, email, phone_number } = args.input;
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });
    if (user) {
      throw new GraphQLError("User already exists", {
        extensions: {
          code: errorCode.CONFLICT,
        },
      });
    }
    const res = await prisma.users.create({
      data: {
        username,
        email,
        phone_number,
      },
    });
    const key = `user:${res.user_id}`;
    const pipeline = redis.pipeline();
    pipeline.hset(key, res);
    pipeline.expire(key, 3600);
    await pipeline.exec();
    return "User created successfully";
  } catch (error) {
    console.log("");
    throw error;
  }
};
export const updateUser = async (
  _: unknown,
  args: { input: UserInputUpdate },
) => {
  try {
    console.log("input", args);
    const { user_id, username, email, phone_number } = args.input;
    if (!user_id) {
      throw new GraphQLError("User id is missing", {
        extensions: {
          code: errorCode.BAD_USER_INPUT,
        },
      });
    }
    const user = await prisma.users.findUnique({
      where: { user_id: Number(user_id) },
    });
    if (!user) {
      throw new GraphQLError("User not found", {
        extensions: {
          code: "",
        },
      });
    }
    const res = await prisma.users.update({
      data: {
        username,
        email,
        phone_number,
      },
      where: {
        user_id: Number(user_id),
      },
    });
    const key = `user:${user.user_id}`;
    const pipeline = redis.pipeline();
    pipeline.del(key);
    pipeline.hset(key, res);
    pipeline.expire(key, 3600);
    await pipeline.exec();
    return "User updated successfully";
  } catch (error) {
    console.log("error");
    throw error;
  }
};
export const deleteUser = async (_: unknown, args: { user_id: string }) => {
  try {
    const { user_id } = args;
    if (!user_id) {
      throw new GraphQLError("User ID is missing", {
        extensions: {
          code: errorCode.BAD_USER_INPUT,
        },
      });
    }
    await prisma.users.delete({
      where: {
        user_id: Number(user_id),
      },
    });
    await redis.del(`user:${user_id}`);
    return "User deleted successfully";
  } catch (error) {
    console.log("error");
    throw error;
  }
};
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError("Email or password required", 400);
  }
  const user = await prisma.userss.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  const isPasswordCorrected = await bcryptjs.compare(password, user.password);
  if (!isPasswordCorrected) {
    throw new ApiError("Invalid Password", 400);
  }
  const session = await prisma.sessions.create({
    data: {
      user_id: user.user_id,
      token_version: user.token_version ?? 1,
      //   refresh_token: null,
      device: req.headers["user-agent"],
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken({
      user_id: user.user_id,
      sid: session.session_id,
      tokenVersion: user.token_version,
    }),
    generateRefreshToken({
      user_id: user.user_id,
      username: user.username,
      sid: session.session_id,
      tokenVersion: user.token_version,
    }),
  ]);
  await prisma.sessions.update({
    data: {
      refresh_token: refreshToken,
    },
    where: {
      session_id: session.session_id,
    },
  });
  const options: CookieOptions = {
    httpOnly: true,
    secure: process.env.ENVIRONMENT === "DEVELOPMENT" ? false : true,
    sameSite: "strict",
    signed: true,
  };
  res.cookie("accessToken", accessToken, {
    ...options,
    maxAge: 1000 * 60 * 15,
  });
  res.cookie("refreshToken", refreshToken, {
    ...options,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    // path: "/api/auth/refresh",
  });
  const response = new ApiResponse(true, "User logged in success");
  console.log(response);
  return res.status(200).json(response);
});
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const sid = req.user?.sid;
  await prisma.sessions.update({
    where: {
      session_id: sid,
    },
    data: {
      revoked: true,
    },
  });
  const clearOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.ENVIRONMENT !== "DEVELOPMENT",
    sameSite: "strict",
    signed: true,
  };
  res.clearCookie("accessToken", clearOptions);
  res.clearCookie("refreshToken", clearOptions);
  return res.status(200).json(new ApiResponse(true, "Logout success", []));
});
export const logoutfromAllDevices = asyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req?.user?.user_id;
    if (!user_id) {
      throw new ApiError("User id is missing", 400);
    }
    await Promise.all([
      prisma.userss.update({
        data: { token_version: { increment: 1 } },
        where: {
          user_id,
        },
      }),
      prisma.sessions.updateMany({
        where: {
          user_id,
        },
        data: {
          revoked: true,
          expires_at: new Date(Date.now()),
        },
      }),
    ]);
    const clearOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.ENVIRONMENT !== "DEVELOPMENT",
      sameSite: "strict",
      signed: true,
    };
    res.clearCookie("accessToken", clearOptions);
    res.clearCookie("refreshToken", {
      ...clearOptions,
      // path: "/api/auth/refresh",
    });

    return res
      .status(200)
      .json(new ApiResponse(true, "Logout from all devices success", []));
  },
);
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, phone, username, password } = req.body;
  if (!email || !phone || !username || !password) {
    throw new ApiError("All fields are required", 400);
  }
  const user = await prisma.userss.findUnique({
    where: {
      email,
    },
  });
  if (user) {
    throw new ApiError("User already exists", 409);
  }
  const hashedPassword = await bcryptjs.hash(password, 10);
  await prisma.userss.create({
    data: {
      username,
      email,
      phone,
      password: hashedPassword,
    },
  });
  return res.status(201).json(new ApiResponse(true, "User created"));
});
const revokeForReuse = async (sessionId: string, user_id: string) => {
  await prisma.sessions.updateMany({
    //if token is stole then revoked all user session
    where: { session_id: sessionId },
    data: { revoked: true },
  });
  console.warn(
    `⚠️ Refresh token reuse detected: user=${user_id} session=${sessionId}`,
  );
};
export const reGenToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.signedCookies.refreshToken;
  console.log(refreshToken);
  if (!refreshToken) {
    throw new ApiError("Unauthirzed", 401);
  }
  const decoded = jwt.verify(
    refreshToken,
    process.env.REFRESHTOKENKEY as string,
  ) as JwtPayload;

  const sessionId = decoded.sid;
  const user_id = decoded.user_id;
  const tokenVersion = decoded.tokenVersion;
  if (!sessionId || !user_id) {
    throw new ApiError("session not found", 401);
  }
  const dbsession = await prisma.sessions.findUnique({
    where: {
      session_id: sessionId,
    },
    select: {
      refresh_token: true,
      token_version: true,
      revoked: true,
      expires_at: true,
    },
  });
  console.log(sessionId)
  if (!dbsession) {
    throw new ApiError("Session not found", 401);
  }
  if (refreshToken !== dbsession?.refresh_token) {
    console.log("me chala ....")
    await revokeForReuse(sessionId, user_id); // refresh token firse use ho raha h mtlv chori hua h
    throw new ApiError("Invalid Token", 401);
  }
  const user = await prisma.userss.findUnique({
    where: {
      user_id,
    },
  });
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  if (
    tokenVersion !== user.token_version ||
    dbsession.revoked ||
    dbsession.expires_at < new Date(Date.now())
  ) {
    throw new ApiError("Invalid Token", 401);
  }
  const payload = {
    user_id: user.user_id,
    sid: sessionId,
    tokenVersion: user.token_version,
  };
  const [newAccessToken, newRefreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken({
      ...payload,
      username: user?.username,
    }),
  ]);
  console.log("refresh token", refreshToken === dbsession.refresh_token)
  // ATOMIC REFRESH TOKEN ROTATION
  const result = await prisma.sessions.updateMany({
    where: {
      session_id: sessionId,
      refresh_token: refreshToken,
      revoked: false,
      expires_at: {
        gt: new Date(),
      },
    },
    data: {
      refresh_token: newRefreshToken,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });
   console.log(result)
  // Another request may have already rotated the token
  if (result.count !== 1) {
    await revokeForReuse(sessionId, user_id);
    throw new ApiError("Invalid refresh token", 401);
  }
  const options: CookieOptions = {
    httpOnly: true,
    secure: process.env.ENVIRONMENT === "DEVELOPMENT" ? false : true,
    signed: true,
    sameSite: "strict",
  };
  res.cookie("accessToken", newAccessToken, {
    ...options,
    expires: new Date(Date.now() + 1000 * 60 * 15),
  });
  res.cookie("refreshToken", newRefreshToken, {
    ...options,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),  });
  return res.status(200).json(new ApiResponse(true, "Refresh token generated"));
});
