import { sql } from "@pgkit/client";
import { dbClient } from "../../lib/postgres-utils/resource";
import { getAllActivities } from "./get-all-activities";

describe("Get all activities", () => {
  beforeAll(async () => {
    await dbClient.query(sql`INSERT INTO activity (title, description, category, duration, difficulty_level, content) VALUES
    ('Mindful Breathing', 'A simple activity to bring your focus to your breath and reduce stress.', 'Relaxation', 300, 'BEGINNER', 'Inhale slowly through your nose, hold for a few seconds, then exhale slowly.'),
    ('Yoga for Beginners', 'Start your yoga journey with some basic poses aimed at improving flexibility and relaxation.', 'Physical Health', 1800, 'BEGINNER', 'Follow a series of beginner-friendly yoga poses, focusing on your breath and alignment.'),
    ('Pomodoro Technique', 'Improve productivity by breaking your work into intervals, traditionally 25 minutes in length, separated by short breaks.', 'Productivity', 1500, 'BEGINNER', 'Work for 25 minutes, then take a 5-minute break. Repeat the cycle.'),
    ('Nature Walk', 'Engage in a leisurely walk in a natural environment to clear your mind and improve your mood.', 'Relaxation', 3600, 'INTERMEDIATE', 'Take a walk in a nearby park or nature reserve, observing the surroundings and breathing deeply.');`);
  });

  afterAll(async () => {
    await dbClient.query(sql`DELETE FROM activity;`);
    await dbClient.end();
  });

  test("should get all activities", async () => {
    const activities = await getAllActivities();
    expect(activities).toHaveLength(4);
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
