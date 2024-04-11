import { Response, Request } from 'express'
import {  ActivityService  } from '../../services'

export const getAllActivities = async (_: Request, res: Response) => {
    const activities = await ActivityService.getAllActivities();
    return res.status(200).json(activities);
}
