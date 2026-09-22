import type { Notification } from "@/types";

/**
 * Resolves the destination URL for a given notification based on its payload or type.
 */
export function getNotificationTarget(
  notification: Notification,
  isAdmin: boolean = false
): string {
  // 1. Explicit link in notification data payload
  if (notification.data && typeof notification.data === "object") {
    const data = notification.data as Record<string, unknown>;
    if (typeof data.link === "string" && data.link.trim() !== "") {
      return data.link;
    }
    if (typeof data.url === "string" && data.url.trim() !== "") {
      return data.url;
    }
    if (typeof data.productId === "string" && data.productId.trim() !== "") {
      return `/products/${data.productId}`;
    }
    if (typeof data.orderId === "string" && data.orderId.trim() !== "") {
      return isAdmin
        ? `/admin/orders?search=${encodeURIComponent(data.orderId)}`
        : "/account/orders";
    }
  }

  // 2. Infer destination by notification type
  const type = (notification.type || "").toUpperCase();

  if (type.includes("CART") || type.includes("BAG")) {
    const data = notification.data as Record<string, unknown> | undefined;
    const coupon = typeof data?.couponCode === "string" ? data.couponCode : "";
    return coupon ? `/cart?promo=${encodeURIComponent(coupon)}` : "/cart";
  }

  if (type.includes("ORDER")) {
    return isAdmin ? "/admin/orders" : "/account/orders";
  }

  if (type.includes("RENTAL")) {
    return isAdmin ? "/admin/rentals" : "/account/rentals";
  }

  if (type.includes("RETURN")) {
    return isAdmin ? "/admin/returns" : "/account/returns";
  }

  if (type.includes("STOCK") || type === "LOW_STOCK") {
    return isAdmin ? "/admin/inventory" : "/products";
  }

  if (type.includes("DISCOUNT") || type.includes("PROMO")) {
    return isAdmin ? "/admin/discounts" : "/products";
  }

  // Fallback to all notifications view
  return isAdmin ? "/admin/notifications" : "/account/notifications";
}
