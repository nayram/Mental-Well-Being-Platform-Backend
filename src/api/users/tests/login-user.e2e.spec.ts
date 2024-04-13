import http, { Server } from "http";
import { Application } from "express";
import supertest from "supertest";
import { createApp } from "../../app";
import { closeDb, truncateTable, httpStatus } from "../../../helpers/utils";
import { UserModel } from "../../../models";
import { UserService } from "../../../services";

describe("API: POST /api/v1/auth/login", () => {
  let app: Application;
  let server: Server;

  beforeAll(async () => {
    app = createApp();
    server = http.createServer(app);
  });

  afterEach(async () => {
    await truncateTable(UserModel.UserTableName);
  });

  afterAll(async () => {
    await closeDb();
    server.close();
  });

  describe("Success", () => {
    test("should login user successfully", async () => {
      const user = {
        username: "nayram",
        email: "nayram@me.com",
        password: "nayram123213",
      };

      await UserService.createUser(user);

      const { body, status } = await supertest(app)
        .post("/api/v1/auth/login")
        .send({ email: user.email, password: user.password });
      expect(status).toBe(httpStatus.OK);
      expect(body).toHaveProperty("token");
      expect(body).toHaveProperty("user");
      expect(body.user).toHaveProperty("id");
      expect(body.user).toHaveProperty("created_at");
      expect(body.user).toHaveProperty("updated_at");
      expect(body.user).toHaveProperty("username");
      expect(body.user).toHaveProperty("email");
      expect(body.user.username).toBe(user.username);
      expect(body.user.email).toBe(user.email);
    });
  });

  describe("Failure", () => {
    test.each([["email"], ["password"]])(
      "should fail to login when %s is empty",
      async (field) => {
        const user: Record<string, string> = {
          email: "nayram@me.com",
          password: "nayram123213",
        };
        user[field] = "";
        const { body, status } = await supertest(app)
          .post("/api/v1/auth/login")
          .send({ email: user.email, password: user.password });
        expect(status).toBe(httpStatus.BAD_REQUEST);
        expect(body.message).toBe("Validation failed");
        expect(body.validation).toStrictEqual({
          body: {
            keys: [field],
            message: `\"${field}\" is not allowed to be empty`,
            source: "body",
          },
        });
      },
    );

    test.each([["email"], ["password"]])(
      "should fail to login user when %s is not a string",
      async (key) => {
        const user: Record<string, any> = {
          email: "nayram@me.com",
          password: "nayram123",
        };
        user[key] = 1232;
        const res = await supertest(app).post("/api/v1/auth/login").send(user);
        expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
        expect(res.body.message).toBe("Validation failed");
        expect(res.body.validation).toStrictEqual({
          body: {
            keys: [key],
            message: `\"${key}\" must be a string`,
            source: "body",
          },
        });
      },
    );

    test("should fail to login user when email is invalid", async () => {
      const user = {
        email: "nayram",
        password: "nayram123",
      };
      const res = await supertest(app).post("/api/v1/auth/login").send(user);
      expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.validation).toStrictEqual({
        body: {
          keys: ["email"],
          message: `"email" must be a valid email`,
          source: "body",
        },
      });
    });

    test("should fail to login user when password is invalid", async () => {
      const user = {
        email: "nayram@me.com",
        password: "nay",
      };
      const res = await supertest(app).post("/api/v1/auth/login").send(user);
      expect(res.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.validation).toStrictEqual({
        body: {
          keys: ["password"],
          message: `"password" length must be at least 4 characters long`,
          source: "body",
        },
      });
    });

    test("should fail to login user when email does not exist", async () => {
      const user = {
        email: "nayram@me.com",
        password: "nayram123213",
      };
      const res = await supertest(app).post("/api/v1/auth/login").send(user);
      expect(res.statusCode).toBe(httpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe("Invalid email or password");
    });

    test("should fail to login user when password is incorrect", async () => {
      const user = {
        email: "nayram@me.com",
        password: "nayram123213",
      };
      UserService.createUser({
        email: user.email,
        password: user.password,
        username: "nayram",
      });
      const res = await supertest(app)
        .post("/api/v1/auth/login")
        .send({ email: user.email, password: "invalidUser" });
      expect(res.statusCode).toBe(httpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });
});
