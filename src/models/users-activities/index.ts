import { logger, dbClient, sql } from "../../lib";
import { dataValidation, ERROR_TYPES } from "../../helpers";
import { TableName as ActivityTableName, ActivitySchema } from "../activities";

const log = logger({ serviceName: "models" });

export const UserActivityTableName = "userActivty";

export const UserActivityModelConstraintErrors = {
  UQ_user_activity_id_user_id: "activity already exists",
  FK_user_id: "user not found",
  FK_activity_id: "activity not found",
};

export enum ActivityStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  STARTED = "STARTED",
}

export type UserActivity = {
  user_id: string;
  activity_id: string;
  status: ActivityStatus;
};

export type UserActivitySchema = UserActivity & {
  id: string;
  created_at: Date;
  updated_at: Date;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const handleUserActivityModelErrors = (err: any) => {
  const error = new Error();
  if (err.cause.error.constraint in UserActivityModelConstraintErrors) {
    error.name = ERROR_TYPES.ERR_MODEL_VALIDATION;
    error.message =
      UserActivityModelConstraintErrors[
        err.cause.error
          .constraint as keyof typeof UserActivityModelConstraintErrors
      ];
  } else {
    error.name = ERROR_TYPES.ERR_MODEL_VALIDATION;
    log.error(err);
  }
  throw error;
};

const validateUserActivityModel = async (userActivity: UserActivity) => {
  const { validateSchema, joi } = dataValidation;
  const schema = joi.object({
    user_id: joi.string().regex(uuidPattern).required(),
    activity_id: joi.string().required(),
    status: joi.string().required(),
  });
  const data = await validateSchema(schema, userActivity);
  return data;
};

const validateIdAndStatus = async (id: string, status: ActivityStatus) => {
  const { validateSchema, joi } = dataValidation;
  const schema = joi.object({
    id: joi.string().regex(uuidPattern).required(),
    status: joi.string().required(),
  });
  const data = await validateSchema(schema, { id, status });
  return data;
};

const validateUserIdAndStatus = async (
  user_id: string,
  status: ActivityStatus,
) => {
  const { validateSchema, joi } = dataValidation;
  const schema = joi.object({
    user_id: joi.string().regex(uuidPattern).required(),
    status: joi.string().required(),
  });
  const data = await validateSchema(schema, { user_id, status });
  return data;
};

export const createUserActivity = async ({
  user_id,
  activity_id,
  status,
}: UserActivity): Promise<UserActivitySchema> => {
  const validData = await validateUserActivityModel({
    user_id,
    activity_id,
    status,
  });
  const query = sql<UserActivitySchema>`INSERT INTO ${sql.identifier([UserActivityTableName])} (user_id, activity_id, status) VALUES (${validData.user_id}, ${validData.activity_id}, ${validData.status});`;
  await dbClient.query(query).catch(handleUserActivityModelErrors);
  const { rows } = await dbClient.query(
    sql<UserActivitySchema>`SELECT * FROM ${sql.identifier([UserActivityTableName])} WHERE user_id = ${validData.user_id} AND activity_id = ${validData.activity_id};`,
  );
  return rows[0];
};

export const updateUserActivityStatusById = async ({
  id,
  status,
}: {
  id: string;
  status: ActivityStatus;
}) => {
  const validData = await validateIdAndStatus(id, status);
  const query = sql<ActivitySchema>`UPDATE "userActivty" SET status = ${validData.status} WHERE id = ${validData.id};`;
  await dbClient.query(query);
  const { rows } = await dbClient.query(
    sql<UserActivitySchema>`SELECT * FROM ${sql.identifier([UserActivityTableName])} WHERE id = ${validData.id};`,
  );
  return rows[0];
};

export const getUserActivityById = async (
  id: string,
): Promise<UserActivitySchema> => {
  const { validateSchema, joi } = dataValidation;
  const schema = joi.object({
    id: joi.string().regex(uuidPattern).required(),
  });
  const data = await validateSchema(schema, { id });
  const { rows } = await dbClient.query(
    sql<UserActivitySchema>`SELECT * FROM ${sql.identifier([UserActivityTableName])} WHERE id = ${data.id};`,
  );
  return rows[0];
};

export const getUserActivityByUserId = async (
  user_id: string,
): Promise<UserActivitySchema[]> => {
  const { validateSchema, joi } = dataValidation;
  const schema = joi.object({
    user_id: joi.string().regex(uuidPattern).required(),
  });
  const data = await validateSchema(schema, { user_id });
  const { rows } = await dbClient.query(
    sql<UserActivitySchema>`SELECT * FROM ${sql.identifier([UserActivityTableName])} WHERE user_id = ${data.user_id};`,
  );
  return rows;
};

export const getUserActivityByUserIdAndStatus = async ({
  user_id,
  status,
}: {
  user_id: string;
  status: ActivityStatus;
}): Promise<UserActivitySchema[]> => {
  const data = await validateUserIdAndStatus(user_id, status);
  const query = sql<UserActivitySchema>`SELECT * FROM ${sql.identifier([UserActivityTableName])} WHERE user_id = ${data.user_id} and status = ${data.status};`;
  const { rows } = await dbClient.query(query);
  return rows;
};

export const getUserActivityDetailsByUserId = async (
  user_id: string,
): Promise<ActivitySchema[]> => {
  const { validateSchema, joi } = dataValidation;
  const schema = joi.object({
    user_id: joi.string().regex(uuidPattern).required(),
  });
  const data = await validateSchema(schema, { user_id });
  const query = sql<ActivitySchema>`SELECT activity.id as id, activity.title, activity.description, activity.category, activity.duration, activity.difficulty_level, activity.content,  ${sql.identifier([UserActivityTableName])}.status
   FROM ${sql.identifier([UserActivityTableName])} 
   INNER JOIN ${sql.identifier([ActivityTableName])} AS activity ON ${sql.identifier([UserActivityTableName])}.activity_id = ${sql.identifier([ActivityTableName])}.id
   WHERE user_id = ${data.user_id};`;
  const { rows } = await dbClient.query(query);
  return rows;
};

export const getUserActivityDetailsByUserIdAndStatus = async ({
  user_id,
  status,
}: {
  user_id: string;
  status: ActivityStatus;
}): Promise<ActivitySchema[]> => {
  const data = await validateUserIdAndStatus(user_id, status);
  const query = sql<ActivitySchema>`SELECT activity.id as id, activity.title, activity.description, activity.category, activity.duration, activity.difficulty_level, activity.content, ${sql.identifier([UserActivityTableName])}.status
  FROM ${sql.identifier([UserActivityTableName])} 
  INNER JOIN ${sql.identifier([ActivityTableName])} AS activity ON ${sql.identifier([UserActivityTableName])}.activity_id = ${sql.identifier([ActivityTableName])}.id
  WHERE user_id = ${user_id} AND ${sql.identifier([UserActivityTableName])}.status = ${data.status};`;
  const { rows } = await dbClient.query(query);
  return rows;
};
