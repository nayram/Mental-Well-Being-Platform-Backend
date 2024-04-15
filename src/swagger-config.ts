import { Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import config from "config";
import { logger } from "./lib/logger";

const log = logger({ serviceName: "api" }).child({ component: "swagger" });

const port = config.get<number>("port");

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "KOA Health User Activity Manager",
      version: "0.1.0",
      description: "This is a RESTful API for managing user activities.",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ["./src/api/**/routes.ts"],
};
const swaggerSpec = swaggerJsdoc(options);
async function swaggerDocs(app: Express) {
  // Swagger page
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get("/docs.json", (_: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  log.info(`Swagger is available on http://localhost:${port}/docs`);
}

export default swaggerDocs;
