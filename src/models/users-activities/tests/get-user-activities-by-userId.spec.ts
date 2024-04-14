import { UserModel, ActivityModel } from "../..";
import {
  createUserActivity,
  getUserActivityByUserId,
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
    test("should get all user activities", async () => {
      const activities = await ActivityModel.getAllActivities();

      for (const activity of activities) {
        const userActivity = {
          user_id: createdUser?.id || "",
          activity_id: activity.id,
          status: ActivityStatus.PENDING,
        };
        await createUserActivity(userActivity);
      }

      expect(await getUserActivityByUserId(createdUser?.id || "")).toHaveLength(
        activities.length,
      );
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
