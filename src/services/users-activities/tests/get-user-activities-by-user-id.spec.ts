import { UserModel, ActivityModel, UserActivityModel } from "../../../models";
import { closeDb, truncateTable, Fixtures } from "../../../helpers";

import { getUserActivityByUserId } from "..";

describe("Services: Get User Activities By UserId", () => {
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
    test("should get all user activities", async () => {
      const activities = await ActivityModel.getAllActivities();

      for (const activity of activities) {
        const userActivity = {
          user_id: createdUser?.id || "",
          activity_id: activity.id,
          status: UserActivityModel.ActivityStatus.PENDING,
        };
        await UserActivityModel.createUserActivity(userActivity);
      }
      const userActivities = await getUserActivityByUserId(
        createdUser?.id || "",
      );
      expect(userActivities).toHaveLength(activities.length);
      expect(userActivities[0]).toHaveProperty("title");
      expect(userActivities[0]).toHaveProperty("description");
      expect(userActivities[0]).toHaveProperty("category");
      expect(userActivities[0]).toHaveProperty("duration");
      expect(userActivities[0]).toHaveProperty("difficulty_level");
      expect(userActivities[0]).toHaveProperty("content");
      expect(userActivities[0]).toHaveProperty("status");
    });
  });

  describe("Failure", () => {
    test("should throw error if user_id is missing", async () => {
      const userId = "";
      await expect(getUserActivityByUserId(userId)).rejects.toThrow(
        `user_id is not allowed to be empty`,
      );
    });
  });
});
