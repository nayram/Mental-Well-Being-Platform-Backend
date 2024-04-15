import joi from "joi";
import { celebrate, Segments } from "celebrate";
import { UserActivityModel } from "../../models";

export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const createUserActivitySchema = {
  user_id: joi.string().regex(uuidPattern).required(),
  activity_id: joi.string().required(),
  status: joi
    .string()
    .valid(...Object.keys(UserActivityModel.ActivityStatus))
    .required(),
};

const updateUserActivityStatusSchema = {
  status: joi
    .string()
    .valid(...Object.keys(UserActivityModel.ActivityStatus))
    .required(),
};

export const validateCreateUserActivityRequest = celebrate({
  [Segments.BODY]: joi.object().keys(createUserActivitySchema),
});

export const validateUpdateUserActivityStatusRequest = celebrate({
  [Segments.PARAMS]: joi
    .object()
    .keys({ id: joi.string().regex(uuidPattern).required() }),
  [Segments.BODY]: joi.object().keys(updateUserActivityStatusSchema),
});

export const validateFetchUserActivityRequest = celebrate({
  [Segments.QUERY]: joi.object().keys({
    user_id: joi.string().regex(uuidPattern).required(),
    status: joi
      .string()
      .valid(...Object.keys(UserActivityModel.ActivityStatus))
      .optional(),
  }),
});
