import { sql } from "@pgkit/client";
import * as bcrypt from "bcrypt";
import { dbClient } from "../../../lib/postgres-utils/resource";
import { closeDb, truncateTable } from "../../../helpers/utils";
import { createUser } from "..";
import { User, UserSchema } from "models/users";

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

    test("should hash password", async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "password",
      };
      await createUser(user);
      const createdUser = await dbClient.one(
        sql<UserSchema>`SELECT * FROM ${sql.identifier(["user"])} WHERE email = ${user.email};`,
      );
      expect(createdUser.password).not.toBe(user.password);
      expect(await bcrypt.compare(user.password, createdUser.password)).toBe(
        true,
      );
    })
  });

  describe("Failure", () => {

     test.each([
      ['username'],
      ['email'],
      ['password'],
    ])('should throw error if %s is empty', async (field) => {
      const user: Record<string, string> = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "hashed_password",
      };
       user[field] = ''
      await expect(createUser(user as User)).rejects.toThrow(
        `${field} is not allowed to be empty`,
      );
    })

    test.each([
      ['username'],
      ['email'],
      ['password'],
    ])('should throw error if %s is not a string', async (field) => {
      const user: Record<string, any> = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "hashed_password",
      };
       user[field] = 123
      await expect(createUser(user as User)).rejects.toThrow(
        `${field} must be a string`,
      );
    })

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

    test('should throw error if username is less than 5 characters', async () => {
      const user = {
        username: "na",
        email: "nayrammensah@gmail.com",
        password: "password",
      };
      await expect(createUser(user)).rejects.toThrow(
        "username length must be at least 5 characters long",
      );
    })

    test('should throw error if password is less than 8 characters', async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "pass",
      };
      await expect(createUser(user)).rejects.toThrow(
        "password length must be at least 8 characters long",
      );
    })

    test('should throw error if email already exists', async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "password",
      };
      await createUser(user);
      await expect(createUser(user)).rejects.toThrow(
        "email already exists",
      );
    })

    test('should throw error if username already taken', async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "password",
      }
      await createUser(user);
      await expect(createUser({ ...user, email: 'nayrammensah2@gmail.com' })).rejects.toThrow(
        "username already exists",
      )
    })
  });

});
