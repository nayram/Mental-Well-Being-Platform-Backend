import joi from "joi";
import { celebrate, Segments } from "celebrate";

const userJoiSchema = {
  username: joi.string().min(4).required(),
  email: joi.string().email().required(),
  password: joi.string().min(4).required(),
};

const userLoginJoiSchema = {
  email: joi.string().email().required(),
  password: joi.string().min(4).required(),
};

export const validateCreateUserRequest = celebrate({
  [Segments.BODY]: joi.object().keys(userJoiSchema),
});

export const validateLoginUserRequest = celebrate({
  [Segments.BODY]: joi.object().keys(userLoginJoiSchema),
});
