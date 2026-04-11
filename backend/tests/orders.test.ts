import request from "supertest";
import app from "../src/app.module";
import { prisma } from "../src/lib/prisma";
import { bearerToken, createAddress, createProductFixture, createUser } from "./helpers/test-utils";

describe("Orders API", () => {
  it("creates an order from the current cart", async () => {
    const { user, accessToken } = await createUser();
    const address = await createAddress(user.id);
    const { product, variant } = await createProductFixture({
      price: 50,
      stock: 7,
    });

    const cart = await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: variant.id,
        quantity: 2,
      },
    });

    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", bearerToken(accessToken))
      .send({
        addressId: address.id,
        notes: "Please leave the parcel with reception",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.clientSecret).toBe("pi_mock_test_secret");
    expect(response.body.data.order).toMatchObject({
      userId: user.id,
      addressId: address.id,
      subtotal: 100,
      shipping: 10,
      paymentStatus: "UNPAID",
      status: "PENDING",
    });
    expect(response.body.data.order.total).toBeCloseTo(120, 5);

    const storedOrder = await prisma.order.findUnique({
      where: { id: response.body.data.order.id },
      include: { items: true },
    });
    const updatedVariant = await prisma.variant.findUnique({
      where: { id: variant.id },
    });
    const remainingCartItems = await prisma.cartItem.count({
      where: { cartId: cart.id },
    });

    expect(storedOrder?.items).toHaveLength(1);
    expect(storedOrder?.items[0]).toMatchObject({
      productId: product.id,
      variantId: variant.id,
      quantity: 2,
      price: 50,
    });
    expect(updatedVariant?.stock).toBe(5);
    expect(remainingCartItems).toBe(0);

    const stripeService = jest.requireMock("../src/services/stripe") as {
      createPaymentIntent: jest.Mock;
    };

    expect(stripeService.createPaymentIntent).toHaveBeenCalledWith(120, "usd", {
      orderId: response.body.data.order.id,
    });
  });

  it("cancels a pending order", async () => {
    const { user, accessToken } = await createUser();
    const address = await createAddress(user.id);
    const { product, variant } = await createProductFixture({
      price: 40,
    });

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        addressId: address.id,
        subtotal: 40,
        shipping: 10,
        tax: 4,
        total: 54,
        items: {
          create: [
            {
              productId: product.id,
              variantId: variant.id,
              quantity: 1,
              price: 40,
            },
          ],
        },
      },
    });

    const response = await request(app)
      .put(`/api/orders/${order.id}/cancel`)
      .set("Authorization", bearerToken(accessToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Order cancelled");

    const cancelledOrder = await prisma.order.findUnique({
      where: { id: order.id },
    });

    expect(cancelledOrder?.status).toBe("CANCELLED");
  });
});
