import { UserModel, ActivityModel, UserActivityModel } from "../../../models";
import { closeDb, truncateTable, Fixtures } from "../../../helpers";

import { updateUserActivityStatusById } from "..";

describe("Services: Update User Activities Status", () => {
  let createdUser: UserModel.UserSchema | null;
  afterAll(async () => {
    await closeDb();
  });

  afterEach(async () => {
    await truncateTable(UserActivityModel.UserActivityTableName);
    await truncateTable(UserModel.UserTableName);
    await truncateTable(ActivityModel.TableName);
  });

  beforeEach(async () => {
    const user = {
      username: "nayram_test_user_activity",
      email: "nayram+user+activity@me.com",
      password: "password",
    };
    await UserModel.createUser(user);
    createdUser = await UserModel.getUserByEmail(user.email);
    await ActivityModel.createActivities(Fixtures.activities);
  });

  describe("Success", () => {
    test("should update user activity status", async () => {
      const [pendingActivity] = await ActivityModel.getAllActivities();

      const userActivity = {
        user_id: createdUser?.id || "",
        activity_id: pendingActivity.id,
        status: UserActivityModel.ActivityStatus.PENDING,
      };

      await UserActivityModel.createUserActivity(userActivity);

      const [createdUserActivity] =
        await UserActivityModel.getUserActivityByUserIdAndStatus({
          user_id: createdUser?.id || "",
          status: UserActivityModel.ActivityStatus.PENDING,
        });

      await updateUserActivityStatusById({
        id: createdUserActivity.id,
        status: UserActivityModel.ActivityStatus.COMPLETED,
      });

      const [updatedUserActivity] =
        await UserActivityModel.getUserActivityByUserId(createdUser?.id || "");

      expect(updatedUserActivity.status).toBe(
        UserActivityModel.ActivityStatus.COMPLETED,
      );
    });
  });

  describe("Failure", () => {
    test.each([["id"], ["status"]])(
      "should throw error if %s is missing",
      async (field) => {
        const userActivity: Record<string, string> = {
          id: "421d037d-f462-4e0c-beda-f4b63020d3d0",
          status: UserActivityModel.ActivityStatus.COMPLETED,
        };
        userActivity[field] = "";
        await expect(
          updateUserActivityStatusById(userActivity as unknown as any),
        ).rejects.toThrow(`${field} is not allowed to be empty`);
      },
    );
  });
});
