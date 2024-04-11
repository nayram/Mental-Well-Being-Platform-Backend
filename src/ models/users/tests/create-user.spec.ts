import { sql } from "@pgkit/client";
import { dbClient } from "../../../lib/postgres-utils/resource";
import { closeDb, truncateTable } from "../../../helpers/utils";

import { createUser, UserTableName } from "..";

describe("Models: Create user", () => {
  afterAll(async () => {
    await truncateTable(UserTableName);
    await closeDb();
  });

  test("should create user", async () => {
    const user = {
      username: "nayram_test",
      email: "nayrammensah@gmail.com",
      password: "hashed_password",
    };
    await createUser(user);
    const createdUser = await dbClient.one(
      sql`SELECT * FROM ${sql.identifier(["user"])} WHERE username = ${user.username} AND email = ${user.email} AND password = ${user.password};`,
    );
    expect(createdUser.username).toBe(user.username);
    expect(createdUser.email).toBe(user.email);
    expect(createdUser.password).toBe(user.password);
  });
});
