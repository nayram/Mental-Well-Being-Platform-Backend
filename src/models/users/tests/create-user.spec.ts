import { sql } from "@pgkit/client";
import { dbClient } from "../../../lib/postgres-utils/resource";
import { closeDb, truncateTable } from "../../../helpers/utils";

import { createUser, UserTableName, User } from "..";

describe("Models: Create user", () => {
  beforeAll(async () => {
    await truncateTable(UserTableName);
  })
  afterAll(async () => {
    await closeDb();
  });

  afterEach(async () => {
    await truncateTable(UserTableName);
  });

  describe("Success", () => {
    test("should create user", async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "hashed_password",
      };
      await createUser(user);
      const createdUser = await dbClient.one(
        sql`SELECT * FROM ${sql.identifier([UserTableName])} WHERE username = ${user.username} AND email = ${user.email} AND password = ${user.password};`,
      );
      expect(createdUser.username).toBe(user.username);
      expect(createdUser.email).toBe(user.email);
      expect(createdUser.password).toBe(user.password);
    });
  });

  describe("Failure", () => {
    test.each([["username"], ["email"], ["password"]])(
      "should throw error if %s is empty",
      async (field) => {
        const user: Record<string, string> = {
          username: "nayram_test",
          email: "nayrammensah@gmail.com",
          password: "hashed_password",
        };
        user[field] = "";
        await expect(createUser(user as User)).rejects.toThrow(
          `${field} is not allowed to be empty`,
        );
      },
    );

    test.each([["username"], ["email"], ["password"]])(
      "should throw error if %s is not a string",
      async (field) => {
        const user: Record<string, any> = {
          username: "nayram_test",
          email: "nayrammensah@gmail.com",
          password: "hashed_password",
        };
        user[field] = 123;
        await expect(createUser(user as User)).rejects.toThrow(
          `${field} must be a string`,
        );
      },
    );

    test("should throw error if email is invalid", async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah",
        password: "password",
      };
      await expect(createUser(user)).rejects.toThrow(
        "email must be a valid email",
      );
    });

    test("should throw error if username already exists", async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "hashed_password",
      };
      await createUser(user);
      await expect(
        createUser({ ...user, email: "nayrammensah2@gmail.com" }),
      ).rejects.toThrow("username already exists");
    });

    test("should throw error if email already exists", async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "hashed_password",
      };
      await createUser(user);
      await expect(createUser(user)).rejects.toThrow("email already exists");
    });
  });
});
