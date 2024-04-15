import { sql } from "@pgkit/client";
import joi from "joi";
import config from "config";
import { sign } from "jsonwebtoken";
import { dbClient } from "../lib/postgres-utils/resource";
import { ActivityModel } from "../models";
import { ERROR_TYPES } from "./errors";

const jwtSecret = config.get<string>("jwt_secret");
const jwtExpiry = config.get<string>("jwt_expires_at");

const { Category, DifficultyLevel, Status } = ActivityModel;

export const Fixtures = {
  activities: [
    {
      title: "Mindful Breathing",
      description:
        "A simple activity to bring your focus to your breath and reduce stress.",
      category: Category.RELAXATION,
      duration: 300,
      difficulty_level: DifficultyLevel.BEGINNER,
      content:
        "Inhale slowly through your nose, hold for a few seconds, then exhale slowly.",
      status: Status.ACTIVE,
    },
    {
      title: "Yoga for Beginners",
      description:
        "Start your yoga journey with some basic poses aimed at improving flexibility and relaxation.",
      category: Category.PHYSICAL_HEALTH,
      duration: 1800,
      difficulty_level: DifficultyLevel.BEGINNER,
      content:
        "Follow a series of beginner-friendly yoga poses, focusing on your breath and alignment.",
      status: Status.ACTIVE,
    },
    {
      title: "Pomodoro Technique",
      description:
        "Improve productivity by breaking your work into intervals, traditionally 25 minutes in length, separated by short breaks.",
      category: Category.PRODUCTIVITY,
      duration: 1500,
      difficulty_level: DifficultyLevel.BEGINNER,
      content:
        "Work for 25 minutes, then take a 5-minute break. Repeat the cycle.",
      status: Status.ACTIVE,
    },
  ],
};

export const closeDb = async () => {
  await dbClient.end();
};

export const truncateTable = async (tableName: string) => {
  await dbClient.query(
    sql`TRUNCATE TABLE ${sql.identifier([tableName])} CASCADE;`,
  );
};

export const dataValidation = {
  joi,
  validateSchema: async <T>(
    schema: joi.ObjectSchema | joi.Schema,
    data: T,
  ): Promise<T> => {
    const { error, value } = schema.validate(data);
    if (error) {
      const vaildationError = new Error();
      vaildationError.message = error.message.replace(/\"/g, "");
      vaildationError.name = ERROR_TYPES.ERR_VALIDATION;
      throw vaildationError;
    }
    return value;
  },
};

export const httpStatus = {
  CREATED: 201,
  OK: 200,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  UN_PROCESSABLE_ENTITY: 422,
  BAD_REQUEST: 400,
  AUTHENTICATION_FAILED: 403,
  AUTHORIZATION_FAILED: 401,
};

export const generateSignedToken = (id: string, expiresIn = jwtExpiry) => {
  const token = sign({ id }, jwtSecret, {
    expiresIn,
  });
  return token;
};
