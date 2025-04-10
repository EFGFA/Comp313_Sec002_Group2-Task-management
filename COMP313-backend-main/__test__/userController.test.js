import { jest } from "@jest/globals";
import { registerUser, loginUser } from "../controllers/userController.js";
import { UserModel } from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("User Controller Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("registerUser - Register a new user", async () => {
        const req = { body: { name: "Test", email: "test@example.com", password: "test123", type: "User" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        const findOneSpy = jest.spyOn(UserModel, "findOne").mockResolvedValue(null);
        const createSpy = jest.spyOn(UserModel.prototype, "save").mockResolvedValue({ _id: "12345", name: "Test", email: "test@example.com" });

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "User registered successfully!" });
        findOneSpy.mockRestore();
        createSpy.mockRestore();
    });

    test("loginUser - Successful login", async () => {
        const req = { body: { email: "test@example.com", password: "test123" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };

        const hashedPassword = await bcrypt.hash("test123", 10);
        const user = { _id: "12345", email: "test@example.com", password: hashedPassword, type: "User" };

        const findOneSpy = jest.spyOn(UserModel, "findOne").mockResolvedValue(user);
        bcrypt.compare = jest.fn().mockResolvedValue(true);
        jwt.sign = jest.fn().mockReturnValue("mocked-jwt-token");

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Login Successful",
            id: user._id,
            type: user.type,
            token: "mocked-jwt-token",
        });
        expect(res.cookie).toHaveBeenCalled();
        findOneSpy.mockRestore();
    });
});