import { dbClient, sql } from "../../../lib";
import { UserModel, ActivityModel } from "../..";
import {
  createUserActivity,
  UserActivityTableName,
  ActivityStatus,
  UserActivitySchema,
} from "..";
import { closeDb, truncateTable, Fixtures } from "../../../helpers";

describe("Models: Create User Activity", () => {
  afterAll(async () => {
    await closeDb();
  });

  afterEach(async () => {
    await truncateTable(UserActivityTableName);
    await truncateTable(UserModel.UserTableName);
    await truncateTable(ActivityModel.TableName);
  });

  describe("Success", () => {
    test("should create user activity", async () => {
      const user = {
        username: "nayram_test_user_activity",
        email: "nayram+user+activity@me.com",
        password: "password",
      };
      await UserModel.createUser(user);
      const createdUser = await UserModel.getUserByEmail(user.email);
      await ActivityModel.createActivities([Fixtures.activities[0]]);
      const {
        rows: [activity],
      } = await dbClient.query(
        sql<ActivityModel.ActivitySchema>`SELECT * FROM ${sql.identifier([ActivityModel.TableName])} 
                    WHERE title = ${Fixtures.activities[0].title};`,
      );
      const userActivity = {
        user_id: createdUser?.id || "",
        activity_id: activity.id,
        status: ActivityStatus.COMPLETED,
      };

      await createUserActivity(userActivity);

      const {
        rows: [createdUserActivity],
      } = await dbClient.query(
        sql<UserActivitySchema>`SELECT * FROM ${sql.identifier([UserActivityTableName])} WHERE user_id = ${createdUser?.id || ""} and activity_id = ${activity.id};`,
      );

      expect(createdUserActivity.user_id).toBe(userActivity.user_id);
      expect(createdUserActivity.activity_id).toBe(userActivity.activity_id);
      expect(createdUserActivity.status).toBe(userActivity.status);
      expect(createdUserActivity.id).toBeDefined();
      expect(createdUserActivity.created_at).toBeDefined();
      expect(createdUserActivity.updated_at).toBeDefined();
    });
  });

  describe("Failure", () => {
    test.each([["user_id"], ["activity_id"], ["status"]])(
      "should throw error if %s is missing",
      async (field) => {
        const userActivity: Record<string, string> = {
          user_id: "421d037d-f462-4e0c-beda-f4b63020d3d0",
          activity_id: "d6587863-16f9-4d8f-a8f7-ac38ce558eea",
          status: ActivityStatus.COMPLETED,
        };
        userActivity[field] = "";
        await expect(createUserActivity(userActivity as any)).rejects.toThrow(
          `${field} is not allowed to be empty`,
        );
      },
    );

    test.each([["user_id"], ["activity_id"]])(
      "should throw error if %s is not a string",
      async (field) => {
        const userActivity: Record<string, any> = {
          user_id: "421d037d-f462-4e0c-beda-f4b63020d3d0",
          activity_id: "d6587863-16f9-4d8f-a8f7-ac38ce558eea",
          status: ActivityStatus.CANCELLED,
        };
        userActivity[field] = 123;
        await expect(createUserActivity(userActivity as any)).rejects.toThrow(
          `${field} must be a string`,
        );
      },
    );

    test("should throw error if user does not exist", async () => {
      await ActivityModel.createActivities([Fixtures.activities[0]]);
      const {
        rows: [activity],
      } = await dbClient.query(
        sql<ActivityModel.ActivitySchema>`SELECT * FROM ${sql.identifier([ActivityModel.TableName])} 
                    WHERE title = ${Fixtures.activities[0].title};`,
      );
      const userActivity = {
        user_id: "421d037d-f462-4e0c-beda-f4b63020d3d0",
        activity_id: activity.id,
        status: ActivityStatus.COMPLETED,
      };
      await expect(createUserActivity(userActivity as any)).rejects.toThrow(
        "user not found",
      );
    });

    test("should throw error if activity does not exist", async () => {
      const user = {
        username: "nayram_test_user_activity",
        email: "nayram+user+activity@me.com",
        password: "password",
      };
      await UserModel.createUser(user);
      const createdUser = await UserModel.getUserByEmail(user.email);
      const userActivity = {
        user_id: createdUser?.id || "",
        activity_id: "d6587863-16f9-4d8f-a8f7-ac38ce558eea",
        status: ActivityStatus.COMPLETED,
      };
      await expect(createUserActivity(userActivity as any)).rejects.toThrow(
        "activity not found",
      );
    });
  });
});
