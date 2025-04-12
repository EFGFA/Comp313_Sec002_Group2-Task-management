import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../server.js";
import { PostModel } from "../models/post.js";
import { UserModel } from "../models/user.js";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';

dotenv.config();

let mongoServer;
let individualUserToken, businessUserToken, adminUserToken;
let individualUserId, businessUserId, adminUserId;
let taskByIndividualId, taskByAdminId, taskAssignedToBusinessId;

const LOGIN_PATH = "/api/login";
const TASKS_PATH = "/api/tasks";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  if (mongoose.connection.readyState !== 0) { await mongoose.disconnect(); }
  await mongoose.connect(mongoUri);

  await UserModel.deleteMany({});
  await PostModel.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("password123", salt);

  const individualUser = await UserModel.create({ name: "Test Individual Task", email: "individual.task@test.com", password: hashedPassword, type: "User" });
  individualUserId = individualUser._id.toString();

  const businessUser = await UserModel.create({ name: "Test Business Task", email: "business.task@test.com", password: hashedPassword, type: "Employee" });
  businessUserId = businessUser._id.toString();

  const adminUser = await UserModel.create({ name: "Test Admin Task", email: "admin.task@test.com", password: hashedPassword, type: "Admin" });
  adminUserId = adminUser._id.toString();

  taskByIndividualId = (await PostModel.create({ title: "Indie Task 1", text: "Owned by individual", userId: individualUserId, status: "not started" }))._id.toString();
  taskByAdminId = (await PostModel.create({ title: "Admin Task 1", text: "Owned by admin", userId: adminUserId, status: "not started" }))._id.toString();
  taskAssignedToBusinessId = (await PostModel.create({ title: "Assigned Task 1", text: "Assigned to business", userId: adminUserId, assignedTo: [businessUserId], status: "not started" }))._id.toString();

  let res = await request(app).post(LOGIN_PATH).send({ email: "individual.task@test.com", password: "password123", type: "User" });
  if (res.statusCode === 200) individualUserToken = res.body.token;

  res = await request(app).post(LOGIN_PATH).send({ email: "business.task@test.com", password: "password123", type: "Employee" });
  if (res.statusCode === 200) businessUserToken = res.body.token;

  res = await request(app).post(LOGIN_PATH).send({ email: "admin.task@test.com", password: "password123", type: "Admin" });
  if (res.statusCode === 200) adminUserToken = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


