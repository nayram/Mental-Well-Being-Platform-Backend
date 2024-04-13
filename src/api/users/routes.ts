import { Router } from "express";
import { createUser } from "./controller";
import { validateCreateUserRequest } from "./validator-schema";
import { httpStatus, ERROR_TYPES, setErrorStatus } from "../../helpers";
const router = Router();

const ERR_MAP = {
  [ERROR_TYPES.ERR_MODEL_VALIDATION]: httpStatus.UN_PROCESSABLE_ENTITY,
  [ERROR_TYPES.ERR_VALIDATION]: httpStatus.BAD_REQUEST,
};

const v1UserRouter = router
  .post("/", validateCreateUserRequest, createUser)
  .use(setErrorStatus(ERR_MAP));

export const userRouter = router.use("/v1/users", v1UserRouter);
