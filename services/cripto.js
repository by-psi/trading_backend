/**
 * cripto.js
 */

const axios = require("axios");

async function getPrices() {
	try {
		const response = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
		return [{ symbol: "BTCUSDT", price: response.data.price }];
	} catch (error) {
		console.error("Erro ao obter preço da Binance:", error);
		return [];
	}
}

module.exports = { getPrices };
