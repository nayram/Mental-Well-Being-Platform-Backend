import http, { Server } from "http";
import { Application } from "express";
import supertest from "supertest";
import { createActivities } from "../../../ models/activities";
import { createApp } from "../../app";
import { Fixtures, closeDb, truncateTable } from "../../../helpers/utils";

describe("API: GET /api/v1/activities", () => {
  let app: Application;
  let server: Server;

  beforeAll(async () => {
    app = createApp();
    server = http.createServer(app);
    await createActivities(Fixtures.activities);
  });

  afterAll(async () => {
    await truncateTable("activity");
    await closeDb();
    server.close();
  });

  it("should return all activities", async () => {
    const response = await supertest(app).get("/api/v1/activities");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(Fixtures.activities.length);
    const activities = response.body;
    activities.forEach((activity: any) => {
      expect(activity).toHaveProperty("id");
      expect(activity).toHaveProperty("created_at");
      expect(activity).toHaveProperty("updated_at");
      expect(activity).toHaveProperty("title");
      expect(activity).toHaveProperty("description");
      expect(activity).toHaveProperty("category");
      expect(activity).toHaveProperty("duration");
      expect(activity).toHaveProperty("difficulty_level");
      expect(activity).toHaveProperty("content");
    });
  });
});
