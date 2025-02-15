const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cron = require("node-cron");
const fs = require("fs");

// Enable stealth mode to bypass detection
puppeteer.use(StealthPlugin());

// Platform details with their logos
const PLATFORM_DETAILS = {
    "Amazon": { "logo": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    "Flipkart": { "logo": "https://upload.wikimedia.org/wikipedia/commons/0/02/Flipkart_logo.png" },
    "Vijay Sales": { "logo": "https://www.vijaysales.com/assets/images/vs-logo.svg" }
};

// Scraping functions for each platform
async function scrapeAmazon() {
    await scrapeData(
        "https://www.amazon.in/s?k=i+phone+15", 
        ".a-price-whole", 
        "amazon.json", 
        "Amazon"
    );
}

async function scrapeFlipkart() {
    await scrapeData(
        "https://www.flipkart.com/apple-iphone-15-blue-128-gb/p/itmbf14ef54f645d?pid=MOBGTAGPAQNVFZZY", 
        ".Nx9bqj.CxhGGd", 
        "flipkart.json", 
        "Flipkart"
    );
}

async function scrapeVijaySales() {
    await scrapeData(
        "https://www.vijaysales.com/search/i-phone-15", 
        ".product-price", 
        // ".product__price--discount-label", 
        "vijaysales.json", 
        "Vijay Sales"
    );
}

// Generic function to scrape product data
async function scrapeData(url, priceSelector, offerSelector, filePath, platform) {
    console.log(`Scraping started for ${platform} at:`, new Date().toLocaleString());
    
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    try {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.0.0 Safari/537.36");
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(url, { waitUntil: "domcontentloaded" });
        
        await page.waitForSelector(priceSelector, { timeout: 10000 });
        const price = await page.evaluate(selector => {
            const el = document.querySelector(selector);
            return el ? el.innerText.replace(/[^\d]/g, "") : "No price found";
        }, priceSelector);
        
        // let offer = "No offer available";
        // try {
        //     await page.waitForSelector(offerSelector, { timeout: 5000 });
        //     offer = await page.evaluate(selector => {
        //         const el = document.querySelector(selector);
        //         return el ? el.innerText.trim() : "No offer available";
        //     }, offerSelector);
        // } catch (error) {
        //     console.log(`Offer not found via selector for ${platform}, trying alternative method...`);
        //     offer = await page.evaluate(() => {
        //         let textElements = [...document.querySelectorAll("span, div")].map(el => el.innerText);
        //         return textElements.find(text => text.includes("%")) || "No offer available";
        //     });
        // }
        
        console.log(`Extracted Price from ${platform}:`, price);
        // console.log(`Extracted Offer from ${platform}:`, offer);
        saveOrUpdateJSON(filePath, platform, price,);
    } catch (error) {
        console.error(`Scraping failed for ${platform}:`, error);
    } finally {
        await browser.close();
    }
}

// Function to update JSON file with platform details
function saveOrUpdateJSON(filePath, platform, price, offer) {
    const platformLogo = PLATFORM_DETAILS[platform]?.logo || "";
    let data = { platform, logo: platformLogo, product: "iPhone 15", lastUpdated: new Date().toLocaleString(), price, offer };
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`Saved data to ${filePath}`);
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
