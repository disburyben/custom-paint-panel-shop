console.log("Checking critical dependencies...");

async function check(name) {
    try {
        await import(name);
        console.log(`✅ ${name} is installed`);
    } catch (e) {
        console.error(`❌ ${name} is MISSING`);
    }
}

async function run() {
    await check("express");
    await check("zod");
    await check("drizzle-orm");
    await check("jose");
    await check("cookie-parser");
    await check("@trpc/server");
    await check("better-sqlite3");
    await check("dotenv");
}

run();
