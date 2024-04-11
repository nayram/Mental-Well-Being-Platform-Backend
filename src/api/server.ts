import config from 'config'
import { Response } from 'express'
import { Server } from 'http'
import { createApp } from './app'
import { logger } from '../lib/logger'
import { dbClient } from '../lib/postgres-utils/resource'

let server: Server

const log = logger({
    serviceName: 'api'
})

const delay = 3 * 2 * 1000 // 3 seconds

const bootstrap = async () => {
    const port = config.get<number>('port')
    const app = createApp()
    app.get('/', (_, res: Response) => {
        res.send(`Listening on port: ${port}`);
    })
    server = app.listen(port, () => {
        log.info(`Server running successfully on port ${port}`)
    })
}

const shutDownServices = async () => {
    log.info('Closing database connection...')
    await dbClient.end();
    log.info("Database connection closed");
    log.info("Server shutting down...")
    server.close(() => log.info("Server closed"));
}

process
.on("SIGTERM", (err) => {
  if (err) log.error(err)
  
  return setTimeout( async () => {
   await shutDownServices()
  }, delay)
})
.on("SIGINT", (err) => {
  if (err) log.error(err)
  return setTimeout(async () => {
    await shutDownServices()
  }, delay)
})
.on("unhandledRejection", (error) => {
  log.error(error)
})

bootstrap()
