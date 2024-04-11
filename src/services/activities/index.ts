import { getAllActivities as getAllActivitiesModel } from '../../ model/activities';

export const getAllActivities = async () => {
    return await getAllActivitiesModel();
}
