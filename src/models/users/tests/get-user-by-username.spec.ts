import { sql } from "@pgkit/client";
import { dbClient } from "../../../lib/postgres-utils/resource";
import { getUserByUsername, UserTableName } from "..";
import { truncateTable, closeDb } from "../../../helpers/utils";

describe("Models: Get user by username", () => {
  afterAll(async () => {
    await truncateTable(UserTableName);
    await closeDb();
  });

  test("should get user by username", async () => {
    const user = {
      username: "nayram_test",
      email: "nayrammensah@gmail.com",
      password: "hashed_password",
    };
    await dbClient.query(
      sql`INSERT INTO ${sql.identifier(["user"])} (username, email, password) VALUES (${user.username}, ${user.email}, ${user.password});`,
    );
    const getUser = await getUserByUsername(user.username);
    expect(getUser?.username).toBe(user.username);
    expect(getUser?.email).toBe(user.email);
    expect(getUser?.password).toBe(user.password);
  });

  test("should retun null if user does not exist", async () => {
    const getUser = await getUserByUsername("username_not_exist");
    expect(getUser).toBe(null);
  });
});
