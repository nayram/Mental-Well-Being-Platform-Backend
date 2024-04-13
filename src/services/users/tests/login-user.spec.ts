import jsonwebtoken from "jsonwebtoken";
import { UserModel } from "../../../models";
import { closeDb, truncateTable } from "../../../helpers";
import { loginUser, createUser } from "../.";

describe("Services: Login", () => {
  afterAll(async () => {
    jest.clearAllMocks();
    await closeDb();
  });
  afterEach(async () => {
    await truncateTable(UserModel.UserTableName);
  });

  describe("Success", () => {
    test("should login user", async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "password",
      };
      await createUser(user);
      const loggedInUser = await loginUser({
        email: user.email,
        password: user.password,
      });
      expect(loggedInUser?.email).toBe(user.email);
      expect(loggedInUser?.username).toBe(user.username);
      expect(loggedInUser?.token).toBeDefined();
      expect(loggedInUser).toHaveProperty("token");
      expect(loggedInUser).toHaveProperty("id");
      expect(loggedInUser).toHaveProperty("username");
      expect(loggedInUser).toHaveProperty("email");
      expect(loggedInUser).toHaveProperty("created_at");
      expect(loggedInUser).toHaveProperty("updated_at");
      expect(loggedInUser).not.toHaveProperty("password");
    });

    test("should call jsonwebtoken sign function when logging in", async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "password",
      };

      const signSpy = jest.spyOn(jsonwebtoken, "sign");

      await createUser(user);

      await loginUser({
        email: user.email,
        password: user.password,
      });

      expect(signSpy).toHaveBeenCalled();
      signSpy.mockClear();
    });
  });

  describe("Failure", () => {
    test("should throw error if email is empty", async () => {
      await expect(
        loginUser({
          email: "",
          password: "password",
        }),
      ).rejects.toThrow("email is not allowed to be empty");
    });

    test("should trow error if password is empty", async () => {
      await expect(
        loginUser({
          email: "nayrammensah@gmail.com",
          password: "",
        }),
      ).rejects.toThrow("password is not allowed to be empty");
    });

    test("should throw error if email is invalid", async () => {
      await expect(
        loginUser({
          email: "nayrammensah1@gmail",
          password: "password",
        }),
      ).rejects.toThrow("email must be a valid email");
    });

    test("should throw error if email is not found", async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "password",
      };
      await UserModel.createUser(user);
      await expect(
        loginUser({
          email: "nayrammensah1@gmail.com",
          password: user.password,
        }),
      ).rejects.toThrow("Invalid email or password");
    });

    test("should throw error if password is incorrect", async () => {
      const user = {
        username: "nayram_test",
        email: "nayrammensah@gmail.com",
        password: "password",
      };
      await UserModel.createUser(user);
      await expect(
        loginUser({
          email: user.email,
          password: "incorrect_password",
        }),
      ).rejects.toThrow("Invalid email or password");
    });
  });
});
