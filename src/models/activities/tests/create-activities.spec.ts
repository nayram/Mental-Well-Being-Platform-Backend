import { dbClient, sql } from "../../../lib";
import { closeDb, truncateTable, Fixtures } from "../../../helpers";
import { createActivities, ActivitySchema, TableName } from "..";

describe("Models: Create activities", () => {
  afterAll(async () => {
    await truncateTable(TableName);
    await closeDb();
  });

  test("should create activities", async () => {
    await createActivities(Fixtures.activities);
    const results = await dbClient.many(
      sql<ActivitySchema>`SELECT * FROM activity;`,
    );
    expect(results).toHaveLength(Fixtures.activities.length);
    results.forEach((result) => {
      expect(Fixtures.activities).toContainEqual({
        title: result.title,
        description: result.description,
        category: result.category,
        duration: result.duration,
        difficulty_level: result.difficulty_level,
        content: result.content,
        status: result.status,
      });
    });
  });
});
