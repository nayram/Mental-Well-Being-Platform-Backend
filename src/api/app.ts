import express, { Application } from "express";
import pino from "pino-http";
import helmet from "helmet";
import cors from "cors";
import { logger } from "../lib/logger";
import { appRoutes } from "./routes";

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
    .use(appRoutes);
  return app;
};
