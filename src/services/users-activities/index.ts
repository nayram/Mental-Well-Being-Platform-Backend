import { UserActivityModel, ActivityModel } from "../../models";
import {
  dataValidation,
  throwUserActivityDoesNotExistError,
} from "../../helpers";
export const UserActivityTableName = "userActivty";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const validateUserActivityModel = async (
  userActivity: UserActivityModel.UserActivity,
) => {
  const { validateSchema, joi } = dataValidation;
  const schema = joi.object({
    user_id: joi.string().regex(uuidPattern).required(),
    activity_id: joi.string().required(),
    status: joi.string().required(),
  });
  const data = await validateSchema(schema, userActivity);
  return data;
};

const validateIdAndStatus = async (
  id: string,
  status: UserActivityModel.ActivityStatus,
) => {
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
  status: UserActivityModel.ActivityStatus,
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
}: UserActivityModel.UserActivity): Promise<UserActivityModel.UserActivitySchema> => {
  const validData = await validateUserActivityModel({
    user_id,
    activity_id,
    status,
  });
  return await UserActivityModel.createUserActivity(validData);
};

export const updateUserActivityStatusById = async ({
  id,
  status,
}: {
  id: string;
  status: UserActivityModel.ActivityStatus;
}) => {
  const validData = await validateIdAndStatus(id, status);
  const activity = await UserActivityModel.getUserActivityById(validData.id);
  if (!activity) {
    throwUserActivityDoesNotExistError();
  }
  return await UserActivityModel.updateUserActivityStatusById(validData);
};

export const getUserActivityByUserId = async (
  user_id: string,
): Promise<ActivityModel.ActivitySchema[]> => {
  const { validateSchema, joi } = dataValidation;
  const schema = joi.object({
    user_id: joi.string().regex(uuidPattern).required(),
  });
  const data = await validateSchema(schema, { user_id });
  return await UserActivityModel.getUserActivityDetailsByUserId(data.user_id);
};

export const getUserActivityByUserIdAndStatus = async ({
  user_id,
  status,
}: {
  user_id: string;
  status: UserActivityModel.ActivityStatus;
}): Promise<ActivityModel.ActivitySchema[]> => {
  const data = await validateUserIdAndStatus(user_id, status);
  return await UserActivityModel.getUserActivityDetailsByUserIdAndStatus(data);
};
