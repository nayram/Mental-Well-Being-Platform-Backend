import { sql } from "@pgkit/client";
import { dbClient } from "../../lib/postgres-utils/resource";

export const UserTableName = "user";
type User = {
  username: string;
  email: string;
  password: string;
};

type UserSchema = User & {
  id: string;
  created_at: Date;
  updated_at: Date;
};

export const createUser = async (user: User): Promise<UserSchema> => {
  const query = sql<UserSchema>`INSERT INTO ${sql.identifier([UserTableName])} (username, email, password) VALUES (${user.username}, ${user.email}, ${user.password});`;
  const { rows } = await dbClient.query(query);
  return rows[0];
};
