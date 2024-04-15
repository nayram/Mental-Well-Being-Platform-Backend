import { Application, Response } from "express";
import http, { Server } from "http";
import { generateSignedToken, httpStatus } from "../../../helpers";
import { createApp } from "../../app";

import { authMiddleware, ExtendedRequest } from "../auth.middleware";

const mockedNext = jest.fn();

describe("AuthMiddleware", () => {
  let app: Application;
  let server: Server;

  beforeAll(async () => {
    app = createApp();
    server = http.createServer(app);
  });

  afterAll(async () => {
    server.close();
  });

  it("should validate existing token with given token", async () => {
    const user = {
      id: "1",
    };
    const token = generateSignedToken(user.id);

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as ExtendedRequest;

    await authMiddleware(req, {} as Response, mockedNext);

    expect(req.user).toBeDefined();
  });

  it("should throw Unauthorized error when auth token is not provided", async () => {
    const req = { headers: {} } as ExtendedRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    await authMiddleware(req, res, mockedNext);
    expect(res.status).toHaveBeenCalledWith(httpStatus.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should throw Unauthorized error when token is not valid", async () => {
    const req = {
      headers: { authorization: "Bearer not_valid" },
    } as ExtendedRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    await authMiddleware(req, res, mockedNext);
    expect(res.status).toHaveBeenCalledWith(httpStatus.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith({
      name: "UnauthorizedError",
      message: "Token is invalid",
    });
  });

  it("should throw Unauthorized error when token is expired", async () => {
    const expirydate = "-2 days";
    const userId = "1";
    const token = generateSignedToken(userId, expirydate);
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as ExtendedRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    await authMiddleware(req, res, mockedNext);
    expect(res.status).toHaveBeenCalledWith(httpStatus.UNAUTHORIZED);
    expect(res.send).toHaveBeenCalledWith({
      name: "UnauthorizedError",
      message: "Token expired",
    });
  });
});
