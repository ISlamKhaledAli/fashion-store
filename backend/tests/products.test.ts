import request from "supertest";
import app from "../src/app.module";
import {
  bearerToken,
  createAdminUser,
  createCategory,
  createProductFixture,
  createUser,
} from "./helpers/test-utils";

describe("Products API", () => {
  it("returns only active products from the catalog", async () => {
    const category = await createCategory();
    await createProductFixture({
      name: "Visible Product",
      categoryId: category.id,
      status: "ACTIVE",
    });
    await createProductFixture({
      name: "Draft Product",
      categoryId: category.id,
      status: "DRAFT",
    });

    const response = await request(app).get("/api/products");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe("Visible Product");
    expect(response.body.pagination).toMatchObject({
      page: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it("rejects non-admin users from creating products", async () => {
    const { accessToken } = await createUser();
    const category = await createCategory();

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", bearerToken(accessToken))
      .send({
        name: "Blocked Product",
        description: "Customers should not create products",
        price: 99.99,
        categoryId: category.id,
        status: "ACTIVE",
        featured: false,
        variants: [
          {
            size: "L",
            color: "White",
            colorHex: "#ffffff",
            stock: 6,
            sku: "blocked-product-sku",
          },
        ],
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Access denied. Admin privileges required.");
  });

  it("creates a product for admin users", async () => {
    const { accessToken } = await createAdminUser();
    const category = await createCategory();

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", bearerToken(accessToken))
      .send({
        name: "Admin Product",
        description: "Created from an integration test",
        price: 149.99,
        comparePrice: 179.99,
        categoryId: category.id,
        status: "ACTIVE",
        featured: true,
        variants: [
          {
            size: "M",
            color: "Navy",
            colorHex: "#001f3f",
            stock: 8,
            sku: "admin-product-sku",
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      name: "Admin Product",
      categoryId: category.id,
      status: "ACTIVE",
      featured: true,
    });
    expect(response.body.data.slug).toContain("admin-product");
    expect(response.body.data.variants).toHaveLength(1);
  });
});
