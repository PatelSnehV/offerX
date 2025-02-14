const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cron = require("node-cron");
const fs = require("fs");

// Enable stealth mode to bypass detection
puppeteer.use(StealthPlugin());

async function scrapeAmazon() {
    await scrapeData("https://www.amazon.in/s?k=i+phone+15", ".a-price-whole", "amazon.json", "Amazon");
}

async function scrapeFlipkart() {
    await scrapeData("https://www.flipkart.com/apple-iphone-15-blue-128-gb/p/itmbf14ef54f645d?pid=MOBGTAGPAQNVFZZY", ".Nx9bqj.CxhGGd", "flipkart.json", "Flipkart");
}

async function scrapeVijaySales() {
    await scrapeData("https://www.vijaysales.com/search/i-phone-15", ".product-price", "vijaysales.json", "Vijay Sales");
}

async function scrapeData(url, selector, filePath, platform) {
    console.log(`Scraping started for ${platform} at:`, new Date().toLocaleString());

    const browser = await puppeteer.launch({ 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();

    try {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.0.0 Safari/537.36");
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(url, { waitUntil: "networkidle2" });

        await page.waitForSelector(selector, { timeout: 10000 });
        const price = await page.evaluate((selector) => {
            const priceElement = document.querySelector(selector);
            return priceElement ? priceElement.innerText.replace(/[^\d]/g, "") : "No price found";
        }, selector);

        console.log(`Extracted Price from ${platform}:`, price);
        saveOrUpdateJSON(filePath, platform, price);
    } catch (error) {
        console.error(`Scraping failed for ${platform}:`, error);
    } finally {
        await browser.close();
    }
}

function saveOrUpdateJSON(filePath, platform, price) {
    let data = { platform, product: "iPhone 15", lastUpdated: new Date().toLocaleString(), price };

    if (fs.existsSync(filePath)) {
        let existingData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        if (existingData.price !== price) {
            existingData.price = price;
            existingData.lastUpdated = new Date().toLocaleString();
            fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), "utf8");
            console.log(`Updated price in ${filePath}`);
        } else {
            console.log(`Price remains the same in ${filePath}. No update needed.`);
        }
    } else {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
        console.log(`Created ${filePath} with initial data`);
    }
}

// Run all scrapers on startup
scrapeAmazon();
scrapeFlipkart();
scrapeVijaySales();

// Schedule cron jobs to run every 1 minute
cron.schedule("*/1 * * * *", () => {
    console.log("Running cron job...");
    scrapeAmazon();
    scrapeFlipkart();
    scrapeVijaySales();
});

console.log("Cron job scheduled. Scrapers will run every 1 minute.");
