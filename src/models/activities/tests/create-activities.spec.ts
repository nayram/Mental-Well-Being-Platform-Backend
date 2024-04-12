import { sql } from "@pgkit/client";
import { dbClient } from "../../../lib/postgres-utils/resource";
import {
  createActivities,
  Category,
  DifficultyLevel,
  ActivitySchema,
} from "..";

describe("Models: Create activities", () => {
  afterAll(async () => {
    await dbClient.query(sql`DELETE FROM activity;`);
    await dbClient.end();
  });

  test("should create activities", async () => {
    const activities = [
      {
        title: "Mindful Breathing",
        description:
          "A simple activity to bring your focus to your breath and reduce stress.",
        category: Category.RELAXATION,
        duration: 300,
        difficulty_level: DifficultyLevel.BEGINNER,
        content:
          "Inhale slowly through your nose, hold for a few seconds, then exhale slowly.",
      },
      {
        title: "Yoga for Beginners",
        description:
          "Start your yoga journey with some basic poses aimed at improving flexibility and relaxation.",
        category: Category.PHYSICAL_HEALTH,
        duration: 1800,
        difficulty_level: DifficultyLevel.BEGINNER,
        content:
          "Follow a series of beginner-friendly yoga poses, focusing on your breath and alignment.",
      },
      {
        title: "Pomodoro Technique",
        description:
          "Improve productivity by breaking your work into intervals, traditionally 25 minutes in length, separated by short breaks.",
        category: Category.PRODUCTIVITY,
        duration: 1500,
        difficulty_level: DifficultyLevel.BEGINNER,
        content:
          "Work for 25 minutes, then take a 5-minute break. Repeat the cycle.",
      },
    ];
    await createActivities(activities);
    const results = await dbClient.many(
      sql<ActivitySchema>`SELECT * FROM activity;`,
    );
    expect(results).toHaveLength(activities.length);
    results.forEach((result) => {
      expect(activities).toContainEqual({
        title: result.title,
        description: result.description,
        category: result.category,
        duration: result.duration,
        difficulty_level: result.difficulty_level,
        content: result.content,
      });
    });
  });
});
