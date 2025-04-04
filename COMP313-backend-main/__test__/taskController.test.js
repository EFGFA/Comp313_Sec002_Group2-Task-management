import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../server.js";
import { PostModel } from "../models/post.js";
import { UserModel } from "../models/user.js";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";

let mongoServer;
let authToken;
let testUserId;
let testTaskId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.disconnect();
  await mongoose.connect(mongoUri);

  // Create Dummy Data
  const testUser = new UserModel({
    name: "Test User",
    email: "test@example.com",
    password: "test123",
    type: "User",
  });

  await testUser.save();
  testUserId = testUser._id.toString();

  authToken = jwt.sign({ id: testUserId, type: "User" }, "1234", {
    expiresIn: "1h",
  });

  const testTask = new PostModel({
    title: "1st Release",
    text: "1st Release Test",
    status: "not started",
    userId: testUserId,
  });

  await testTask.save();
  testTaskId = testTask._id.toString();
});

// Task Creation Test
test("POST /api/tasks - Create a new task", async () => {
  const res = await request(app)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      title: "2nd Release",
      text: "2nd Release Test",
      status: "not started",
    });

  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty("title", "2nd Release");
});

// Get All Tasks Test
test("GET /api/tasks - Retrieve tasks", async () => {
  const res = await request(app)
    .get("/api/tasks")
    .set("Authorization", `Bearer ${authToken}`);

  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThanOrEqual(1);
});

// Get by ID Task Test
test("GET /api/tasks/:id - Retrieve specific task", async () => {
  const res = await request(app)
    .get(`/api/tasks/${testTaskId}`)
    .set("Authorization", `Bearer ${authToken}`);

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("title", "1st Release");
});

// Edit Task Test
test("PUT /api/tasks/:id - Update task", async () => {
  const res = await request(app)
    .put(`/api/tasks/${testTaskId}`)
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      title: "Updated 2nd Release",
      text: "Updated 2nd Release Test",
      status: "in progress",
    });

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("title", "Updated 2nd Release");
  expect(res.body.status).toBe("in progress");
});

// Delete Task Test
test("DELETE /api/tasks/:id - Delete task", async () => {
  const res = await request(app)
    .delete(`/api/tasks/${testTaskId}`)
    .set("Authorization", `Bearer ${authToken}`);

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("message", "Task deleted successfully");
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});
