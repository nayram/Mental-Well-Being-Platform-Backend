import { createClient } from '@pgkit/client'
import config from 'config'

type PgConnection = {
    host: string,
    port: number,
    user: string,
    password: string,
    database: string
}

const dbConfig  = config.get<PgConnection>('db')

export const dbClient = createClient(`postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`)
