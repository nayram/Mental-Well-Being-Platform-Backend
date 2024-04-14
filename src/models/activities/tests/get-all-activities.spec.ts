import { truncateTable, Fixtures, closeDb } from "../../../helpers";
import { createActivities, getAllActivities, TableName } from "..";

describe("Models: Get all activities", () => {
  beforeAll(async () => {
    await createActivities(Fixtures.activities);
  });

  afterAll(async () => {
    await truncateTable(TableName);
    await closeDb();
  });

  test("should get all activities", async () => {
    const activities = await getAllActivities();
    expect(activities).toHaveLength(Fixtures.activities.length);
    expect(activities[0]).toHaveProperty("title");
    expect(activities[0]).toHaveProperty("description");
    expect(activities[0]).toHaveProperty("category");
    expect(activities[0]).toHaveProperty("duration");
    expect(activities[0]).toHaveProperty("difficulty_level");
    expect(activities[0]).toHaveProperty("content");
    expect(activities[0]).toHaveProperty("created_at");
    expect(activities[0]).toHaveProperty("updated_at");
  });
});
