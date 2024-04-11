import { Migrator } from "@pgkit/migrator";
import { dbClient } from "../lib/postgres-utils/resource";

const migrator = new Migrator({
  migrationsPath: __dirname + "/migrations",
  migrationTableName: "migration",
  client: dbClient,
  logger: Migrator.prettyLogger,
});
migrator.runAsCLI();
