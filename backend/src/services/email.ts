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
    await transporter.sendMail({
      from: `"Fashion Store" <${env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error("Error sending email:", { error });
  }
};

export const sendOrderConfirmationEmail = async ({
  to,
  orderNumber,
  items,
  total,
}: {
  to: string;
  orderNumber: string;
  items: any[];
  total: number;
}) => {
  const html = `
    <h1>Order Confirmation</h1>
    <p>Thank you for your order!</p>
    <p>Order Number: <strong>${orderNumber}</strong></p>
    <p>Total: $${total.toFixed(2)}</p>
    <p>We will notify you when your items ship.</p>
  `;
  await sendEmail(to, "Order Confirmation - Fashion Store", html);
};
