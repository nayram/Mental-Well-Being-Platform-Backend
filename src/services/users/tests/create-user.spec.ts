import * as bcrypt from "bcrypt";
import { closeDb, truncateTable } from "../../../helpers/utils";
import { createUser } from "..";
import { UserModel } from "../../../models";

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
        email: "nayram.user@gmail.com",
        password: "password",
      };
      await createUser(user);
      const createdUser = await UserModel.getUserByEmail(user.email);
      expect(createdUser?.username).toBe(user.username);
      expect(createdUser?.email).toBe(user.email);
      expect(createdUser?.password).not.toBe(user.password);
    });

    test("should hash password", async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "password",
      };
      await createUser(user);
      const createdUser = await UserModel.getUserByEmail(user.email);
      expect(createdUser?.password).not.toBe(user.password);
      expect(bcrypt.compareSync(user.password, createdUser?.password || "")).toBe(
        true,
      );
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
        await expect(createUser(user as UserModel.User)).rejects.toThrow(
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
        await expect(createUser(user as UserModel.User)).rejects.toThrow(
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

    test("should throw error if username is less than 4 characters", async () => {
      const user = {
        username: "na",
        email: "nayrammensah@gmail.com",
        password: "password",
      };
      await expect(createUser(user)).rejects.toThrow(
        "username length must be at least 4 characters long",
      );
    });

    test("should throw error if password is less than 4 characters", async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "pas",
      };
      await expect(createUser(user)).rejects.toThrow(
        "password length must be at least 4 characters long",
      );
    });

    test("should throw error if email already exists", async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "password",
      };
      await createUser(user);
      await expect(createUser(user)).rejects.toThrow("email already exists");
    });

    test("should throw error if username already taken", async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "password",
      };
      await createUser(user);
      await expect(
        createUser({ ...user, email: "nayrammensah2@gmail.com" }),
      ).rejects.toThrow("username already exists");
    });
  });
});
