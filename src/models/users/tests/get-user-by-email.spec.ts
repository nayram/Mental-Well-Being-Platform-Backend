import { sql } from "@pgkit/client";
import { dbClient } from "../../../lib/postgres-utils/resource";
import { getUserByEmail, UserTableName } from "..";
import { truncateTable, closeDb } from "../../../helpers/utils";

describe("Models: Get user by username", () => {
  afterAll(async () => {
    await closeDb();
  });

  afterEach(async () => {
    await truncateTable(UserTableName);
  });

  test("should get user by username and email", async () => {
    const user = {
      username: "nayram_test",
      email: "nayrammensah@gmail.com",
      password: "password",
    };
    await dbClient.query(
      sql`INSERT INTO ${sql.identifier(["user"])} (username, email, password) VALUES (${user.username}, ${user.email}, ${user.password});`,
    );
    const getUser = await getUserByEmail(user.email);
    expect(getUser?.username).toBe(user.username);
    expect(getUser?.email).toBe(user.email);
    expect(getUser?.password).toBe(user.password);
  });

  test("should return null if user does not exist", async () => {
    const user = {
      username: "nayram_test",
      email: "nayrammensah@gmail.com",
      password: "hashed_password",
    };
    const getUser = await getUserByEmail(user.email);
    expect(getUser).toBeNull();
  });
});
