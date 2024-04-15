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

/**
 * @openapi
 * components:
 *   schemas:
 *     UnProcessableEntity:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example:
 *             Activity not found
 *     InternalServerError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example:
 *             Internal server error
 *     ValidationError:
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
 *                     - username
 *                     - email
 *                     - password
 *                 message:
 *                   type: string
 *                   example:
 *                     \"username\" must be a string
 *     UserAlreadyExists:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example:
 *             User already exists
 *     InvalidUserEmailOrPassword:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example:
 *             Invalid email or password
 *     UserNotFound:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example:
 *             User not found
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     UserLoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'

 * '/api/v1/auth/signup':
 *   post:
 *     tags:
 *       - Auth
 *     summary: Create user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
  *              type: object
  *              properties:  
  *                message:
  *                  type: string
  *                  example: "User created successfully"
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       422:
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserAlreadyExists'
 
 * /api/v1/auth/login:
 *     post:
 *       tags:
 *         - Auth
 *       summary: Login user
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *       responses:
 *         200:
 *           description: User Logged in
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/UserLoginResponse'
 *         400:
 *           description: Bad Request
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ValidationError'
 *         401:
 *           description: Unauthorized
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/InvalidUserEmailOrPassword'
 *         500:
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/InternalServerError'
 */

const v1UserRouter = router
  .post("/signup", validateCreateUserRequest, createUser)
  .post("/login", validateLoginUserRequest, loginUser)
  .use(setErrorStatus(ERR_MAP));

export const userRouter = router.use("/v1/auth", v1UserRouter);
