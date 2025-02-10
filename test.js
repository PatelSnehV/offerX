const fetch = require("node-fetch"); // Import fetch for Node.js <18

const API_URL = "https://api.example.com/deals";

async function getOffers() {
  const response = await fetch(API_URL);
  const data = await response.json();
  console.log(data);
}

getOffers();

