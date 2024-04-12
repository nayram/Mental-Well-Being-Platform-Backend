import { sql } from "@pgkit/client";
import { dbClient } from "../../../lib/postgres-utils/resource";
import { getUserByEmailAndPassword, UserTableName } from "..";
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
    const getUser = await getUserByEmailAndPassword(user.email, user.password);
    expect(getUser?.username).toBe(user.username);
    expect(getUser?.email).toBe(user.email);
    expect(getUser?.password).toBe(user.password);
  });
});
