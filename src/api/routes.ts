import { Router } from "express";
import { activityRouter } from "./activities/routes";
import { userRouter } from "./users/routes";

export const appRoutes = Router().use(activityRouter).use(userRouter);
