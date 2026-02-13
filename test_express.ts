console.log("Starting...");
(async () => {
    console.log("Importing express...");
    const express = (await import("express")).default;
    console.log("Express imported.");
    const app = express();
    console.log("App created.");
})();
