import * as bcrypt from "bcrypt";
import config from "config";
import { UserModel } from "../../models";
import { dataValidation } from "../../helpers/utils";

const saltRounds = config.get<number>("salt_rounds");


const validateUser = async (user: UserModel.User): Promise<UserModel.User> => {
  const { validateSchema, joi } = dataValidation;
  const schema = joi.object({
    username: joi.string().min(4).required(),
    email: joi.string().email().required(),
    password: joi.string().min(4).required(),
  });
  const data = validateSchema(schema, user);
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
