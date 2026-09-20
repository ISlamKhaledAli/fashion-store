import nodemailer from "nodemailer";
import { env } from "../utils/validateEnv";
import logger from "../utils/logger";

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: parseInt(env.EMAIL_PORT || "587"),
  secure: env.EMAIL_SECURE === "true",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    if (!env.EMAIL_USER || !env.EMAIL_PASS) {
      logger.warn(
        `SMTP credentials not fully configured. Skipped sending email to ${to}`
      );
      return;
    }

    await transporter.sendMail({
      from: `"The Curator Atelier" <${env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent successfully to ${to}`);
  } catch (error) {
    logger.error("Error sending email:", { error });
  }
};

/**
 * Common responsive HTML wrapper for The Curator transactional emails
 */
export const renderEmailShell = (
  title: string,
  preheader: string,
  contentHtml: string
): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f7f7f8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #18181b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f7f7f8;
      padding: 40px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background-color: #09090b;
      padding: 36px 32px;
      text-align: center;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.3em;
      color: #ffffff;
      text-transform: uppercase;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 10px;
      letter-spacing: 0.25em;
      color: #a1a1aa;
      text-transform: uppercase;
      margin-top: 6px;
    }
    .body {
      padding: 36px 32px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #09090b;
      margin: 0 0 12px 0;
    }
    .subtitle {
      font-size: 13px;
      line-height: 1.6;
      color: #71717a;
      margin: 0 0 28px 0;
    }
    .table-item {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .table-item th {
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #a1a1aa;
      border-bottom: 1px solid #e4e4e7;
      padding-bottom: 10px;
    }
    .table-item td {
      padding: 14px 0;
      border-bottom: 1px solid #f4f4f5;
      font-size: 13px;
    }
    .cta-button {
      display: inline-block;
      background-color: #09090b;
      color: #ffffff !important;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      margin: 24px 0;
      text-align: center;
    }
    .footer {
      background-color: #fcfcfd;
      padding: 24px 32px;
      border-top: 1px solid #f4f4f5;
      text-align: center;
      font-size: 11px;
      color: #a1a1aa;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#f7f7f8;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <table class="wrapper" role="presentation" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table class="container" role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <h1 class="brand-title">The Curator</h1>
              <div class="brand-subtitle">Archival Atelier &bull; Digital Flagship</div>
            </td>
          </tr>
          <tr>
            <td class="body">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p style="margin:0 0 8px 0;">All garments are subject to archival care standards.</p>
              <p style="margin:0;">&copy; ${new Date().getFullYear()} The Curator. Paris &bull; Milan &bull; New York. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export interface OrderConfirmationItem {
  name?: string;
  title?: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface OrderConfirmationPayload {
  to: string;
  orderNumber: string;
  customerName?: string;
  items: OrderConfirmationItem[];
  subtotal?: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  total: number;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

export const sendOrderConfirmationEmail = async (
  data: OrderConfirmationPayload
) => {
  const shortOrder = data.orderNumber.slice(-8).toUpperCase();
  const greeting = data.customerName
    ? `Dear ${data.customerName},`
    : "Dear Client,";

  const itemsRows = data.items
    .map((item) => {
      const name = item.name || item.title || "Archival Garment";
      const variantInfo = [
        item.size ? `Size: ${item.size}` : "",
        item.color ? `Color: ${item.color}` : "",
      ]
        .filter(Boolean)
        .join(" &bull; ");

      return `
        <tr>
          <td>
            <div style="font-weight:600;color:#09090b;">${name}</div>
            ${variantInfo ? `<div style="font-size:11px;color:#71717a;margin-top:2px;">${variantInfo}</div>` : ""}
          </td>
          <td align="center" style="color:#71717a;">${item.quantity}</td>
          <td align="right" style="font-weight:600;color:#09090b;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  const content = `
    <h2 class="title">Order Confirmed</h2>
    <p class="subtitle">
      ${greeting}<br/>
      Thank you for shopping with The Curator. Your archival acquisition is being prepared with exceptional care.
    </p>

    <div style="background-color:#fcfcfd;border:1px solid #e4e4e7;border-radius:6px;padding:16px;margin-bottom:24px;">
      <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#a1a1aa;margin-bottom:4px;">Order Reference</div>
      <div style="font-size:15px;font-weight:700;color:#09090b;letter-spacing:0.05em;">#${shortOrder}</div>
    </div>

    <table class="table-item">
      <thead>
        <tr>
          <th>Acquisition</th>
          <th align="center">Qty</th>
          <th align="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <table style="width:100%;margin-top:16px;border-top:1px solid #e4e4e7;padding-top:16px;font-size:12px;">
      ${data.subtotal !== undefined ? `<tr><td style="color:#71717a;padding:4px 0;">Subtotal</td><td align="right" style="font-weight:500;">$${data.subtotal.toFixed(2)}</td></tr>` : ""}
      ${data.discount ? `<tr><td style="color:#16a34a;padding:4px 0;">Promotional Discount</td><td align="right" style="color:#16a34a;font-weight:500;">-$${data.discount.toFixed(2)}</td></tr>` : ""}
      ${data.shipping !== undefined ? `<tr><td style="color:#71717a;padding:4px 0;">White-Glove Shipping</td><td align="right" style="font-weight:500;">${data.shipping === 0 ? "Complimentary" : `$${data.shipping.toFixed(2)}`}</td></tr>` : ""}
      ${data.tax !== undefined && data.tax > 0 ? `<tr><td style="color:#71717a;padding:4px 0;">Estimated Taxes</td><td align="right" style="font-weight:500;">$${data.tax.toFixed(2)}</td></tr>` : ""}
      <tr>
        <td style="font-size:14px;font-weight:700;color:#09090b;padding-top:12px;border-top:1px solid #e4e4e7;">Total Settled</td>
        <td align="right" style="font-size:16px;font-weight:900;color:#09090b;padding-top:12px;border-top:1px solid #e4e4e7;">$${data.total.toFixed(2)}</td>
      </tr>
    </table>

    ${
      data.shippingAddress
        ? `
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f4f4f5;">
        <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#a1a1aa;margin-bottom:6px;">Delivery Destination</div>
        <div style="font-size:12px;color:#3f3f46;line-height:1.6;">
          ${data.shippingAddress.street || ""}<br/>
          ${data.shippingAddress.city || ""}, ${data.shippingAddress.state || ""} ${data.shippingAddress.zip || ""}<br/>
          ${data.shippingAddress.country || ""}
        </div>
      </div>
    `
        : ""
    }
  `;

  const html = renderEmailShell(
    `Order Confirmation #${shortOrder}`,
    `Your order #${shortOrder} has been received and confirmed.`,
    content
  );

  await sendEmail(
    data.to,
    `Order Confirmation #${shortOrder} — The Curator`,
    html
  );
};

export interface ShippingNotificationPayload {
  to: string;
  orderNumber: string;
  customerName?: string;
  carrier?: string;
  trackingNumber: string;
}

export const sendShippingNotificationEmail = async (
  data: ShippingNotificationPayload
) => {
  const shortOrder = data.orderNumber.slice(-8).toUpperCase();
  const carrier = data.carrier || "DHL Express";
  const greeting = data.customerName
    ? `Dear ${data.customerName},`
    : "Dear Client,";

  const carrierLower = carrier.toLowerCase();
  let trackingUrl = `https://track.aftership.com/${data.trackingNumber}`;
  if (carrierLower.includes("dhl")) {
    trackingUrl = `https://www.dhl.com/en/express/tracking.html?AWB=${data.trackingNumber}`;
  } else if (carrierLower.includes("fedex")) {
    trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${data.trackingNumber}`;
  } else if (carrierLower.includes("ups")) {
    trackingUrl = `https://www.ups.com/track?tracknum=${data.trackingNumber}`;
  } else if (carrierLower.includes("aramex")) {
    trackingUrl = `https://www.aramex.com/track/results?shipmentNumber=${data.trackingNumber}`;
  }

  const content = `
    <h2 class="title">Your Acquisition Has Shipped</h2>
    <p class="subtitle">
      ${greeting}<br/>
      We are delighted to inform you that order <strong>#${shortOrder}</strong> has been carefully inspected and released for white-glove transit.
    </p>

    <div style="background-color:#09090b;border-radius:8px;padding:24px;text-align:center;color:#ffffff;margin:24px 0;">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.25em;color:#a1a1aa;text-transform:uppercase;">
        ${carrier} &bull; Waybill Number
      </div>
      <div style="font-size:20px;font-weight:900;letter-spacing:0.1em;color:#ffffff;margin:10px 0;">
        ${data.trackingNumber}
      </div>
      <a href="${trackingUrl}" class="cta-button" target="_blank" rel="noopener noreferrer" style="background-color:#ffffff;color:#09090b !important;margin:8px 0 0 0;">
        Track Waybill Live &rarr;
      </a>
    </div>

    <p style="font-size:12px;color:#71717a;line-height:1.6;margin-top:24px;">
      Transit times vary based on customs release. Should you require bespoke delivery instructions or signature scheduling, please contact your concierge directly.
    </p>
  `;

  const html = renderEmailShell(
    `Order Shipped #${shortOrder}`,
    `Order #${shortOrder} is in transit with ${carrier}.`,
    content
  );

  await sendEmail(
    data.to,
    `Your Order #${shortOrder} Has Shipped — The Curator`,
    html
  );
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  const content = `
    <h2 class="title">Welcome to The Curator</h2>
    <p class="subtitle">
      Dear ${name || "Client"},<br/>
      We are honored to welcome you into our private circle of collectors and connoisseurs of enduring design.
    </p>

    <div style="border-left:2px solid #09090b;padding-left:16px;margin:24px 0;">
      <p style="font-style:italic;font-size:13px;color:#3f3f46;margin:0 0 6px 0;">
        &ldquo;Enduring design is not about novelty; it is about timeless structural balance and noble materials.&rdquo;
      </p>
      <span style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#a1a1aa;">Atelier Direction</span>
    </div>

    <p style="font-size:12px;color:#71717a;line-height:1.6;">
      As an account holder, you enjoy early reservations on seasonal capsule releases, biometric sizing consultations, and archived collection tracking.
    </p>

    <div style="text-align:center;margin-top:28px;">
      <a href="${env.CLIENT_URL || "https://thecurator.com"}/products" class="cta-button">
        Explore Flagship Archive &rarr;
      </a>
    </div>
  `;

  const html = renderEmailShell(
    "Welcome to The Curator",
    "Welcome to The Curator Atelier. Discover timeless archival design.",
    content
  );

  await sendEmail(to, "Welcome to The Curator Atelier", html);
};

export const sendOrderProcessingEmail = async (data: {
  to: string;
  orderNumber: string;
  customerName?: string;
  itemsCount?: number;
}) => {
  const shortOrder = data.orderNumber.slice(-8).toUpperCase();
  const greeting = data.customerName
    ? `Dear ${data.customerName},`
    : "Dear Client,";

  const content = `
    <h2 class="title">Atelier Preparing Your Acquisition</h2>
    <p class="subtitle">
      ${greeting}<br/>
      Your acquisition for Order #${shortOrder} has cleared verification and is currently being inspected, curated, and prepared for dispatch.
    </p>

    <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:20px;margin:24px 0;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#71717a;margin-bottom:6px;">
        Curatorial Inspection
      </div>
      <p style="font-size:13px;color:#27272a;margin:0 0 12px 0;">
        Each garment is steamed, hand-inspected for textile fidelity, and packed inside our custom archival garment packaging.
      </p>
      <div style="font-size:12px;font-weight:600;color:#09090b;">
        Order Reference: #${shortOrder}
      </div>
    </div>

    <p style="font-size:12px;color:#71717a;line-height:1.6;">
      Once our logistics courier verifies customs departure, you will receive an automated waybill notification with real-time tracking coordinates.
    </p>

    <div style="text-align:center;margin-top:28px;">
      <a href="${env.CLIENT_URL || "https://thecurator.com"}/account/orders" class="cta-button">
        View Order Status &rarr;
      </a>
    </div>
  `;

  const html = renderEmailShell(
    `Order #${shortOrder} Processing`,
    `Order #${shortOrder} is in curatorial preparation.`,
    content
  );

  await sendEmail(
    data.to,
    `Your Order #${shortOrder} is Being Prepared — The Curator`,
    html
  );
};

export const sendOrderDeliveredEmail = async (data: {
  to: string;
  orderNumber: string;
  customerName?: string;
}) => {
  const shortOrder = data.orderNumber.slice(-8).toUpperCase();
  const greeting = data.customerName
    ? `Dear ${data.customerName},`
    : "Dear Client,";

  const content = `
    <h2 class="title">Acquisition Delivered</h2>
    <p class="subtitle">
      ${greeting}<br/>
      Carrier delivery coordinates confirm Order #${shortOrder} has safely arrived at your destination.
    </p>

    <div style="background:#09090b;border-radius:12px;padding:24px;margin:24px 0;text-align:center;color:#ffffff;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#a1a1aa;margin-bottom:8px;">
        Archival Garment Care
      </div>
      <p style="font-size:13px;color:#e4e4e7;line-height:1.6;margin:0 0 16px 0;">
        We recommend allowing tailored pieces to rest on wide cedar shoulders for 12 hours after unboxing to allow luxury fibers to breathe.
      </p>
      <a href="${env.CLIENT_URL || "https://thecurator.com"}/account/orders" class="cta-button" style="background:#ffffff;color:#09090b !important;">
        Inspect Order &amp; Share Critique &rarr;
      </a>
    </div>

    <p style="font-size:12px;color:#71717a;line-height:1.6;">
      Should there be any discrepancy with packaging integrity or fit, please notify our client relations team within 7 days.
    </p>
  `;

  const html = renderEmailShell(
    `Order Delivered #${shortOrder}`,
    `Order #${shortOrder} has been safely delivered.`,
    content
  );

  await sendEmail(
    data.to,
    `Delivered: Order #${shortOrder} — The Curator`,
    html
  );
};

export const sendOrderCancelledEmail = async (data: {
  to: string;
  orderNumber: string;
  customerName?: string;
  reason?: string;
}) => {
  const shortOrder = data.orderNumber.slice(-8).toUpperCase();
  const greeting = data.customerName
    ? `Dear ${data.customerName},`
    : "Dear Client,";

  const content = `
    <h2 class="title">Order Cancelled</h2>
    <p class="subtitle">
      ${greeting}<br/>
      Order #${shortOrder} has been cancelled.
    </p>

    <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:20px;margin:24px 0;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#71717a;margin-bottom:6px;">
        Cancellation Details
      </div>
      <p style="font-size:13px;color:#27272a;margin:0 0 10px 0;">
        ${data.reason ? `Reason: ${data.reason}` : "Your order was cancelled per client or inventory request."}
      </p>
      <p style="font-size:12px;color:#71717a;margin:0;">
        Any pre-authorized funds or charges have been released or refunded back to your original payment method. Please allow 3-5 business days for bank processing.
      </p>
    </div>

    <p style="font-size:12px;color:#71717a;line-height:1.6;">
      If you believe this cancellation was made in error or would like assistance finding alternative archival pieces, our concierge is at your service.
    </p>
  `;

  const html = renderEmailShell(
    `Order Cancelled #${shortOrder}`,
    `Order #${shortOrder} has been cancelled.`,
    content
  );

  await sendEmail(
    data.to,
    `Order #${shortOrder} Cancellation Notice — The Curator`,
    html
  );
};
