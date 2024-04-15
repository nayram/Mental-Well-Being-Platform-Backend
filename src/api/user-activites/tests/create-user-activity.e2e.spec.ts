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

describe("API: POST /api/v1/user-activities", () => {
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
    test("should create user activity successfully", async () => {
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

      await ActivityModel.createActivities([Fixtures.activities[0]]);

      const [activity] = await ActivityModel.getAllActivities();

      const userActivity = {
        user_id: createdUser?.id || "",
        activity_id: activity.id,
        status: UserActivityModel.ActivityStatus.COMPLETED,
      };

      const { status, body } = await supertest(app)
        .post("/api/v1/user-activities")
        .set("Authorization", `Bearer ${loggedInUser?.token}`)
        .send(userActivity);

      const [createdUserActivity] =
        await UserActivityModel.getUserActivityByUserId(createdUser?.id || "");

      expect(status).toBe(httpStatus.CREATED);
      expect(body.user_id).toBe(createdUserActivity.user_id);
      expect(body.activity_id).toBe(createdUserActivity.activity_id);
      expect(body.status).toBe(createdUserActivity.status);
      expect(body.id).toBe(createdUserActivity.id);
      expect(body.created_at).toBe(createdUserActivity.created_at);
      expect(body.updated_at).toBe(createdUserActivity.updated_at);
    });
  });

  describe("Failure", () => {
    test("should fail if user token is invalid", async () => {
      const userActivity: Record<string, string> = {
        user_id: "421d037d-f462-4e0c-beda-f4b63020d3d0",
        activity_id: "d6587863-16f9-4d8f-a8f7-ac38ce558eea",
        status: UserActivityModel.ActivityStatus.COMPLETED,
      };
      const { status } = await supertest(app)
        .post("/api/v1/user-activities")
        .send(userActivity);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });
    test.each([["user_id"], ["activity_id"]])(
      "should fail to create user activity when %s is missing",
      async (key) => {
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
        const userActivity: Record<string, string> = {
          user_id: "421d037d-f462-4e0c-beda-f4b63020d3d0",
          activity_id: "d6587863-16f9-4d8f-a8f7-ac38ce558eea",
          status: UserActivityModel.ActivityStatus.COMPLETED,
        };
        userActivity[key] = "";
        const { status, body } = await supertest(app)
          .post("/api/v1/user-activities")
          .set("Authorization", `Bearer ${loggedInUser?.token}`)
          .send(userActivity);
        expect(status).toBe(httpStatus.BAD_REQUEST);
        expect(body.message).toBe("Validation failed");
        expect(body.validation).toStrictEqual({
          body: {
            keys: [key],
            message: `\"${key}\" is not allowed to be empty`,
            source: "body",
          },
        });
      },
    );

    test("should fail to create if status is invalid", async () => {
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
      const userActivity = {
        user_id: "421d037d-f462-4e0c-beda-f4b63020d3d0",
        activity_id: "d6587863-16f9-4d8f-a8f7-ac38ce558eea",
        status: "invalid",
      };
      const { status, body } = await supertest(app)
        .post("/api/v1/user-activities")
        .set("Authorization", `Bearer ${loggedInUser?.token}`)
        .send(userActivity);
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

    test("should fail when user_id does not exist", async () => {
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
      const userActivity = {
        user_id: "421d037d-f462-4e0c-beda-f4b63020d3d0",
        activity_id: "d6587863-16f9-4d8f-a8f7-ac38ce558eea",
        status: UserActivityModel.ActivityStatus.COMPLETED,
      };
      const { status, body } = await supertest(app)
        .post("/api/v1/user-activities")
        .set("Authorization", `Bearer ${loggedInUser?.token}`)
        .send(userActivity);
      expect(status).toBe(httpStatus.UN_PROCESSABLE_ENTITY);
      expect(body.message).toBe("user not found");
    });

    test("should fail when activity_id does not exist", async () => {
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
      const userActivity = {
        user_id: createdUser?.id || "",
        activity_id: "d6587863-16f9-4d8f-a8f7-ac38ce558eea",
        status: UserActivityModel.ActivityStatus.COMPLETED,
      };
      const { status, body } = await supertest(app)
        .post("/api/v1/user-activities")
        .set("Authorization", `Bearer ${loggedInUser?.token}`)
        .send(userActivity);
      expect(status).toBe(httpStatus.UN_PROCESSABLE_ENTITY);
      expect(body.message).toBe("activity not found");
    });
  });
});
