/**
 * cripto-bot.js
 */

async function getAndSendPricesByTelegram() {
	const { getPrices } = require('./services/cripto');
	const { sendTelegramMessage } = require('./services/telegram');

	const prices = await getPrices();
	const message = prices.map(price => `${price.symbol}: ${price.price}`).join('\n');

	await sendTelegramMessage(message);
}

async function start() {
	const data = await getAndSendPricesByTelegram("https://api.binance.com");
	console.log("Price now: " + data.price);

	const BUY_PRICE = 60000;

	if (data.price <= BUY_PRICE) 
		await buy("BTCUSDT");
	else if (data.price >= (BUY_PRICE * 1.1)) 
		await sell("BTCUSDT");
	else
		console.log("Wait...");

	setInterval(start, 3000);
}
