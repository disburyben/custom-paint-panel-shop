console.log("Start debugging imports...");
try {
    await import("dotenv/config");
    console.log("dotenv loaded");
    await import("express");
    console.log("express loaded");
    await import("http");
    console.log("http loaded");
    await import("net");
    console.log("net loaded");
    await import("cookie-parser");
    console.log("cookie-parser loaded");
    await import("@trpc/server/adapters/express");
    console.log("trpc express adapter loaded");
    await import("./server/_core/oauth.ts");
    console.log("oauth loaded");
    await import("./server/_core/context.ts");
    console.log("context loaded");
    await import("./server/_core/vite.ts");
    console.log("vite loaded");
    await import("./server/seedGallery.ts");
    console.log("seedGallery loaded");
    await import("./server/routers.ts");
    console.log("appRouter loaded");
} catch (e) {
    console.error("Import failed:", e);
}
console.log("Finished debugging imports.");
