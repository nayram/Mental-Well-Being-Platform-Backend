import { sql } from "@pgkit/client";
import { dbClient } from "../../../lib/postgres-utils/resource";
import { closeDb, truncateTable } from "../../../helpers/utils";
import { createUser } from "..";

describe("Services: Create user", () => {
  afterEach(async () => {
    await truncateTable("user");
  });

  afterAll(async () => {
    await closeDb();
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
        sql`SELECT * FROM ${sql.identifier(["user"])} WHERE email = ${user.email};`,
      );
      expect(createdUser.username).toBe(user.username);
      expect(createdUser.email).toBe(user.email);
      expect(createdUser.password).not.toBe(user.password);
    });
  });

  describe("Failure", () => {
    test("should throw error if password is empty", async () => {
      const user = {
        username: "nayram_test",
        email: "test@gmail.com",
        password: "",
      };
      await expect(createUser(user)).rejects.toThrow(
        "password is not allowed to be empty",
      );
    });
    test("should throw error if email is empty", async () => {
      const user = {
        username: "nayram_test",
        email: "",
        password: "password",
      };
      await expect(createUser(user)).rejects.toThrow(
        "email is not allowed to be empty",
      );
    });

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

    test("should throw error if username is empty", async () => {
      const user = {
        username: "",
        email: "nayrammensah@gmail.com",
        password: "password",
      };
      await expect(createUser(user)).rejects.toThrow(
        "username is not allowed to be empty",
      );
    });
  });
  
});
