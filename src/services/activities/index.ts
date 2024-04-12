import { getAllActivities as getAllActivitiesModel } from "../../models/activities";

export const getAllActivities = async () => {
  return await getAllActivitiesModel();
};
