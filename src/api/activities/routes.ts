import { Router } from "express";
import { getAllActivities } from "./controller";

const router = Router();

const v1ActivityRouter = router.get("/", getAllActivities);

export const activityRouter = router.use("/v1/activities", v1ActivityRouter);
