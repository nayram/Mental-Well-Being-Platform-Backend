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

/**
 * @openapi
 * components:
 *   schemas:
 *     UnauthorizedError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example:
 *             Unauthorized
 *     UpdateUserActivityStatusValidationError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example:
 *             Validation failed
 *         validation:
 *           type: object
 *           properties:
 *             source:
 *               type: string
 *               example:
 *                 body
 *             keys:
 *               type: array
 *               items:
 *                 type: string
 *               example:
 *                 ["status"]
 *             message:
 *               type: string
 *               example:
 *                 "status is not allowed to be empty"
 *     CreateUserActivityValidationError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example:
 *             Validation failed
 *         validation:
 *           type: object
 *           properties:
 *             body:
 *               type: object
 *               properties:
 *                 source:
 *                   type: string
 *                   example:
 *                     body
 *                 keys:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     ["user_id", "activity_id", "status"]
 *                 message:
 *                   type: string
 *                   example:
 *                     "user_id is not allowed to be empty"
 *     FetchUserActivityValidationError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example:
 *             Validation failed
 *         validation:
 *           type: object
 *           properties:
 *             query:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   example: "12345678-1234-1234-1234-123456789012"
 *                 status:
 *                   type: string
 *                   example: "PENDING"
 *     CreateUserActivityRequest:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           example: "12345678-1234-1234-1234-123456789012"
 *         activity_id:
 *           type: string
 *           example: "12345678-1234-1234-1234-123456789012"
 *         status:
 *           type: string
 *           enum:
 *             - PENDING
 *             - COMPLETED
 *             - STARTED
 *             - CANCELLED
 *     UpdateUserActivityStatusRequest:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "COMPLETED"
 *           enum:
 *             - PENDING
 *             - COMPLETED
 *             - STARTED
 *             - CANCELLED
 *     CreateUserActivityResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "12345678-1234-1234-1234-123456789012"
 *         user_id:
 *           type: string
 *           example: "12345678-1234-1234-1234-123456789012"
 *         activity_id:
 *           type: string
 *           example: "12345678-1234-1234-1234-123456789012"
 *         status:
 *           type: string
 *           enum:
 *             - PENDING
 *             - COMPLETED
 *             - STARTED
 *             - CANCELLED
 *     UserActivity:
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
 *         status:
 *           type: string
 *           example: "PENDING"
 *           enum:
 *             - PENDING
 *             - COMPLETED
 *             - STARTED
 *             - CANCELLED
 *         difficulty_level:
 *           type: string
 *           example: "BEGINNER"
 *           enum:
 *             - BEGINNER
 *             - INTERMEDIATE
 *             - ADVANCED
 *             - EXPERT
 *         category:
 *           type: string
 *           example: "RELAXATION"
 *           enum:
 *             - RELAXATION
 *             - PHYSICAL_HEALTH
 *             - PRODUCTIVITY
 *             - SELF_ESTEEM
 *             - SOCIAL_CONNECTION
 *         content:
 *           type: string
 *           example: "https://www.youtube.com/watch?v=12345678"
 *         duration:
 *           type: number
 *           format: int64
 *           example: 6000
 *           description: Duration in seconds
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 * /api/v1/user-activities:
 *   get:
 *     tags:
 *       - User Activities
 *     summary: Fetch user activities
 *     security:
 *       - BearerAuth: []
 *     description: Fetch user activities
 *     operationId: fetchUserActivities
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *         example: "12345678-1234-1234-1234-123456789012"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         enum:
 *           - PENDING
 *           - COMPLETED
 *           - STARTED
 *           - CANCELLED
 *         example: PENDING
 *         description: User activity status
 *         required: false
 *     responses:
 *       200:
 *         description: User activities fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/UserActivity'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FetchUserActivityValidationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 *   post:
 *     tags:
 *       - User Activities
 *     summary: Create user activity
 *     security:
 *       - BearerAuth: []
 *     description: Create user activity
 *     operationId: createUserActivity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserActivityRequest'
 *     responses:
 *       201:
 *         description: User activity created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateUserActivityResponse'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateUserActivityValidationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *   patch:
 *      tags:
 *        - User Activities
 *      summary: Update user activity status
 *      security:
 *        - BearerAuth: []
 *      description: Update user activity status
 *      operationId: updateUserActivityStatus
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          required: true
 *          description: User activity ID
 *          example: "12345678-1234-1234-1234-123456789012"
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UpdateUserActivityStatusRequest'
 *      responses:
 *        200:
 *          description: User activity status updated successfully
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserActivity'
 *        400:
 *          description: Bad Request
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UpdateUserActivityStatusValidationError'
 *        401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UnauthorizedError'
 *
 */

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
