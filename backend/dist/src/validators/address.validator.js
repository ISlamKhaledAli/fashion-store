"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressSchema = void 0;
const zod_1 = require("zod");
exports.addressSchema = zod_1.z.object({
    label: zod_1.z.string().optional(),
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    street: zod_1.z.string().min(1, "Street is required"),
    apartment: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1, "City is required"),
    state: zod_1.z.string().min(1, "State is required"),
    zip: zod_1.z.string().min(1, "Zip code is required"),
    country: zod_1.z.string().min(1, "Country is required"),
    isDefault: zod_1.z.boolean().default(false),
});
