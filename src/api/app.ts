import express, { Application } from "express";
import pino from "pino-http";
import helmet from "helmet";
import cors from "cors";
import { errors } from 'celebrate'
import { logger } from "../lib/logger";
import { appRoutes } from "./routes";
import { notFound, sendError } from '../helpers'

const app = express();

const log = logger({ serviceName: "api" });

const requestLogger = pino({
  logger: log,
});

export const createApp = (): Application => {
  app
    .use(requestLogger)
    .use(cors())
    .use(helmet())
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use('/api',appRoutes)
    .use(notFound)
    .use(sendError)
    .use(errors())
    
    
    
  return app;
};
