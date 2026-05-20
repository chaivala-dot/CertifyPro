"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("../db.js");
const password_js_1 = require("../utils/password.js");
async function main() {
    const email = "admin@certifypro.com";
    const password = "password";
    const existing = await db_js_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`User with email ${email} already exists (id=${existing.id}).`);
        return;
    }
    const passwordHash = (0, password_js_1.hashPassword)(password);
    const user = await db_js_1.prisma.user.create({
        data: {
            email,
            name: "Admin User",
            passwordHash,
        },
    });
    console.log("Created admin user:", {
        id: user.id,
        email: user.email,
        name: user.name,
    });
}
main()
    .catch((err) => {
    console.error("Failed to seed admin user:", err);
    process.exitCode = 1;
})
    .finally(async () => {
    await db_js_1.prisma.$disconnect();
});
//# sourceMappingURL=seedAdmin.js.map