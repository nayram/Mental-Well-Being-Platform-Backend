import { Router } from "express";
import { createUser } from "./controller";
import { validateCreateUserRequest } from './validator-schema'

const router = Router();

const v1UserRouter = router.post("/", validateCreateUserRequest, createUser);

export const userRouter = router.use("/v1/users", v1UserRouter);