describe("Task API Routes Integration Tests", () => {

  describe("As Individual User", () => {
    let newlyCreatedTaskId;

    test(`POST ${TASKS_PATH} - Create a new task`, async () => {
      expect(individualUserToken).toBeDefined();
      const res = await request(app).post(TASKS_PATH).set("Authorization", `Bearer ${individualUserToken}`)
        .send({ title: "My New Task", text: "Individual user created this", status: "not started" });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("title", "My New Task");
      expect(res.body).toHaveProperty("userId", individualUserId);
      newlyCreatedTaskId = res.body._id;
    });

    test(`GET ${TASKS_PATH} - Retrieve only own tasks`, async () => {
        expect(individualUserToken).toBeDefined();
        const res = await request(app).get(TASKS_PATH).set("Authorization", `Bearer ${individualUserToken}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        res.body.forEach(task => {
            expect(task.userId._id.toString()).toBe(individualUserId);
        });
        expect(res.body.some(task => task._id === taskByIndividualId)).toBe(true);
        expect(res.body.some(task => task._id === newlyCreatedTaskId)).toBe(true);
        expect(res.body.some(task => task._id === taskByAdminId)).toBe(false);
        expect(res.body.some(task => task._id === taskAssignedToBusinessId)).toBe(false);
    });

    test(`PUT ${TASKS_PATH}/:id - Update own task`, async () => {
      expect(individualUserToken).toBeDefined();
      expect(newlyCreatedTaskId).toBeDefined();
      const res = await request(app).put(`${TASKS_PATH}/${newlyCreatedTaskId}`).set("Authorization", `Bearer ${individualUserToken}`)
        .send({ title: "My Task Updated", status: "in progress" });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("title", "My Task Updated");
      expect(res.body.status).toBe("in progress");
    });

    test(`PUT ${TASKS_PATH}/:id - Should fail to update task owned by Admin`, async () => {
        expect(individualUserToken).toBeDefined();
        expect(taskByAdminId).toBeDefined();
        const res = await request(app).put(`${TASKS_PATH}/${taskByAdminId}`).set("Authorization", `Bearer ${individualUserToken}`)
            .send({ title: "Attempt Update Admin Task" });
        expect(res.statusCode).toBe(403);
    });

    test(`DELETE ${TASKS_PATH}/:id - Delete own task`, async () => {
      expect(individualUserToken).toBeDefined();
      expect(newlyCreatedTaskId).toBeDefined();
      const res = await request(app).delete(`${TASKS_PATH}/${newlyCreatedTaskId}`).set("Authorization", `Bearer ${individualUserToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Task deleted successfully");

      const deletedTask = await PostModel.findById(newlyCreatedTaskId);
      expect(deletedTask).toBeNull();
    });

    test(`DELETE ${TASKS_PATH}/:id - Should fail to delete task owned by Admin`, async () => {
        expect(individualUserToken).toBeDefined();
        expect(taskByAdminId).toBeDefined();
        const res = await request(app).delete(`${TASKS_PATH}/${taskByAdminId}`).set("Authorization", `Bearer ${individualUserToken}`);
        expect(res.statusCode).toBe(403);
    });
  });


  describe("As Business User (Employee)", () => {
    test(`GET ${TASKS_PATH} - Retrieve only assigned tasks`, async () => {
        expect(businessUserToken).toBeDefined();
        const res = await request(app).get(TASKS_PATH).set("Authorization", `Bearer ${businessUserToken}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        res.body.forEach(task => {
            expect(task.assignedTo.map(user => user._id.toString())).toContain(businessUserId);
        });
        expect(res.body.some(task => task._id === taskAssignedToBusinessId)).toBe(true);
        expect(res.body.some(task => task._id === taskByIndividualId)).toBe(false);
        expect(res.body.some(task => task._id === taskByAdminId)).toBe(false);
    });

    test(`PUT ${TASKS_PATH}/:id/status - Change status of assigned task`, async () => {
      expect(businessUserToken).toBeDefined();
      expect(taskAssignedToBusinessId).toBeDefined();
      const res = await request(app).put(`${TASKS_PATH}/${taskAssignedToBusinessId}/status`).set("Authorization", `Bearer ${businessUserToken}`)
        .send({ status: "completed" });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status", "completed");
    });

     test(`PUT ${TASKS_PATH}/:id/status - Should fail to change status of task not assigned`, async () => {
        expect(businessUserToken).toBeDefined();
        expect(taskByAdminId).toBeDefined();
        const res = await request(app).put(`${TASKS_PATH}/${taskByAdminId}/status`).set("Authorization", `Bearer ${businessUserToken}`)
            .send({ status: "in progress" });
        expect(res.statusCode).toBe(403);
    });

    test(`PUT ${TASKS_PATH}/:id - Should fail to update non-status fields of assigned task`, async () => {
        expect(businessUserToken).toBeDefined();
        expect(taskAssignedToBusinessId).toBeDefined();
        const res = await request(app).put(`${TASKS_PATH}/${taskAssignedToBusinessId}`).set("Authorization", `Bearer ${businessUserToken}`)
            .send({ title: "Attempt Title Change by Employee" });
        expect(res.statusCode).toBe(403);
    });

    test(`POST ${TASKS_PATH} - Should fail to create a task`, async () => {
      expect(businessUserToken).toBeDefined();
      const res = await request(app).post(TASKS_PATH).set("Authorization", `Bearer ${businessUserToken}`)
        .send({ title: "Employee Task Attempt", text: "This should fail" });
      expect(res.statusCode).toBe(403);
    });

    test(`DELETE ${TASKS_PATH}/:id - Should fail to delete a task`, async () => {
        expect(businessUserToken).toBeDefined();
        expect(taskAssignedToBusinessId).toBeDefined();
        const res = await request(app).delete(`${TASKS_PATH}/${taskAssignedToBusinessId}`).set("Authorization", `Bearer ${businessUserToken}`);
        expect(res.statusCode).toBe(403);
    });
  });


  describe("As Admin User", () => {
    let taskCreatedByAdminForAssignment;

    test(`POST ${TASKS_PATH} - Create a new task`, async () => {
      expect(adminUserToken).toBeDefined();
      const res = await request(app).post(TASKS_PATH).set("Authorization", `Bearer ${adminUserToken}`)
        .send({ title: "Admin Creates New Task", text: "For assignment test", status: "not started" });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("title", "Admin Creates New Task");
      expect(res.body).toHaveProperty("userId", adminUserId);
      taskCreatedByAdminForAssignment = res.body._id;
    });

    test(`PUT ${TASKS_PATH}/:id - Assign task to business user`, async () => {
        expect(adminUserToken).toBeDefined();
        expect(taskCreatedByAdminForAssignment).toBeDefined();
        expect(businessUserId).toBeDefined();
        const res = await request(app)
            .put(`${TASKS_PATH}/${taskCreatedByAdminForAssignment}`)
            .set("Authorization", `Bearer ${adminUserToken}`)
            .send({ assignedTo: [businessUserId] });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.assignedTo)).toBe(true);
        expect(res.body.assignedTo.some(user => user._id === businessUserId)).toBe(true);
    });

    test(`GET ${TASKS_PATH} - Retrieve all tasks`, async () => {
        expect(adminUserToken).toBeDefined();
        const res = await request(app).get(TASKS_PATH).set("Authorization", `Bearer ${adminUserToken}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some(task => task._id === taskByIndividualId)).toBe(true);
        expect(res.body.some(task => task._id === taskByAdminId)).toBe(true);
        expect(res.body.some(task => task._id === taskAssignedToBusinessId)).toBe(true);
        if (taskCreatedByAdminForAssignment) {
            expect(res.body.some(task => task._id === taskCreatedByAdminForAssignment)).toBe(true);
        }
    });

    test(`PUT ${TASKS_PATH}/:id - Update task created by individual user`, async () => {
        expect(adminUserToken).toBeDefined();
        expect(taskByIndividualId).toBeDefined();
        const res = await request(app).put(`${TASKS_PATH}/${taskByIndividualId}`).set("Authorization", `Bearer ${adminUserToken}`)
            .send({ title: "Admin Edited Indie Task", status: "in progress" });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("title", "Admin Edited Indie Task");
        expect(res.body.status).toBe("in progress");
    });

     test(`PUT ${TASKS_PATH}/:id - Update task created by admin`, async () => {
        expect(adminUserToken).toBeDefined();
        expect(taskByAdminId).toBeDefined();
        const res = await request(app).put(`${TASKS_PATH}/${taskByAdminId}`).set("Authorization", `Bearer ${adminUserToken}`)
            .send({ title: "Admin Edited Own Task", text: "Updated text by admin" });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("title", "Admin Edited Own Task");
    });

    test(`DELETE ${TASKS_PATH}/:id - Delete task created by individual user`, async () => {
        expect(adminUserToken).toBeDefined();
        let tempIndieTask = await PostModel.create({
            title: "Temp Indie Task For Admin Delete",
            userId: individualUserId,
            text: "Temporary text for delete test",
            status: "not started"
        });
        const tempIndieTaskId = tempIndieTask._id.toString();
        expect(tempIndieTaskId).toBeDefined();

        const res = await request(app).delete(`${TASKS_PATH}/${tempIndieTaskId}`).set("Authorization", `Bearer ${adminUserToken}`);
        expect(res.statusCode).toBe(200);

        const deletedTask = await PostModel.findById(tempIndieTaskId);
        expect(deletedTask).toBeNull();
    });

     test(`DELETE ${TASKS_PATH}/:id - Delete task created by admin`, async () => {
        expect(adminUserToken).toBeDefined();
        expect(taskByAdminId).toBeDefined();
        const res = await request(app).delete(`${TASKS_PATH}/${taskByAdminId}`).set("Authorization", `Bearer ${adminUserToken}`);
        expect(res.statusCode).toBe(200);

        const deletedTask = await PostModel.findById(taskByAdminId);
        expect(deletedTask).toBeNull();
    });
  });

});