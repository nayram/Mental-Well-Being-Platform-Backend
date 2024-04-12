import { Router } from "express";
import { createUser } from "./controller";

const router = Router();
const v1UserRouter = router.post("/", createUser);
export const userRouter = router.use("/v1/users", v1UserRouter);
