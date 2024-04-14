import { closeDb, truncateTable, Fixtures } from "../../../helpers";
import { ActivityModel } from "../../../models";
import { getAllActivities } from "../";

describe("Services: Get all activities", () => {
  beforeAll(async () => {
    await ActivityModel.createActivities(Fixtures.activities);
  });
  afterAll(async () => {
    await truncateTable(ActivityModel.TableName);
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
