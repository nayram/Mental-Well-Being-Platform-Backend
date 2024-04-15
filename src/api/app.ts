import express, { Application } from "express";
import pino from "pino-http";
import helmet from "helmet";
import cors from "cors";
import { errors } from "celebrate";
import swaggerDocs from "../swagger-config";
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
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use("/api", appRoutes)
    .use(errors());

  swaggerDocs(app);
  return app;
};
