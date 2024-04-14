import { sql } from "@pgkit/client";
import { logger, dbClient } from "../../lib";
import { dataValidation } from "../../helpers/utils";
import { ERROR_TYPES } from "../../helpers/errors";

const log = logger({ serviceName: "models" });

export const UserTableName = "user";

const UserModelConstraintErrors = {
  UQ_e12875dfb3b1d92d7d7c5377e22: "email already exists",
  UQ_9949557d0e1b2c19e5344c171e9: "username already exists",
};

export type User = {
  username: string;
  email: string;
  password: string;
};

export type UserSchema = User & {
  id: string;
  created_at: Date;
  updated_at: Date;
};

const validateUserModel = async (user: User) => {
  const { validateSchema, joi } = dataValidation;
  const schema = joi.object({
    username: joi.string().min(4).required(),
    email: joi.string().email().required(),
    password: joi.string().min(4).required(),
  });
  const data = await validateSchema(schema, user);
  return data;
};

const validateEmail = async (email: string): Promise<string> => {
  const { validateSchema, joi } = dataValidation;
  
  const schema = joi.object({ email: joi.string().email().required() });
  const data = await validateSchema(schema, { email });
  return data.email;
};

const handleUserModelErrors = (err: any) => {
  const error = new Error();
  if (err.cause.error.constraint in UserModelConstraintErrors) {
    error.name = ERROR_TYPES.ERR_MODEL_VALIDATION;
    error.message =
      UserModelConstraintErrors[
        err.cause.error.constraint as keyof typeof UserModelConstraintErrors
      ];
  } else {
    log.error(err);
  }
  throw error;
};

export const createUser = async ({
  username,
  email,
  password,
}: User): Promise<UserSchema> => {
  const validUser = await validateUserModel({ username, email, password });
  const query = sql<UserSchema>`INSERT INTO ${sql.identifier([UserTableName])} (username, email, password) VALUES (${validUser.username}, ${validUser.email}, ${validUser.password});`;
  const { rows } = await dbClient.query(query).catch(handleUserModelErrors);
  return rows[0];
};

export const getUserByEmail = async (
  email: string,
): Promise<UserSchema | null> => {
  const validEmail = await validateEmail(email);
  const { rows } = await dbClient.query(
    sql<UserSchema>`SELECT * FROM ${sql.identifier([UserTableName])} WHERE email = ${validEmail};`,
  );
  return rows.length > 0 ? rows[0] : null;
};
