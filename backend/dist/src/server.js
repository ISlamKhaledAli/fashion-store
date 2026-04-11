"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const validateEnv_1 = require("./utils/validateEnv");
// Call validation immediately before anything else
(0, validateEnv_1.validateEnv)();
const app_module_1 = __importDefault(require("./app.module"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = __importDefault(require("pg"));
const logger_1 = __importDefault(require("./utils/logger"));
const pool = new pg_1.default.Pool({ connectionString: validateEnv_1.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
exports.prisma = prisma;
const PORT = validateEnv_1.env.PORT || 5000;
async function main() {
    try {
        await prisma.$connect();
        logger_1.default.info("✅ Database connected successfully");
        app_module_1.default.listen(PORT, () => {
            logger_1.default.info(`🚀 Server running on port ${PORT} in ${validateEnv_1.env.NODE_ENV} mode`);
        });
    }
    catch (error) {
        logger_1.default.error("❌ Database connection failed:", { error });
        process.exit(1);
    }
}
main();
