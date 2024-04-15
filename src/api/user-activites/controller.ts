import { Request, Response, NextFunction } from "express";
import { UserActivityService } from "../../services";
import { UserActivityModel } from "../../models";
import { httpStatus } from "../../helpers";

export const createUserActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user_id, activity_id, status } = req.body;
    const activity = await UserActivityService.createUserActivity({
      user_id,
      activity_id,
      status,
    });
    return res.status(httpStatus.CREATED).json(activity);
  } catch (error) {
    next(error);
  }
};

export const updateUserActivityStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const activity = await UserActivityService.updateUserActivityStatusById({
      id,
      status,
    });
    return res.status(httpStatus.OK).json(activity);
  } catch (error) {
    next(error);
  }
};

export const fetchUserActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      user_id,
      status,
    }: { user_id: string; status?: UserActivityModel.ActivityStatus } =
      req.query as {
        user_id: string;
        status?: UserActivityModel.ActivityStatus;
      };
    if (status) {
      const acitivities =
        await UserActivityService.getUserActivityByUserIdAndStatus({
          user_id,
          status,
        });
      return res.status(httpStatus.OK).json(acitivities);
    }
    const acitivities =
      await UserActivityService.getUserActivityByUserId(user_id);
    return res.status(httpStatus.OK).json(acitivities);
  } catch (error) {
    next(error);
  }
};
