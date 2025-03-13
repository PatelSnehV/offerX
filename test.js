const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");

puppeteer.use(StealthPlugin());

// Free Proxy
const PROXY = "3.99.167.1:3128";

// Websites & Selectors
const SITES = [
  {
    name: "Amazon",
    product: "iPhone 15",
    url: "https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX1W1XY/?_encoding=UTF8&ref_=pd_hp_d_atf_ci_mcx_mr_ca_hp_atf_d",
    priceSelector: ".a-price-whole",
  },
  {
    name: "Flipkart",
    product: "iPhone 15",
    url: "https://www.flipkart.com/apple-iphone-15-blue-128-gb/p/itmbf14ef54f645d?pid=MOBGTAGPAQNVFZZY&lid=LSTMOBGTAGPAQNVFZZYQRLPCQ&marketplace=FLIPKART&q=iphone+15&store=tyy%2F4io&srno=s_1_3&otracker=search&otracker1=search&fm=search-autosuggest&iid=40b9980b-5ca7-4dfd-9ccb-4ba8ae9038e6.MOBGTAGPAQNVFZZY.SEARCH&ppt=sp&ppn=sp&ssid=aotg4xtdxc0000001739786887903&qH=2f54b45b321e3ae5",
    priceSelector: "div._30jeq3._16Jk6d",
  },
];

// Save data to a separate JSON file for each site
function savePriceData(site, price) {
  const filePath = `${site.name.toLowerCase()}_prices.json`; // Example: amazon_prices.json
  const data = {
    platform: site.name,
    product: site.product,
    url: site.url,
    price,
    lastUpdated: new Date().toLocaleString(),
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// Scraping Function
async function scrapeSite(site) {
  console.log(`🔍 Scraping ${site.product} on ${site.name} using Proxy ${PROXY}...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--proxy-server=http://${PROXY}`, // Set the proxy
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });

  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    );

    await page.goto(site.url, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for price element
    await page.waitForSelector(site.priceSelector, { timeout: 15000 });

    // Extract price
    const price = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      return element ? element.innerText.replace(/[^\d]/g, "") : null;
    }, site.priceSelector);

    if (!price) {
      console.error(`❌ Price not found for ${site.product} on ${site.name}`);
      return;
    }

    console.log(`✅ ${site.product} on ${site.name}: ₹${price}`);
    savePriceData(site, price);
  } catch (error) {
    console.error(`❌ Error scraping ${site.product} on ${site.name}:`, error);
  } finally {
    await browser.close();
  }
}

// Run Scraper
async function scrapeAllSites() {
  console.log("🚀 Starting Web Scraping with Proxy...");
  for (const site of SITES) {
    await scrapeSite(site);
  }
  console.log("✅ Scraping completed! Data saved in separate JSON files.");
}

scrapeAllSites();
