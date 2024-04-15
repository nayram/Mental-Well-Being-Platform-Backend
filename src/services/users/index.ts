import * as bcrypt from "bcrypt";
import config from "config";
import { omit } from "ramda";
import { UserModel } from "../../models";
import {
  dataValidation,
  invalidUserEmailOrPasswordError,
  generateSignedToken,
} from "../../helpers";

const saltRounds = config.get<number>("salt_rounds");

const omitPassord = (user: UserModel.UserSchema) => omit(["password"], user);

const validateUser = async (user: UserModel.User): Promise<UserModel.User> => {
  const { validateSchema, joi } = dataValidation;
  const schema = joi.object({
    username: joi.string().min(4).required(),
    email: joi.string().email().required(),
    password: joi.string().min(4).required(),
  });
  const data = await validateSchema(schema, user);
  return data;
};

const validateEmailAndPassowrd = async (
  email: string,
  password: string,
): Promise<{ email: string; password: string }> => {
  const { validateSchema, joi } = dataValidation;
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(4).required(),
  });
  const data = await validateSchema(schema, { email, password });
  return data;
};

export const createUser = async ({
  username,
  email,
  password,
}: UserModel.User) => {
  const validUser = await validateUser({ username, email, password });
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(validUser.password, salt);
  return await UserModel.createUser({
    username: validUser.username,
    email: validUser.email,
    password: hashedPassword,
  });
};

export const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{
  user: Omit<UserModel.UserSchema, "password">;
  token: string;
} | null> => {
  const validData = await validateEmailAndPassowrd(email, password);
  const user = await UserModel.getUserByEmail(validData.email);
  if (!user) {
    invalidUserEmailOrPasswordError();
  }
  const validPassword = await bcrypt.compare(
    validData.password,
    user?.password as string,
  );
  if (!validPassword) {
    return invalidUserEmailOrPasswordError();
  }

  const token = generateSignedToken(user?.id as string);

  return {
    user: { ...omitPassord(user || ({} as UserModel.UserSchema)) },
    token,
  };
};
