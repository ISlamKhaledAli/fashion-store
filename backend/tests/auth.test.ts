import request from "supertest";
import app from "../src/app.module";
import { prisma } from "../src/lib/prisma";
import { createUser } from "./helpers/test-utils";

describe("Auth API", () => {
  it("registers a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      password: "Password123!",
      phone: "+201000000000",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("User registered successfully");
    expect(response.body.data.user).toMatchObject({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      role: "CUSTOMER",
    });
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));

    const createdUser = await prisma.user.findUnique({
      where: { email: "jane.doe@example.com" },
    });

    expect(createdUser).not.toBeNull();
    expect(createdUser?.password).not.toBe("Password123!");
  });

  it("logs in an existing user", async () => {
    const { user, password } = await createUser({
      email: "login.user@example.com",
      name: "Login User",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: user.email,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.data.user).toMatchObject({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));
  });

  it("refreshes an access token with a valid refresh token", async () => {
    const registerResponse = await request(app).post("/api/auth/register").send({
      name: "Refresh User",
      email: "refresh.user@example.com",
      password: "Password123!",
    });

    const response = await request(app).post("/api/auth/refresh").send({
      refreshToken: registerResponse.body.data.refreshToken,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
  });

  it("returns the authenticated user for /me", async () => {
    const { user, accessToken } = await createUser({
      email: "me.user@example.com",
      name: "Me User",
    });

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  });
});
