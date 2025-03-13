const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");

puppeteer.use(StealthPlugin());

const SITES = [
  {
    name: "Amazon",
    product: "iPhone 15",
    url: "https://www.amazon.in/dp/B0CHX2QMPQ",
    priceSelector: ".a-price-whole",
  },
  {
    name: "Flipkart",
    product: "iPhone 15",
    url: "https://www.flipkart.com/apple-iphone-15/p/itm2baef2216a242",
    priceSelector: "div._30jeq3._16Jk6d",
  },
];

async function scrapeSite(site) {
  console.log(`🔍 Scraping ${site.product} on ${site.name}...`);

  const browser = await puppeteer.launch({ headless: false, args: ["--no-sandbox"] }); // Open browser for debugging
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    );

    await page.goto(site.url, { waitUntil: "networkidle2", timeout: 60000 });

    // Save page content for debugging
    const pageContent = await page.content();
    fs.writeFileSync(`debug_${site.name}.html`, pageContent);

    // Capture all selectors on the page for debugging
    const allElements = await page.evaluate(() => {
      return [...document.querySelectorAll("*")].map(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        text: el.innerText.slice(0, 50)
      }));
    });

    fs.writeFileSync(`debug_selectors_${site.name}.json`, JSON.stringify(allElements, null, 2));

    await page.waitForSelector(site.priceSelector, { timeout: 10000 });

    // Alternative price extraction
    const price = await page.evaluate(() => {
      const possibleSelectors = [
        ".a-price-whole", // Amazon
        "div._30jeq3._16Jk6d", // Flipkart
        ".price", // Alternate
        ".final-price", // Alternate
      ];

      for (let selector of possibleSelectors) {
        let element = document.querySelector(selector);
        if (element) return element.innerText.replace(/[^\d]/g, "");
      }
      return null;
    });

    if (!price) {
      console.error(`❌ Price not found for ${site.product} on ${site.name}`);
      return;
    }

    console.log(`✅ ${site.product} on ${site.name}: ₹${price}`);
  } catch (error) {
    console.error(`❌ Error scraping ${site.product} on ${site.name}:`, error);
  } finally {
    await browser.close();
  }
}

async function scrapeAllSites() {
  console.log("🚀 Starting Web Scraping...");
  for (const site of SITES) {
    await scrapeSite(site);
  }
  console.log("✅ Scraping completed!");
}

scrapeAllSites();
