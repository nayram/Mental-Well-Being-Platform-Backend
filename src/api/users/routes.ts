import { Router } from "express";
import { createUser, loginUser } from "./controller";
import {
  validateCreateUserRequest,
  validateLoginUserRequest,
} from "./validators";
import { httpStatus, ERROR_TYPES, setErrorStatus } from "../../helpers";
const router = Router();

const ERR_MAP = {
  [ERROR_TYPES.ERR_MODEL_VALIDATION]: httpStatus.UN_PROCESSABLE_ENTITY,
  [ERROR_TYPES.ERR_VALIDATION]: httpStatus.BAD_REQUEST,
  [ERROR_TYPES.ERR_INVALID_USER_EMAIL_OR_PASSWORD]: httpStatus.UNAUTHORIZED,
};

const v1UserRouter = router
  .post("/signup", validateCreateUserRequest, createUser)
  .post("/login", validateLoginUserRequest, loginUser)
  .use(setErrorStatus(ERR_MAP));

export const userRouter = router.use("/v1/auth", v1UserRouter);
