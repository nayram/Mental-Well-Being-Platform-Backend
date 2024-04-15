import { Router } from "express";
import { getAllActivities } from "./controller";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "12345678-1234-1234-1234-123456789012"
 *         title:
 *           type: string
 *           example: "Mindful Breathing"
 *         description:
 *           type: string
 *           example: "A simple activity to bring your focus to your breath and reduce stress."
 *         category:
 *           type: string
 *           example: "RELAXATION"
 *           enum:
 *             - RELAXATION
 *             - PHYSICAL_HEALTH
 *             - PRODUCTIVITY
 *             - SELF_ESTEEM
 *             - SOCIAL_CONNECTION
 *         duration:
 *           type: number
 *           format: int64
 *           example: 6000
 *           description: Duration in seconds
 *         difficulty_level:
 *           type: string
 *           example: "BEGINNER"
 *           enum:
 *             - BEGINNER
 *             - INTERMEDIATE
 *             - ADVANCED
 *             - EXPERT
 *         content:
 *           type: string
 *           example: "Inhale slowly through your nose, hold for a few seconds, then exhale slowly."
 *         status:
 *           type: string
 *           example: "ACTIVE"
 *           enum:
 *             - ACTIVE
 *             - DELETED
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     GetAllActivitiesResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Activity'
 * /activities:
 *   get:
 *     description: Get all activities
 *     operationId: getAllActivities
 *     tags:
 *       - Activities
 *     responses:
 *       200:
 *         description: Get all activities
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetAllActivitiesResponse'
 * 
 */
const v1ActivityRouter = router.get("/", getAllActivities);

export const activityRouter = router.use("/v1/activities", v1ActivityRouter);
