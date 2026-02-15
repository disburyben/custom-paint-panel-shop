// This file is the Vercel serverless function entry point.
// The actual Express app is bundled into handler.js by esbuild during build.
// We re-export it here so Vercel can detect and compile this simple stub,
// while all imports are already resolved in the bundled handler.
export { default } from "./handler.js";
