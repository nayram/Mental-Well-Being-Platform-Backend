import { sql } from "@pgkit/client";
import { dbClient } from "../../lib/postgres-utils/resource";

export enum Category {
  RELAXATION = 'RELAXATION',
  PHYSICAL_HEALTH = 'PHYSICAL_HEALTH',
  PRODUCTIVITY = 'PRODUCTIVITY',
  SELF_ESTEEM = 'SELF_ESTEEM',
  SOCIAL_CONNECTION = 'SOCIAL_CONNECTION',
}

export enum DifficultyLevel { 
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export type Activity = {
  title: string;
  description: string;
  category: Category;
  duration: number;
  difficulty_level: DifficultyLevel;
  content: string;
}

export type ActivitySchema = Activity & { id: string, created_at: Date, updated_at: Date };

export const getAllActivities = async (): Promise<ActivitySchema[]> => {
  return await dbClient.many(sql<ActivitySchema>`SELECT * FROM activity;`);
};

export const createActivities = async (activities: Activity[]) => {
  const queryValues = activities.map(activity => `('${activity.title}', '${activity.description}', '${activity.category}', '${activity.duration}', '${activity.difficulty_level}', '${activity.content}')`).join(', ');
  let query = sql`INSERT INTO activity (title, description, category, duration, difficulty_level, content) VALUES ${sql.raw(queryValues)};`;
  await dbClient.query(query);
}
