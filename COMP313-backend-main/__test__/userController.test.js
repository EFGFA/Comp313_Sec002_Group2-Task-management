import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../server.js";
import { UserModel } from "../models/user.js";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';

dotenv.config();

let mongoServer;
let individualUserToken, businessUserToken, adminUserToken;
let individualUserId, businessUserId, adminUserId;

const REGISTER_PATH = "/api/register";
const LOGIN_PATH = "/api/login";
const EMPLOYEES_PATH = "/api/employees";
const ME_PATH = "/api/user-info";


beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  if (mongoose.connection.readyState !== 0) { await mongoose.disconnect(); }
  await mongoose.connect(mongoUri);

  await UserModel.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("password123", salt);

  const individualUser = await UserModel.create({ name: "Test Individual", email: "individual@test.com", password: hashedPassword, type: "User" });
  individualUserId = individualUser._id.toString();

  const businessUser = await UserModel.create({ name: "Test Business", email: "business@test.com", password: hashedPassword, type: "Employee" });
  businessUserId = businessUser._id.toString();

  const adminUser = await UserModel.create({ name: "Test Admin", email: "admin@test.com", password: hashedPassword, type: "Admin" });
  adminUserId = adminUser._id.toString();

  let res = await request(app).post(LOGIN_PATH).send({ email: "individual@test.com", password: "password123", type: "User" });
  if (res.statusCode === 200) individualUserToken = res.body.token;

  res = await request(app).post(LOGIN_PATH).send({ email: "business@test.com", password: "password123", type: "Employee" });
  if (res.statusCode === 200) businessUserToken = res.body.token;

  res = await request(app).post(LOGIN_PATH).send({ email: "admin@test.com", password: "password123", type: "Admin" });
  if (res.statusCode === 200) adminUserToken = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


describe("User API Routes Integration Tests", () => {

  test(`POST ${REGISTER_PATH} - Register a new individual user`, async () => {
    const res = await request(app).post(REGISTER_PATH).send({ name: "New Reg User", email: "newreguser@test.com", password: "password123", type: "User" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "User registered successfully!");
  });

  test(`POST ${REGISTER_PATH} - Register a new business user (Employee)`, async () => {
    const res = await request(app).post(REGISTER_PATH).send({ name: "New Reg Employee", email: "newregemployee@test.com", password: "password123", type: "Employee" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "User registered successfully!");
  });

  test(`POST ${REGISTER_PATH} - Register a new admin user`, async () => {
    const res = await request(app).post(REGISTER_PATH).send({ name: "New Reg Admin", email: "newregadmin@test.com", password: "password123", type: "Admin" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "User registered successfully!");
  });

  test(`POST ${REGISTER_PATH} - Should fail if email already exists`, async () => {
    const res = await request(app).post(REGISTER_PATH).send({ name: "Duplicate User", email: "individual@test.com", password: "password123", type: "User" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "User already exists");
  });

  test(`POST ${LOGIN_PATH} - Login individual user successfully`, async () => {
    const res = await request(app).post(LOGIN_PATH).send({ email: "individual@test.com", password: "password123", type: "User" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("id", individualUserId);
    expect(res.body).toHaveProperty("type", "User");
  });

  test(`POST ${LOGIN_PATH} - Login business user (Employee) successfully`, async () => {
    const res = await request(app).post(LOGIN_PATH).send({ email: "business@test.com", password: "password123", type: "Employee" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("id", businessUserId);
    expect(res.body).toHaveProperty("type", "Employee");
  });

  test(`POST ${LOGIN_PATH} - Login admin user successfully`, async () => {
    const res = await request(app).post(LOGIN_PATH).send({ email: "admin@test.com", password: "password123", type: "Admin" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("id", adminUserId);
    expect(res.body).toHaveProperty("type", "Admin");
  });

  test(`POST ${LOGIN_PATH} - Should fail with invalid password`, async () => {
    const res = await request(app).post(LOGIN_PATH).send({ email: "individual@test.com", password: "wrongpassword", type: "User" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid Credential!");
  });

  test(`POST ${LOGIN_PATH} - Should fail with non-existent email`, async () => {
    const res = await request(app).post(LOGIN_PATH).send({ email: "nosuchuser@test.com", password: "password123", type: "User" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid Credential!");
  });

  test(`POST ${LOGIN_PATH} - Should fail with user type mismatch`, async () => {
    const res = await request(app).post(LOGIN_PATH).send({ email: "individual@test.com", password: "password123", type: "Admin" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "User type mismatch!");
  });

  /*
  test(`POST /api/register - Admin add employee successfully (if register allows)`, async () => {
     // ... Test logic for admin using register route ...
  });
  */

  test(`GET ${EMPLOYEES_PATH} - Admin get all employees successfully`, async () => {
      expect(adminUserToken).toBeDefined();
      const res = await request(app)
          .get(EMPLOYEES_PATH)
          .set("Authorization", `Bearer ${adminUserToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const employeeFound = res.body.some(emp => emp._id === businessUserId && emp.type === 'Employee');
      expect(employeeFound).toBe(true);

      res.body.forEach(emp => {
          expect(emp.type).toBe("Employee");
          expect(emp).not.toHaveProperty("password");
      });
  });

   test(`GET ${EMPLOYEES_PATH} - Should fail getting employees if not Admin`, async () => {
     expect(individualUserToken).toBeDefined();
     const res = await request(app)
       .get(EMPLOYEES_PATH)
       .set("Authorization", `Bearer ${individualUserToken}`);
     expect(res.statusCode).toBe(403);
   });

  test(`GET ${ME_PATH} - Retrieve authenticated individual user info`, async () => {
    expect(individualUserToken).toBeDefined();
    const res = await request(app).get(ME_PATH).set("Authorization", `Bearer ${individualUserToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", individualUserId);
    expect(res.body).toHaveProperty("name", "Test Individual");
    expect(res.body).toHaveProperty("email", "individual@test.com");
    expect(res.body).toHaveProperty("type", "User");
    expect(res.body).not.toHaveProperty("password");
  });

  test(`GET ${ME_PATH} - Retrieve authenticated business user info`, async () => {
    expect(businessUserToken).toBeDefined();
    const res = await request(app).get(ME_PATH).set("Authorization", `Bearer ${businessUserToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", businessUserId);
    expect(res.body).toHaveProperty("name", "Test Business");
    expect(res.body).toHaveProperty("email", "business@test.com");
    expect(res.body).toHaveProperty("type", "Employee");
    expect(res.body).not.toHaveProperty("password");
  });

  test(`GET ${ME_PATH} - Retrieve authenticated admin user info`, async () => {
    expect(adminUserToken).toBeDefined();
    const res = await request(app).get(ME_PATH).set("Authorization", `Bearer ${adminUserToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", adminUserId);
    expect(res.body).toHaveProperty("name", "Test Admin");
    expect(res.body).toHaveProperty("email", "admin@test.com");
    expect(res.body).toHaveProperty("type", "Admin");
    expect(res.body).not.toHaveProperty("password");
  });

  test(`GET ${ME_PATH} - Should fail without authentication`, async () => {
    const res = await request(app).get(ME_PATH);
    expect(res.statusCode).toBe(401);
  });
});