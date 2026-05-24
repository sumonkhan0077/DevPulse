import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import sendResponse from "../utils/sendResponse";
import { config } from "../config/env";
import { pool } from "../db";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader  = req.headers.authorization;

    if (!authHeader) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "jwt missing!",
      });
    }
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token as string,
      config.jwt_secret as string,
    ) as JwtPayload;

    const userData = await pool.query(`SELECT * FROM users WHERE id=$1`, [
      decoded.id,
    ]);

    const user = userData.rows[0];

    if (!user) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "User not found!",
      });
    }

    req.user = user;
    console.log("from middleware", req?.user);
    next();
  } catch (error) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Invalid or expired token!",
    });
  }
};


type Role = "contributor" | "maintainer";

export const authorizeRoles = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        error: "Missing, expired, or invalid JWT token",
      });
    }

    if (!roles.includes(req.user.role as Role)) {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
        error: "Valid token but insufficient role/permissions",
      });
    }

    return next();
  };
};