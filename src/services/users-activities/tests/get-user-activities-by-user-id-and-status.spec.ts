import { UserModel, ActivityModel, UserActivityModel } from "../../../models";
import { closeDb, truncateTable, Fixtures } from "../../../helpers";
import { getUserActivityByUserIdAndStatus } from "..";

describe("Services: Get All User Activities By UserId and Status", () => {
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
      await UserActivityModel.createUserActivity({
        user_id: createdUser?.id || "",
        activity_id: pendingActivity.id,
        status: UserActivityModel.ActivityStatus.PENDING,
      });
      for (const activity of completedActivities) {
        await UserActivityModel.createUserActivity({
          user_id: createdUser?.id || "",
          activity_id: activity.id,
          status: UserActivityModel.ActivityStatus.COMPLETED,
        });
      }

      const completedUserActivities = await getUserActivityByUserIdAndStatus({
        user_id: createdUser?.id || "",
        status: UserActivityModel.ActivityStatus.COMPLETED,
      });
      expect(completedUserActivities.length).toBe(completedActivities.length);

      for (const activity of completedUserActivities) {
        expect(activity.status).toBe(
          UserActivityModel.ActivityStatus.COMPLETED,
        );
        expect(activity).toHaveProperty("title");
        expect(activity).toHaveProperty("description");
        expect(activity).toHaveProperty("category");
        expect(activity).toHaveProperty("duration");
        expect(activity).toHaveProperty("difficulty_level");
        expect(activity).toHaveProperty("content");
        expect(activity).toHaveProperty("status");
      }
    });
  });

  describe("Failure", () => {
    test.each([["user_id"], ["status"]])(
      "should throw error if %s is missing",
      async (field) => {
        const userActivity: Record<string, string> = {
          user_id: "421d037d-f462-4e0c-beda-f4b63020d3d0",
          status: UserActivityModel.ActivityStatus.COMPLETED,
        };
        userActivity[field] = "";
        await expect(
          getUserActivityByUserIdAndStatus(userActivity as any),
        ).rejects.toThrow(`${field} is not allowed to be empty`);
      },
    );
  });
});
