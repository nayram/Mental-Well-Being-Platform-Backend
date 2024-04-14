import { UserModel, ActivityModel } from "../..";
import {
  createUserActivity,
  getUserActivityByUserIdAndStatus,
  UserActivityTableName,
  ActivityStatus,
} from "..";
import { closeDb, truncateTable, Fixtures } from "../../../helpers";

describe("Models: Get All User Activities", () => {
  let createdUser: UserModel.UserSchema | null;
  afterAll(async () => {
    await closeDb();
  });

  afterEach(async () => {
    await truncateTable(UserActivityTableName);
    await truncateTable(UserModel.UserTableName);
    await truncateTable(ActivityModel.TableName);
  });

  beforeEach(async () => {
    await truncateTable(UserModel.UserTableName);
    await truncateTable(ActivityModel.TableName);
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
    test("should get user activities by status", async () => {
      const [pendingActivity, ...completedActivities] =
        await ActivityModel.getAllActivities();
      await createUserActivity({
        user_id: createdUser?.id || "",
        activity_id: pendingActivity.id,
        status: ActivityStatus.PENDING,
      });
      for (const activity of completedActivities) {
        await createUserActivity({
          user_id: createdUser?.id || "",
          activity_id: activity.id,
          status: ActivityStatus.COMPLETED,
        });
      }
      expect(
        (
          await getUserActivityByUserIdAndStatus({
            user_id: createdUser?.id || "",
            status: ActivityStatus.PENDING,
          })
        ).length,
      ).toBe(1);
      expect(
        (
          await getUserActivityByUserIdAndStatus({
            user_id: createdUser?.id || "",
            status: ActivityStatus.COMPLETED,
          })
        ).length,
      ).toBe(completedActivities.length);
    });
  });

  describe("Failure", () => {
    test.each([["user_id"], ["status"]])(
      "should throw error if %s is missing",
      async (field) => {
        const userActivity: Record<string, string> = {
          user_id: "421d037d-f462-4e0c-beda-f4b63020d3d0",
          status: ActivityStatus.COMPLETED,
        };
        userActivity[field] = "";
        await expect(
          getUserActivityByUserIdAndStatus(userActivity as any),
        ).rejects.toThrow(`${field} is not allowed to be empty`);
      },
    );
  });
});
