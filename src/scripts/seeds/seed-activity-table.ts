import { dbClient } from "../../lib/postgres-utils/resource";
import { sql } from "@pgkit/client";

(async () => {
  console.log("Seeding activity table...");
  await dbClient.connect(async (connection) => {
    return connection.query(sql`INSERT INTO activity (title, description, category, duration, difficulty_level, content, status) VALUES
      ('Mindful Breathing', 'A simple activity to bring your focus to your breath and reduce stress.', 'Relaxation', 300, 'BEGINNER', 'Inhale slowly through your nose, hold for a few seconds, then exhale slowly.', 'ACTIVE'),
      ('Yoga for Beginners', 'Start your yoga journey with some basic poses aimed at improving flexibility and relaxation.', 'Physical Health', 1800, 'BEGINNER', 'Follow a series of beginner-friendly yoga poses, focusing on your breath and alignment.', 'ACTIVE'),
      ('Pomodoro Technique', 'Improve productivity by breaking your work into intervals, traditionally 25 minutes in length, separated by short breaks.', 'Productivity', 1500, 'BEGINNER', 'Work for 25 minutes, then take a 5-minute break. Repeat the cycle.', 'ACTIVE'),
      ('Nature Walk', 'Engage in a leisurely walk in a natural environment to clear your mind and improve your mood.', 'Relaxation', 3600, 'INTERMEDIATE', 'Take a walk in a nearby park or nature reserve, observing the surroundings and breathing deeply.', 'ACTIVE'),
      ('HIIT Workout', 'High-Intensity Interval Training workout to boost your heart rate and improve cardiovascular health.', 'Physical Health', 900, 'ADVANCED', 'Perform high-intensity exercises like jumping jacks, burpees, and sprints with short rest intervals.', 'ACTIVE'),
      ('Meditation and Visualization', 'Advanced meditation techniques involving visualization to enhance focus and mental clarity.', 'Relaxation', 1800, 'EXPERT', 'Visualize peaceful scenes or success scenarios, focusing deeply on the details and sensations.', 'ACTIVE'),
      ('Rock Climbing Basics', 'Introduction to rock climbing, focusing on technique, safety, and building strength.', 'Physical Health', 3600, 'INTERMEDIATE', 'Learn the basics of rock climbing including proper grip, foot placement, and body movement.', 'ACTIVE'),
      ('Speed Reading', 'Techniques to increase your reading speed and comprehension, making learning more efficient.', 'Productivity', 1200, 'INTERMEDIATE', 'Practice reading with a timer, focusing on increasing word per minute rate while retaining comprehension.', 'ACTIVE'),
      ('Marathon Training Plan', 'A comprehensive training plan for running a marathon, including long runs, speed work, and recovery.', 'Physical Health', 7200, 'EXPERT', 'Follow a structured training plan leading up to a marathon, with progressively longer runs.', 'ACTIVE'),
      ('Group Debate', 'Organize a group debate on a chosen topic to improve communication skills and critical thinking.', 'Social Connection', 3600, 'INTERMEDIATE', 'Participate in a structured debate, presenting arguments and responding to counterpoints.', 'ACTIVE');`);
  });
  await dbClient.end();
  console.log("Done seeding activity table...");
})();
