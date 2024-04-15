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
import { UserService } from "../../../services";
import { uuidPattern } from "../validators";

describe("API: PUT /api/v1/user-activities", () => {
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
    test("should update user activity status", async () => {
      const user = {
        username: "nayram",
        email: "nayram@me.com",
        password: "nayram123",
      };
      await UserService.createUser(user);
      const loggedInUser = await UserService.loginUser({
        email: user.email,
        password: user.password,
      });
      const createdUser = await UserModel.getUserByEmail(user.email);
      await ActivityModel.createActivities(Fixtures.activities);
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

      const { body, status } = await supertest(app)
        .patch(`/api/v1/user-activities/${createdUserActivity.id}`)
        .set("Authorization", `Bearer ${loggedInUser?.token}`)
        .send({
          status: UserActivityModel.ActivityStatus.COMPLETED,
        });

      const [updatedUserActivity] =
        await UserActivityModel.getUserActivityByUserIdAndStatus({
          user_id: createdUser?.id || "",
          status: UserActivityModel.ActivityStatus.COMPLETED,
        });

      expect(status).toBe(httpStatus.OK);
      expect(body.user_id).toBe(updatedUserActivity.user_id);
      expect(body.activity_id).toBe(updatedUserActivity.activity_id);
      expect(body.status).toBe(updatedUserActivity.status);
      expect(body.id).toBe(updatedUserActivity.id);
      expect(body.created_at).toBe(updatedUserActivity.created_at);
      expect(body.updated_at).toBe(updatedUserActivity.updated_at);
    });
  });

  describe("Failure", () => {
    test("should fail if user is not logged in", async () => {
      const id = "d6587863-16f9-4d8f-a8f7-ac38ce558eea";
      const { status, body } = await supertest(app)
        .patch("/api/v1/user-activities/" + id)
        .send({
          status: UserActivityModel.ActivityStatus.COMPLETED,
        });
      expect(status).toBe(httpStatus.UNAUTHORIZED);
      expect(body.message).toBe("Unauthorized");
    });

    test("should fail if id is invalid", async () => {
      const user = {
        username: "nayram",
        email: "nayram@me.com",
        password: "nayram123",
      };
      await UserService.createUser(user);
      const loggedInUser = await UserService.loginUser({
        email: user.email,
        password: user.password,
      });
      const id = "invalid";
      const { status, body } = await supertest(app)
        .patch("/api/v1/user-activities/" + id)
        .set("Authorization", `Bearer ${loggedInUser?.token}`)
        .send({
          status: UserActivityModel.ActivityStatus.COMPLETED,
        });
      expect(status).toBe(httpStatus.BAD_REQUEST);
      expect(body.message).toBe("Validation failed");
      expect(body.validation).toStrictEqual({
        params: {
          keys: ["id"],
          message: `\"id\" with value \"invalid\" fails to match the required pattern: ${uuidPattern}`,
          source: "params",
        },
      });
    });

    test("should fail if status is invalid", async () => {
      const user = {
        username: "nayram",
        email: "nayram@me.com",
        password: "nayram123",
      };
      await UserService.createUser(user);
      const loggedInUser = await UserService.loginUser({
        email: user.email,
        password: user.password,
      });
      const id = "d6587863-16f9-4d8f-a8f7-ac38ce558eea";
      const { status, body } = await supertest(app)
        .patch("/api/v1/user-activities/" + id)
        .set("Authorization", `Bearer ${loggedInUser?.token}`)
        .send({
          status: "invalid",
        });
      expect(status).toBe(httpStatus.BAD_REQUEST);
      expect(body.message).toBe("Validation failed");
      expect(body.validation).toStrictEqual({
        body: {
          keys: ["status"],
          message:
            '"status" must be one of [PENDING, COMPLETED, CANCELLED, STARTED]',
          source: "body",
        },
      });
    });
  });
});
