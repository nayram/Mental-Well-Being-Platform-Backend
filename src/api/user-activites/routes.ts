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
import { ERROR_TYPES, setErrorStatus, httpStatus } from "../../helpers";

const router = Router();

const ERR_MAP = {
  [ERROR_TYPES.ERR_MODEL_VALIDATION]: httpStatus.UN_PROCESSABLE_ENTITY,
  [ERROR_TYPES.ERR_VALIDATION]: httpStatus.BAD_REQUEST,
};

const v1UserActivityRouter = router
  .get("/", validateFetchUserActivityRequest, fetchUserActivity)
  .post("/", validateCreateUserActivityRequest, createUserActivity)
  .patch(
    "/:id",
    validateUpdateUserActivityStatusRequest,
    updateUserActivityStatus,
  )
  .use(setErrorStatus(ERR_MAP));

export const userActivityRouter = router.use(
  "/v1/user-activities",
  v1UserActivityRouter,
);
