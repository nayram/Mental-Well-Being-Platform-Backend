import config from "config";
import { Request, Response, NextFunction } from "express";
import {
  JwtPayload,
  verify,
  JsonWebTokenError,
  TokenExpiredError,
} from "jsonwebtoken";
import { ERROR_TYPES, httpStatus } from "../../helpers";

const jwtSecret = config.get<string>("jwt_secret");

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.headers.authorization) {
      res.status(httpStatus.UNAUTHORIZED).send({ message: "Unauthorized" });
    } else {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        res
          .status(httpStatus.UNAUTHORIZED)
          .json({ error: { message: "Unauthorized" } });
      }
      const verifiedToken = await verifyAsync(token);

      if (!verifiedToken) {
        res
          .status(httpStatus.UNAUTHORIZED)
          .send({ name: "UnauthorizedError", message: "Unauthorized" });
      }
      next();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    res
      .status(httpStatus.UNAUTHORIZED)
      .send({ name: "UnauthorizedError", message });
  }
};

const verifyAsync = async (token: string): Promise<JwtPayload> =>
  new Promise((res, rej) => {
    verify(token, jwtSecret, (err: unknown, data) => {
      if (err) {
        if (err instanceof TokenExpiredError) {
          const error = new Error();
          error.name = ERROR_TYPES.ERR_UNAUTHORIZED;
          error.message = "Token expired";
          return rej(error);
        }
        if (err instanceof JsonWebTokenError) {
          const error = new Error();
          error.name = ERROR_TYPES.ERR_UNAUTHORIZED;
          error.message = "Token is invalid";
          return rej(error);
        }
        const error = new Error();
        error.name = ERROR_TYPES.ERR_UNAUTHORIZED;
        error.message = "Authorization failed";
        return rej(error);
      }
      return res(data as JwtPayload);
    });
  });
