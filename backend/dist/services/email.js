"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOrderConfirmationEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const validateEnv_1 = require("../utils/validateEnv");
const logger_1 = __importDefault(require("../utils/logger"));
const transporter = nodemailer_1.default.createTransport({
    host: validateEnv_1.env.EMAIL_HOST,
    port: parseInt(validateEnv_1.env.EMAIL_PORT || "587"),
    secure: validateEnv_1.env.EMAIL_SECURE === "true",
    auth: {
        user: validateEnv_1.env.EMAIL_USER,
        pass: validateEnv_1.env.EMAIL_PASS,
    },
});
const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"Fashion Store" <${validateEnv_1.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        logger_1.default.info(`Email sent to ${to}`);
    }
    catch (error) {
        logger_1.default.error("Error sending email:", { error });
    }
};
exports.sendEmail = sendEmail;
const sendOrderConfirmationEmail = async ({ to, orderNumber, items, total, }) => {
    const html = `
    <h1>Order Confirmation</h1>
    <p>Thank you for your order!</p>
    <p>Order Number: <strong>${orderNumber}</strong></p>
    <p>Total: $${total.toFixed(2)}</p>
    <p>We will notify you when your items ship.</p>
  `;
    await (0, exports.sendEmail)(to, "Order Confirmation - Fashion Store", html);
};
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
