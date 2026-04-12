"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const errorHandler_1 = require("./middleware/errorHandler");
const httpLogger_1 = __importDefault(require("./middleware/httpLogger"));
const rateLimit_1 = require("./middleware/rateLimit");
const validateEnv_1 = require("./utils/validateEnv");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const brand_routes_1 = __importDefault(require("./routes/brand.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const wishlist_routes_1 = __importDefault(require("./routes/wishlist.routes"));
const address_routes_1 = __importDefault(require("./routes/address.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const discount_routes_1 = __importDefault(require("./routes/discount.routes"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use(httpLogger_1.default); // Request logging
app.use((0, cors_1.default)({
    origin: validateEnv_1.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
// Payment webhook needs raw body — mount BEFORE json middleware
app.use("/api/payment", payment_routes_1.default);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
app.use("/api", rateLimit_1.generalRateLimit);
// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ success: true, message: "Server is healthy" });
});
// Routes initialization
app.use("/api/auth", auth_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/brands", brand_routes_1.default);
app.use("/api/cart", cart_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/wishlist", wishlist_routes_1.default);
app.use("/api/addresses", address_routes_1.default);
app.use("/api/upload", upload_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/discounts", discount_routes_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
exports.default = app;
