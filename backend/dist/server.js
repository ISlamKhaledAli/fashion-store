"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
exports.startServer = startServer;
require("dotenv/config");
const validateEnv_1 = require("./utils/validateEnv");
const prisma_1 = require("./lib/prisma");
// Call validation immediately before anything else
(0, validateEnv_1.validateEnv)();
const app_module_1 = __importDefault(require("./app.module"));
exports.app = app_module_1.default;
const logger_1 = __importDefault(require("./utils/logger"));
const PORT = validateEnv_1.env.PORT || 5000;
async function startServer() {
    try {
        await prisma_1.prisma.$connect();
        logger_1.default.info("✅ Database connected successfully");
        return app_module_1.default.listen(PORT, () => {
            logger_1.default.info(`🚀 Server running on port ${PORT} in ${validateEnv_1.env.NODE_ENV} mode`);
        });
    }
    catch (error) {
        logger_1.default.error("❌ Database connection failed:", { error });
        process.exit(1);
    }
}
if (require.main === module) {
    void startServer();
}
