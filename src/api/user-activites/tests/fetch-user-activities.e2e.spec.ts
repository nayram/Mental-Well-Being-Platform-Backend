import http, { Server } from "http";
import { Application } from "express";
import supertest from "supertest";
import { createApp } from "../../app";
import {
  closeDb,
  truncateTable,
  httpStatus,
  Fixtures,
} from "../../../helpers/utils";
import { UserModel, UserActivityModel, ActivityModel } from "../../../models";
import { uuidPattern } from "../validators";

describe("API: GET /api/v1/user-activities", () => {
  let app: Application;
  let server: Server;

  beforeAll(async () => {
    app = createApp();
    server = http.createServer(app);
  });

  afterAll(async () => {
    await closeDb();
    server.close();
  });

  afterEach(async () => {
    await truncateTable(UserActivityModel.UserActivityTableName);
    await truncateTable(UserModel.UserTableName);
    await truncateTable(ActivityModel.TableName);
  });

  describe("Success", () => {
    test("should fetch all user activities", async () => {
      const user = {
        username: "nayram",
        email: "nayram@me.com",
        password: "nayram123",
      };
      await UserModel.createUser(user);
      const createdUser = await UserModel.getUserByEmail(user.email);
      await ActivityModel.createActivities(Fixtures.activities);
      const allActivities = await ActivityModel.getAllActivities();

      for (const activity of allActivities) {
        const userActivity = {
          user_id: createdUser?.id || "",
          activity_id: activity.id,
          status: UserActivityModel.ActivityStatus.PENDING,
        };
        await UserActivityModel.createUserActivity(userActivity);
      }
      const getAllUserActivities =
        await UserActivityModel.getUserActivityDetailsByUserId(
          createdUser?.id || "",
        );
      const { status, body } = await supertest(app)
        .get("/api/v1/user-activities?user_id=" + createdUser?.id)
        .send();
      expect(status).toBe(httpStatus.OK);
      expect(body.length).toBe(getAllUserActivities.length);
      expect(body).toStrictEqual(getAllUserActivities);
      expect(body[0]).toHaveProperty("title");
      expect(body[0]).toHaveProperty("description");
      expect(body[0]).toHaveProperty("category");
      expect(body[0]).toHaveProperty("duration");
      expect(body[0]).toHaveProperty("difficulty_level");
      expect(body[0]).toHaveProperty("content");
      expect(body[0]).toHaveProperty("status");
    });

    test("should fetch user activities when status is provided", async () => {
      const user = {
        username: "nayram",
        email: "nayram@me.com",
        password: "nayram123",
      };
      await UserModel.createUser(user);
      const createdUser = await UserModel.getUserByEmail(user.email);
      await ActivityModel.createActivities(Fixtures.activities);
      const [pendingActivity, ...completedActivities] =
        await ActivityModel.getAllActivities();

      await UserActivityModel.createUserActivity({
        user_id: createdUser?.id || "",
        activity_id: pendingActivity.id,
        status: UserActivityModel.ActivityStatus.PENDING,
      });

      for (const activity of completedActivities) {
        const userActivity = {
          user_id: createdUser?.id || "",
          activity_id: activity.id,
          status: UserActivityModel.ActivityStatus.COMPLETED,
        };
        await UserActivityModel.createUserActivity(userActivity);
      }

      const getCompletedActivities =
        await UserActivityModel.getUserActivityDetailsByUserIdAndStatus({
          user_id: createdUser?.id || "",
          status: UserActivityModel.ActivityStatus.COMPLETED,
        });
      const { status, body } = await supertest(app)
        .get(
          `/api/v1/user-activities?user_id=${createdUser?.id}&status=${UserActivityModel.ActivityStatus.COMPLETED}`,
        )
        .send();

      expect(status).toBe(httpStatus.OK);
      expect(body.length).toBe(getCompletedActivities.length);
      expect(body).toStrictEqual(getCompletedActivities);
    });
  });

  describe("Failure", () => {
    test("should fail to fetch user activities when user_id is missing", async () => {
      const { status, body } = await supertest(app)
        .get("/api/v1/user-activities")
        .send();
      expect(status).toBe(httpStatus.BAD_REQUEST);
      expect(body.message).toBe("Validation failed");
      expect(body.validation).toStrictEqual({
        query: {
          keys: ["user_id"],
          message: '"user_id" is required',
          source: "query",
        },
      });
    });

    test("should fail to fetch user activities if user_id is invalid", async () => {
      const { status, body } = await supertest(app)
        .get("/api/v1/user-activities?user_id=invalid")
        .send();
      expect(status).toBe(httpStatus.BAD_REQUEST);
      expect(body.message).toBe("Validation failed");
      expect(body.validation).toStrictEqual({
        query: {
          keys: ["user_id"],
          message:
            '"user_id" with value "invalid" fails to match the required pattern: ' +
            uuidPattern,
          source: "query",
        },
      });
    });

    test("should fail to fetch user activities if status is invalid", async () => {
      const { status, body } = await supertest(app)
        .get(
          "/api/v1/user-activities?user_id=421d037d-f462-4e0c-beda-f4b63020d3d0&status=invalid",
        )
        .send();
      expect(status).toBe(httpStatus.BAD_REQUEST);
      expect(body.message).toBe("Validation failed");
      expect(body.validation).toStrictEqual({
        query: {
          keys: ["status"],
          message:
            '"status" must be one of [PENDING, COMPLETED, CANCELLED, STARTED]',
          source: "query",
        },
      });
    });
  });
});
