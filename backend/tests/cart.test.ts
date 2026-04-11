import request from "supertest";
import app from "../src/app.module";
import { prisma } from "../src/lib/prisma";
import { bearerToken, createProductFixture, createUser } from "./helpers/test-utils";

describe("Cart API", () => {
  it("adds an item to the authenticated user's cart", async () => {
    const { accessToken } = await createUser();
    const { variant } = await createProductFixture();

    const response = await request(app)
      .post("/api/cart/add")
      .set("Authorization", bearerToken(accessToken))
      .send({
        variantId: variant.id,
        quantity: 2,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      variantId: variant.id,
      quantity: 2,
    });

    const savedCartItem = await prisma.cartItem.findUnique({
      where: { id: response.body.data.id },
    });

    expect(savedCartItem).not.toBeNull();
  });

  it("updates a cart item quantity", async () => {
    const { accessToken } = await createUser();
    const { variant } = await createProductFixture();

    const addResponse = await request(app)
      .post("/api/cart/add")
      .set("Authorization", bearerToken(accessToken))
      .send({
        variantId: variant.id,
        quantity: 1,
      });

    const response = await request(app)
      .put("/api/cart/update")
      .set("Authorization", bearerToken(accessToken))
      .send({
        cartItemId: addResponse.body.data.id,
        quantity: 4,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.quantity).toBe(4);
  });

  it("removes an item from the cart", async () => {
    const { accessToken } = await createUser();
    const { variant } = await createProductFixture();

    const addResponse = await request(app)
      .post("/api/cart/add")
      .set("Authorization", bearerToken(accessToken))
      .send({
        variantId: variant.id,
        quantity: 1,
      });

    const response = await request(app)
      .delete(`/api/cart/remove/${addResponse.body.data.id}`)
      .set("Authorization", bearerToken(accessToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Item removed from cart");

    const deletedCartItem = await prisma.cartItem.findUnique({
      where: { id: addResponse.body.data.id },
    });

    expect(deletedCartItem).toBeNull();
  });
});
