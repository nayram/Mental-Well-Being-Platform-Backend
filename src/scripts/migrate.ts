import {Migrator} from '@pgkit/migrator'
import { pgConnector, PgConnection } from 'lib/postgres-utils/resource'
import config from 'config'

const client = pgConnector(config.get<PgConnection>('db'))

const migrator = new Migrator({
  migrationsPath: __dirname + '/migrations',
  migrationTableName: 'migration',
  client,
  logger: Migrator.prettyLogger,
})
migrator.runAsCLI()
