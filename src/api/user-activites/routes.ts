import { Router } from "express";
import {
  createUserActivity,
  updateUserActivityStatus,
  fetchUserActivity,
} from "./controller";
import {
  validateCreateUserActivityRequest,
  validateUpdateUserActivityStatusRequest,
  validateFetchUserActivityRequest,
} from "./validators";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ERROR_TYPES, setErrorStatus, httpStatus } from "../../helpers";

const router = Router();

const ERR_MAP = {
  [ERROR_TYPES.ERR_MODEL_VALIDATION]: httpStatus.UN_PROCESSABLE_ENTITY,
  [ERROR_TYPES.ERR_VALIDATION]: httpStatus.BAD_REQUEST,
};

const v1UserActivityRouter = router
  .get("/", authMiddleware, validateFetchUserActivityRequest, fetchUserActivity)
  .post(
    "/",
    authMiddleware,
    validateCreateUserActivityRequest,
    createUserActivity,
  )
  .patch(
    "/:id",
    authMiddleware,
    validateUpdateUserActivityStatusRequest,
    updateUserActivityStatus,
  )
  .use(setErrorStatus(ERR_MAP));

export const userActivityRouter = router.use(
  "/v1/user-activities",
  v1UserActivityRouter,
);
