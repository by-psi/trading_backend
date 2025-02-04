/**
 * bot.js
 */

const { getPrices } = require("./cripto");
const { sendTelegramMessage } = require("./telegram");

let autoTradeInterval;
let sendAlertInterval;

async function monitorPrices(autoTrade) {
	const prices = await getPrices();
	const BTC_PRICE = parseFloat(prices[0].price);
	const BUY_PRICE = 94000;
	const SELL_PRICE = BUY_PRICE * 1.1;

	if (autoTrade) {
		if (BTC_PRICE <= BUY_PRICE) {
			console.log("Comprar BTCUSDT");
			// Aqui entraria a lógica de compra
		} else if (BTC_PRICE >= SELL_PRICE) {
			console.log("Vender BTCUSDT");
			// Aqui entraria a lógica de venda
		} else {
			console.log("Aguardando melhor preço...");
		}
	}

	return prices;
}

async function startMonitoring(autoTrade) {
	if (autoTradeInterval) clearInterval(autoTradeInterval);

	autoTradeInterval = setInterval(() => monitorPrices(autoTrade), 3000);
	console.log("Monitoramento automático iniciado...");
}

async function startSendingAlerts() {
	if (sendAlertInterval) clearInterval(sendAlertInterval);

	sendAlertInterval = setInterval(async () => {
		const prices = await getPrices();
		const message = prices.map(price => `${price.symbol}: $${price.price}`).join("\n");
		await sendTelegramMessage(message);
	}, 300000);

	console.log("Envio de alertas para Telegram iniciado...");
}

async function stopAllServices() {
	clearInterval(autoTradeInterval);
	clearInterval(sendAlertInterval);
	console.log("Todos os serviços parados.");
}

module.exports = { startMonitoring, startSendingAlerts, stopAllServices };

