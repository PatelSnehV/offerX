const fs = require("fs");
const path = require("path");

// Get all JSON files from the current directory
const jsonFiles = fs.readdirSync(__dirname).filter(file => file.endsWith(".json"));

// Function to read and extract price
function getPrice(filePath) {
    try {
        const rawData = fs.readFileSync(filePath, "utf8");
        const data = JSON.parse(rawData);

        if (!data.price) {
            console.error(`⚠️ Missing 'price' field in ${filePath}`);
            return Infinity;
        }

        const price = parseInt(data.price.toString().replace(/\D/g, ""), 10);

        if (isNaN(price)) {
            console.error(`⚠️ Invalid price format in ${filePath}:`, data.price);
            return Infinity;
        }

        return price;
    } catch (error) {
        console.error(`❌ Error reading ${filePath}:`, error.message);
        return Infinity;
    }
}

// Get prices from all JSON files
const prices = jsonFiles.map(file => ({
    platform: path.basename(file, ".json"),
    price: getPrice(file),
}));

// Find the lowest price
const lowest = prices.reduce((min, current) => (current.price < min.price ? current : min), prices[0]);

// Output comparison
console.log("\n🛒 Price Comparison:");
console.table(prices);
console.log(`\n💰 Lowest Price: ${lowest.platform} - ₹${lowest.price}`);
