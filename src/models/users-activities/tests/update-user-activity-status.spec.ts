import { dbClient, sql } from "../../../lib";
import { UserModel, ActivityModel } from "../..";
import {
  createUserActivity,
  updateUserActivityStatusById,
  getUserActivityByUserIdAndStatus,
  UserActivityTableName,
  ActivityStatus,
  UserActivitySchema,
} from "..";
import { closeDb, truncateTable, Fixtures } from "../../../helpers";

describe("Models: Update User Activities", () => {
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
        status: ActivityStatus.PENDING,
      };

      await createUserActivity(userActivity);

      const [createdUserActivity] = await getUserActivityByUserIdAndStatus({
        user_id: createdUser?.id || "",
        status: ActivityStatus.PENDING,
      });

      await updateUserActivityStatusById({
        id: createdUserActivity.id,
        status: ActivityStatus.COMPLETED,
      });

      const {
        rows: [updatedUserActivity],
      } = await dbClient.query(
        sql<UserActivitySchema>`SELECT * FROM ${sql.identifier([UserActivityTableName])} WHERE id = ${createdUserActivity.id};`,
      );

      expect(updatedUserActivity.status).toBe(ActivityStatus.COMPLETED);
    });
  });

  describe("Failure", () => {
    test.each([["id"], ["status"]])(
      "should throw error if %s is missing",
      async (field) => {
        const userActivity: Record<string, string> = {
          id: "421d037d-f462-4e0c-beda-f4b63020d3d0",
          status: ActivityStatus.COMPLETED,
        };
        userActivity[field] = "";
        await expect(
          updateUserActivityStatusById(userActivity as unknown as any),
        ).rejects.toThrow(`${field} is not allowed to be empty`);
      },
    );
  });
});
