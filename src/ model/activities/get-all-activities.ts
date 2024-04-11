import { sql } from '@pgkit/client'
import { dbClient } from '../../lib/postgres-utils/resource'


type Activity = {
    id: string
    title: string
    description: string
    category: string
    duration: number
    difficulty_level: string
    content: string
    created_at: Date
    updated_at: Date
}
export const getAllActivities = async (): Promise<Activity[]> => {
    return await dbClient.many(sql<Activity>`SELECT * FROM activity;`)
}
