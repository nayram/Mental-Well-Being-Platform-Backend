import { NextFunction, Request, Response } from "express";
import { UserService } from "../../services";
import { httpStatus } from "../../helpers";
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, email, password } = req.body;
    await UserService.createUser({ username, email, password });
    res
      .status(httpStatus.CREATED)
      .json({ message: "user created successfully" });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const user = await UserService.loginUser({ email, password });
    res.status(httpStatus.OK).json(user);
  } catch (error) {
    next(error);
  }
};
