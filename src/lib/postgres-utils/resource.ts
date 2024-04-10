import { createClient } from '@pgkit/client'

export type PgConnection = {
    host: string,
    port: number,
    user: string,
    password: string,
    database: string
}

export const pgConnector = (connection: PgConnection) => createClient(`postgres://${connection.user}:${connection.password}@${connection.host}:${connection.port}/${connection.database}`)
