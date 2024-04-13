import { sql } from "@pgkit/client";
import { omit } from 'ramda'
import { logger, dbClient } from '../../lib'
import { dataValidation } from "../../helpers/utils";
import { ERROR_TYPES } from "../../helpers/errors";

const log = logger({ serviceName: "models" });

export const UserTableName = "user";

const UserModelConstraintErrors = {
  "UQ_e12875dfb3b1d92d7d7c5377e22": "email already exists",
  "UQ_9949557d0e1b2c19e5344c171e9": "username already exists",
}

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

const validateUserModel = (user: User) => {
  const { validateSchema, joi } = dataValidation;
  const schema = joi.object({
    username: joi.string().min(4).required(),
    email: joi.string().email().required(),
    password: joi.string().min(4).required(),
  });
  const data = validateSchema(schema, user);
  return data;
};

const validateEmailAndPassword = async (
  email: string,
  password: string,
): Promise<{ email: string; password: string }> => {
  const { validateSchema, joi } = dataValidation;
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(4).required(),
  });
  const data = validateSchema(schema, { email, password });
  return data;
};

const handleUserModelErrors = (err: any) => {
  const error = new Error();
  error.name = ERROR_TYPES.ERR_MODEL_VALIDATION;
  if (err.cause.error.constraint in UserModelConstraintErrors) {
    error.message = UserModelConstraintErrors[err.cause.error.constraint as keyof typeof UserModelConstraintErrors];
  } else {
    log.error(err);
  }
  throw error;
}

const omitPasswordField = (user: UserSchema): Omit<UserSchema, 'password'> => omit(['password'], user)

export const createUser = async ({
  username,
  email,
  password,
}: User): Promise<Omit<UserSchema, 'password'>> => {
  const validUser = await validateUserModel({ username, email, password });
  const query = sql<UserSchema>`INSERT INTO ${sql.identifier([UserTableName])} (username, email, password) VALUES (${validUser.username}, ${validUser.email}, ${validUser.password});`;
  const { rows } = await dbClient.query(query).catch(handleUserModelErrors);
  return omitPasswordField(rows[0]);
};

export const getUserByEmailAndPassword = async (
  email: string,
  password: string,
): Promise<Omit<UserSchema, 'password'> | null> => {
  const values = await validateEmailAndPassword(email, password);
  const {rows}  = await dbClient.query(
    sql<UserSchema>`SELECT * FROM ${sql.identifier([UserTableName])} WHERE email = ${values.email} AND password = ${values.password};`,
  );
  return rows.length > 0 ?  omitPasswordField(rows[0]) : null
};
