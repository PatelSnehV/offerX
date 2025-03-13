const express = require('express');
const fs = require('fs');
const cron = require('node-cron');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());

// Paths to JSON files (mapped to platform names)
const FILES = {
    "amazon.json": "Amazon",
    "flipkart.json": "Flipkart",
    "vijay-sales.json": "Vijay Sales"
};
// const path = require('path');

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend at /deals route
app.get('/deals', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Function to read and merge JSON data with platform names
function getMergedOffers() {
    let offers = [];
    
    Object.entries(FILES).forEach(([file, platform]) => {
        try {
            const filePath = path.join(__dirname, file);
            const data = fs.readFileSync(filePath, 'utf-8');
            let jsonData = JSON.parse(data);

            // ✅ Ensure jsonData is an array
            if (!Array.isArray(jsonData)) {
                jsonData = [jsonData]; // Convert object to array
            }

            // ✅ Add platform name to each offer
            jsonData.forEach(offer => {
                offer.platform = platform;
            });

            offers = offers.concat(jsonData);
        } catch (error) {
            console.error(`Error reading ${file}:`, error.message);
        }
    });

    return offers;
}

// Function to find the lowest price, savings & platform name
function findBestDeal() {
    const offers = getMergedOffers();
    if (offers.length === 0) return null;

    const lowestOffer = offers.reduce((min, current) => (current.price < min.price ? current : min));
    const highestPrice = Math.max(...offers.map(offer => offer.price));
    const savings = highestPrice - lowestOffer.price;

    return { 
        lowestPrice: lowestOffer.price, 
        savings,
        platform: lowestOffer.platform,  // ✅ Correct platform from file mapping
        url: lowestOffer.url || "https://www.amazon.in/s?k=i+phone+15" // ✅ URL fallback if missing
    };
}

// API Endpoint to return required data
app.get('/get-lowest-price', (req, res) => {
    const bestDeal = findBestDeal();
    if (!bestDeal) {
        return res.status(500).json({ error: "No data available. Try again later." });
    }
    res.json(bestDeal);
});
//Simulated cron job to update JSONs every hour (Replace with actual scraping cron job)
// cron.schedule('0 * * * *', () => {
//     console.log("✅ JSON files updated via cron job!");
// });


app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
