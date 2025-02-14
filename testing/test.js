// const puppeteer = require("puppeteer");
// const cron = require("node-cron");

// async function scrapeData() {
//     console.log("Scraping started at:", new Date().toLocaleString());

//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     try {
//         await page.goto("https://www.godaddy.com/en-in/hosting/web-hosting", { waitUntil: "domcontentloaded" });

//         await page.waitForSelector(".ux-tag.ux-tag-warning", { timeout: 10000 });

//         // Extract only one value (first element)
//         const data = await page.evaluate(() => {
//             const elements = document.querySelectorAll(".ux-tag.ux-tag-warning");
//             return elements.length > 0 ? elements[0].innerText : "No data found";
//         });

//         console.log("Extracted Data:", data);
//     } catch (error) {
//         console.error("Scraping failed:", error);
//     } finally {
//         await browser.close();
//     }
// }

// // Schedule the cron job (Runs every 1 minute)
// cron.schedule("*/1 * * * *", () => {
//     console.log("Running cron job...");
//     scrapeData();
// });

// console.log("Cron job scheduled. Scraper will run every 1 minute.");
console.log("hey");
